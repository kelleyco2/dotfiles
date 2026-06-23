#!/usr/bin/env node
// Claude Code statusline — powerline style, carbon palette (matches tmux).
// Segments: ✦ model  ›  dir  ›   branch ●  ›  +added -removed
// Reads the status JSON from stdin. Defensive: missing fields are skipped and
// it never throws.

const { execFileSync } = require("node:child_process");

// Run git with no shell (args passed directly — no injection surface).
const git = (args, cwd) =>
  execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();

// --- palette (24-bit) -------------------------------------------------------
const BG = [22, 22, 22]; //   #161616 terminal bg
const BLUE = [69, 137, 255]; // #4589ff accent
const MID = [57, 57, 57]; //   #393939
const DARK = [38, 38, 38]; //  #262626
const TEXT = [244, 244, 244]; //#f4f4f4
const PURPLE = [190, 149, 255]; // #be95ff branch
const AMBER = [241, 194, 27]; //  #f1c21b dirty
const GREEN = [66, 190, 101]; //  #42be65
const RED = [250, 77, 86]; //     #fa4d56

const fg = (c) => `\x1b[38;2;${c[0]};${c[1]};${c[2]}m`;
const bg = (c) => `\x1b[48;2;${c[0]};${c[1]};${c[2]}m`;
const B = "\x1b[1m";
const R = "\x1b[0m";
const ARROW = ""; //  powerline separator
const BRANCH = ""; //  powerline branch glyph

// A consumer may close the pipe before we finish writing — don't crash on it.
process.stdout.on("error", () => process.exit(0));

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let d = {};
  try {
    d = JSON.parse(raw);
  } catch {}

  // Build the colored powerline segments: { text, bgc, fgc }.
  const segs = [];

  const model = d.model?.display_name;
  if (model) segs.push({ text: `✦ ${model}`, bgc: BLUE, fgc: BG, bold: true });

  const dir = d.workspace?.current_dir || d.cwd;
  if (dir) segs.push({ text: dir.split("/").pop(), bgc: MID, fgc: TEXT });

  // Git branch (+ dirty dot), computed in the workspace dir.
  if (dir) {
    try {
      const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], dir);
      if (branch) {
        let dot = "";
        try {
          if (git(["status", "--porcelain"], dir)) {
            dot = ` ${fg(AMBER)}●${fg(PURPLE)}`;
          }
        } catch {}
        segs.push({
          text: `${BRANCH} ${branch}${dot}`,
          bgc: DARK,
          fgc: PURPLE,
        });
      }
    } catch {}
  }

  // Render powerline: each segment flows into the next via a colored arrow.
  let out = "";
  segs.forEach((s, i) => {
    out += bg(s.bgc) + fg(s.fgc) + (s.bold ? B : "") + ` ${s.text} ` + R;
    const next = segs[i + 1];
    // Arrow: foreground = this segment's bg, background = next segment's bg
    // (or terminal default when this is the last colored segment).
    out += next ? bg(next.bgc) + fg(s.bgc) + ARROW + R : fg(s.bgc) + ARROW + R;
  });

  // Trailing diff stats (plain, on default bg).
  const added = d.cost?.total_lines_added || 0;
  const removed = d.cost?.total_lines_removed || 0;
  if (added || removed) {
    out += ` ${fg(GREEN)}+${added}${R} ${fg(RED)}-${removed}${R}`;
  }

  process.stdout.write(out);
});
