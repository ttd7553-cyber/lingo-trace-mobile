import { cpSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of ["index.html", "manifest.webmanifest", "sw.js"]) {
  copyFileSync(join(root, file), join(dist, file));
}

for (const dir of ["public", "src"]) {
  mkdirSync(dirname(join(dist, dir)), { recursive: true });
  cpSync(join(root, dir), join(dist, dir), { recursive: true });
}
