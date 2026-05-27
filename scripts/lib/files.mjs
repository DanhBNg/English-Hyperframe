import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureProjectDirs() {
  for (const dir of [
    "assets/audio",
    "assets/subtitles",
    "assets/fonts",
    "assets/images",
    "data",
    "renders",
  ]) {
    await mkdir(dir, { recursive: true });
  }
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
