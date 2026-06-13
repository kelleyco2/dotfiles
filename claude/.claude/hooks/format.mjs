#!/usr/bin/env node
// PostToolUse hook: format the file Claude just edited, using the project's own
// tooling. Conservative by design — it only runs a formatter the project is
// already set up for, never imposes one, and never blocks (always exits 0).

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";

const done = () => process.exit(0);

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let file;
  try {
    file = JSON.parse(raw)?.tool_input?.file_path;
  } catch {}
  if (!file || !existsSync(file)) return done();

  // Walk up from the file looking for the first dir containing any marker.
  const findUp = (markers) => {
    let dir = dirname(file);
    for (;;) {
      if (markers.some((m) => existsSync(join(dir, m)))) return dir;
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  };

  const run = (bin, args, cwd) => {
    try {
      execFileSync(bin, args, { cwd, stdio: "ignore" });
    } catch {
      /* missing tool or format error — stay silent, never block */
    }
  };

  // Prefer a project-local binary over a global one.
  const localBin = (root, name) => {
    const p = join(root, "node_modules", ".bin", name);
    return existsSync(p) ? p : name;
  };

  const ext = extname(file).toLowerCase();

  // Elixir — mix format is standard and safe.
  if ([".ex", ".exs", ".heex"].includes(ext)) {
    const root = findUp(["mix.exs"]);
    if (root) run("mix", ["format", file], root);
    return done();
  }

  // Lua — stylua (the user's Lua formatter).
  if (ext === ".lua") {
    run("stylua", [file], dirname(file));
    return done();
  }

  // JS/TS/web — only if the project already uses Biome or Prettier.
  const web = [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".json", ".css", ".scss", ".html", ".md", ".mdx", ".yaml", ".yml",
  ];
  if (web.includes(ext)) {
    const biomeRoot = findUp(["biome.json", "biome.jsonc"]);
    if (biomeRoot) {
      run(localBin(biomeRoot, "biome"), ["format", "--write", file], biomeRoot);
      return done();
    }
    const prettierRoot = findUp([
      ".prettierrc", ".prettierrc.json", ".prettierrc.js", ".prettierrc.cjs",
      ".prettierrc.yaml", ".prettierrc.yml", "prettier.config.js",
      "prettier.config.cjs", "prettier.config.mjs",
    ]);
    if (prettierRoot) {
      run(localBin(prettierRoot, "prettier"), ["--write", file], prettierRoot);
    }
    return done();
  }

  done();
});
