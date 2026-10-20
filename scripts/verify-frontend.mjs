// Reuse the project's canonical ESLint feature/shared import boundary rules.
import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["node_modules/eslint/bin/eslint.js", "src", "--quiet"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
