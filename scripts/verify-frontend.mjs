// Reuse the project's canonical ESLint feature/shared import boundary rules.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const eslintBin = path.join(projectDir, "node_modules", "eslint", "bin", "eslint.js");

const result = spawnSync(process.execPath, [eslintBin, "src", "--quiet"], {
  cwd: projectDir,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
