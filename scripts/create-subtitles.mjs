import { writeFile } from "node:fs/promises";
import { ensureProjectDirs, readJson, writeJson } from "./lib/files.mjs";
import { splitSubtitleBlocks, toSrt } from "./lib/subtitles.mjs";
import { computeSceneTimings } from "./lib/timing.mjs";

await ensureProjectDirs();
const lesson = await readJson("data/lesson.json");
let audioManifest = {};
try {
  audioManifest = await readJson("data/audio-manifest.json");
} catch {
  audioManifest = {};
}

const audioDurations = Object.fromEntries(
  Object.entries(audioManifest).map(([id, audio]) => [id, audio.duration || 0]),
);
const timings = computeSceneTimings(lesson, audioDurations);
const manifest = {};

for (const [index, scene] of lesson.scenes.entries()) {
  const blocks = splitSubtitleBlocks(scene.voiceover, timings[index].duration);
  const filePath = `assets/subtitles/${scene.id}.srt`;
  await writeFile(filePath, toSrt(blocks), "utf8");
  manifest[scene.id] = blocks;
}

await writeJson("data/subtitle-manifest.json", manifest);
console.log("Wrote data/subtitle-manifest.json");
