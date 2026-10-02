#!/usr/bin/env node
// Lifecycle hook: surface which project's Claude session is waiting on you.
//
// Registered on SessionStart / UserPromptSubmit / Notification / Stop / SessionEnd,
// it reduces those events to one state per tmux window and publishes it twice:
//
//   1. tmux user options (@claude_state, @claude_at) on the window and its
//      session. The status bar and `hub` read these, so state is visible
//      without stealing focus. This replaces hub's window-activity guess with
//      real lifecycle events.
//   2. a macOS notification, but only when you are NOT already looking at that
//      pane, so the session you're watching never nags you.
//
// Conservative by design: it only ever reports, never blocks, and always
// exits 0 so a broken notifier can't wedge a turn.
//
// Opt out per channel with CLAUDE_NOTIFY_TMUX=0 / CLAUDE_NOTIFY_DESKTOP=0.

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, statSync, truncateSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";

const done = () => process.exit(0);
process.on("uncaughtException", done);

const LOG = join(homedir(), ".claude", "notify.log");
const off = (name) => process.env[name] === "0";

// Which state each event settles the session into. "" clears the marker.
const STATE = {
  SessionStart: "working",
  UserPromptSubmit: "working",
  Notification: "blocked",
  Stop: "done",
  SessionEnd: "",
};

const tmux = (args, capture = false) => {
  try {
    const out = execFileSync("tmux", args, {
      stdio: capture ? ["ignore", "pipe", "ignore"] : "ignore",
      timeout: 2000,
      encoding: "utf8",
    });
    return capture ? String(out).trim() : "";
  } catch {
    return null; // no server, dead pane, missing binary — all non-fatal
  }
};

// Branch without shelling out to git: read .git/HEAD, following worktree files.
const gitBranch = (start) => {
  try {
    let dir = start;
    let gitPath = null;
    for (;;) {
      const p = join(dir, ".git");
      if (existsSync(p)) {
        gitPath = p;
        break;
      }
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
    if (statSync(gitPath).isFile()) {
      const m = readFileSync(gitPath, "utf8").match(/gitdir:\s*(.+)/);
      if (!m) return null;
      gitPath = m[1].trim();
    }
    const head = readFileSync(join(gitPath, "HEAD"), "utf8").trim();
    const ref = head.match(/^ref:\s*refs\/heads\/(.+)$/);
    return ref ? ref[1] : head.slice(0, 7);
  } catch {
    return null;
  }
};

const log = (line) => {
  try {
    // Keep the log from growing without bound.
    if (existsSync(LOG) && statSync(LOG).size > 1_000_000) truncateSync(LOG, 0);
    appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);
  } catch {}
};

// Roll every session's state into one status-bar string. The per-window dot only
// covers the session you're attached to, so this is what tells you a *different*
// project needs you. Blocked outranks done; a session drops off the list as soon
// as it goes back to working.
const publishAlerts = () => {
  const out = tmux(
    ["list-panes", "-a", "-F", "#{session_name}\t#{@claude_state}"],
    true,
  );
  const flagged = new Map();
  for (const line of (out || "").split("\n")) {
    const [sess, state] = line.split("\t");
    if (!sess || (state !== "blocked" && state !== "done")) continue;
    if (flagged.get(sess) !== "blocked") flagged.set(sess, state);
  }
  const rank = (s) => (s === "blocked" ? 0 : 1);
  const text = [...flagged.entries()]
    .sort((a, b) => rank(a[1]) - rank(b[1]) || a[0].localeCompare(b[0]))
    .map(([sess, state]) => `#[fg=${state === "blocked" ? "green" : "cyan"}]● ${sess}`)
    .join(" ");
  tmux(["set-option", "-g", "@claude_alerts", text ? `${text} ` : ""]);
};

// Transient line across the status bar of every attached client, so the alert
// lands on the screen being coded on rather than wherever macOS banners go.
const toast = (text) => {
  if (off("CLAUDE_NOTIFY_TOAST")) return;
  const clients = tmux(["list-clients", "-F", "#{client_name}"], true);
  for (const client of (clients || "").split("\n").filter(Boolean)) {
    tmux(["display-message", "-c", client, "-d", "6000", text]);
  }
};

// macOS banner. Opt-in (CLAUDE_NOTIFY_DESKTOP=1): notifications land on a
// different display than the one being coded on, so tmux is the default channel.
const desktop = (title, subtitle, message) => {
  if (process.env.CLAUDE_NOTIFY_DESKTOP !== "1") return;
  // Distinct sounds so you can tell "needs you" from "finished" without looking.
  const sound = subtitle.includes("needs you") ? "Ping" : "Glass";
  try {
    execFileSync(
      "terminal-notifier",
      ["-title", title, "-subtitle", subtitle, "-message", message, "-sound", sound],
      { stdio: "ignore", timeout: 3000 },
    );
    return;
  } catch {
    /* fall through to osascript, which needs nothing installed */
  }
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  try {
    execFileSync(
      "osascript",
      [
        "-e",
        `display notification "${esc(message)}" with title "${esc(title)}" ` +
          `subtitle "${esc(subtitle)}" sound name "${sound}"`,
      ],
      { stdio: "ignore", timeout: 3000 },
    );
  } catch {}
};

// First meaningful line of a message, stripped of markdown, for the toast body.
const summarize = (text, fallback) => {
  const line = String(text ?? "")
    .split("\n")
    .map((l) => l.replace(/^[#>\-*\s]+/, "").trim())
    .find((l) => l.length > 0);
  if (!line) return fallback;
  return line.length > 110 ? `${line.slice(0, 109)}…` : line;
};

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return done();
  }

  const event = input?.hook_event_name;
  const next = STATE[event];
  if (next === undefined) return done();

  const cwd = input.cwd || process.cwd();
  const repo = basename(cwd);
  const branch = gitBranch(cwd);
  const label = branch ? `${repo} (${branch})` : repo;

  // Where are we, and is he already looking at it?
  const pane = process.env.TMUX_PANE;
  let prev = null;
  let looking = false;
  let session = null;
  let window = null;

  if (pane && process.env.TMUX && !off("CLAUDE_NOTIFY_TMUX")) {
    const info = tmux(
      [
        "display-message", "-p", "-t", pane,
        "#{session_name}\t#{window_id}\t#{@claude_state}\t" +
          "#{session_attached}\t#{window_active}\t#{pane_active}",
      ],
      true,
    );
    if (info) {
      const [s, w, state, attached, winActive, paneActive] = info.split("\t");
      session = s || null;
      window = w || null;
      prev = state || null;
      looking = attached !== "0" && winActive === "1" && paneActive === "1";
    }
  }

  // Window scope only. tmux resolves #{@user} pane, then window, then session,
  // so a session-level copy would leak this window's dot onto every sibling
  // window in the status bar. `hub` reads the window value directly.
  if (window) {
    const now = Math.floor(Date.now() / 1000);
    if (next === "") {
      tmux(["set-option", "-w", "-t", window, "-u", "@claude_state"]);
      tmux(["set-option", "-w", "-t", window, "-u", "@claude_at"]);
    } else {
      tmux(["set-option", "-w", "-t", window, "@claude_state", next]);
      tmux(["set-option", "-w", "-t", window, "@claude_at", String(now)]);
    }
    publishAlerts();
    tmux(["refresh-client", "-S"]); // repaint the status bar immediately
  }

  // Only these two states mean "your turn". Skip the toast if the state didn't
  // change (repeated idle prompts) or if he's already sitting in that pane.
  const wantsYou = next === "blocked" || next === "done";
  const notified = wantsYou && prev !== next && !looking;
  if (notified) {
    const blocked = next === "blocked";
    const body = blocked
      ? summarize(input.message, "Waiting on your input")
      : summarize(input.last_assistant_message, "Finished its turn");
    // Colour only the label; the body inherits message-style so it stays
    // readable whatever the theme. Bright variants, since this is read at a
    // glance against the dark message background set in tmux.conf.
    toast(
      `#[fg=${blocked ? "brightgreen" : "brightcyan"},bold]● ${label} ` +
        `${blocked ? "needs you" : "finished"}#[default]  ${body}`,
    );
    desktop(label, blocked ? "Claude needs you" : "Claude finished", body);
  }

  log(
    `${event} state=${next || "clear"} prev=${prev || "-"} repo=${repo} ` +
      `branch=${branch || "-"} session=${session || "-"} looking=${looking} notified=${notified}`,
  );
  done();
});
