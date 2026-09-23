import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const ITEMS = ["index.html", "manifest.json", "sw.js", "css", "js"];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const item of ITEMS) {
    cpSync(resolve(root, item), resolve(dist, item), { recursive: true });
}

const index = resolve(dist, "index.html");
cpSync(index, resolve(dist, "404.html"));

console.log("Build OK → dist/");