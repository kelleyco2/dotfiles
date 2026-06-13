---
description: Detect the project's test runner and run the test suite (optionally a filtered subset)
---

Run this project's tests. Detect the stack and use the right command:

- **Elixir** (`mix.exs` present): `mix test`
- **Node/Next** — check the lockfile and `package.json` scripts:
  - If `vitest` is a dependency: `npx vitest run`
  - Else if there's a `test` script: run it with the project's package manager
    (`npm test` / `yarn test` — match the lockfile)
- **Salesforce** (`sfdx-project.json`): `sf apex run test` (or the project's documented command)

If the user passed an argument (`$ARGUMENTS`), treat it as a filter — a test file path or name
pattern — and pass it to the runner (e.g. `npx vitest run $ARGUMENTS`, `mix test $ARGUMENTS`).

Report the results concisely: pass/fail counts and the details of any failures. Do not attempt
fixes unless asked.
