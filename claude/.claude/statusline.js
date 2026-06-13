#!/usr/bin/env node
// Claude Code statusline: model · dir · git-branch [+added/-removed] · $cost
// Reads the status JSON from stdin (see Claude Code statusLine docs). Stays
// defensive — any missing field is simply skipped, and it never throws.

const { execFileSync } = require("node:child_process");

// Run a command with no shell (args passed directly — no injection surface).
const git = (args, cwd) =>
  execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let d = {};
  try {
    d = JSON.parse(raw);
  } catch {}

  // ANSI helpers
  const dim = (s) => `\x1b[2m${s}\x1b[0m`;
  const blue = (s) => `\x1b[34m${s}\x1b[0m`;
  const green = (s) => `\x1b[32m${s}\x1b[0m`;
  const red = (s) => `\x1b[31m${s}\x1b[0m`;
  const sep = dim(" · ");

  const parts = [];

  // Model
  const model = d.model?.display_name;
  if (model) parts.push(blue(model));

  // Current directory (basename)
  const dir = d.workspace?.current_dir || d.cwd;
  if (dir) parts.push(dir.split("/").pop());

  // Git branch + dirty marker, computed in the workspace dir
  if (dir) {
    try {
      const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], dir);
      if (branch) {
        let mark = "";
        try {
          if (git(["status", "--porcelain"], dir)) mark = dim("*");
        } catch {}
        parts.push(`\x1b[35m${branch}\x1b[0m${mark}`); // magenta branch
      }
    } catch {}
  }

  // Lines changed this session
  const added = d.cost?.total_lines_added;
  const removed = d.cost?.total_lines_removed;
  if (added || removed) {
    parts.push(`${green("+" + (added || 0))}/${red("-" + (removed || 0))}`);
  }

  // Session cost
  const cost = d.cost?.total_cost_usd;
  if (typeof cost === "number" && cost > 0) {
    parts.push(dim("$" + cost.toFixed(2)));
  }

  process.stdout.write(parts.join(sep));
});
