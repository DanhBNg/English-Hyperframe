import { writeFile } from "node:fs/promises";
import { ensureProjectDirs, readJson, writeJson } from "./lib/files.mjs";
import { normalizeLesson, validateLesson } from "./lib/lesson-schema.mjs";
import { computeSceneTimings } from "./lib/timing.mjs";
import { renderCompositionHtml } from "../templates/whiteboard/template.mjs";

await ensureProjectDirs();
const lesson = normalizeLesson(await readJson("data/lesson.json"));
validateLesson(lesson);

let audioManifest = {};
let subtitleManifest = {};
try {
  audioManifest = await readJson("data/audio-manifest.json");
} catch {
  audioManifest = {};
}
try {
  subtitleManifest = await readJson("data/subtitle-manifest.json");
} catch {
  subtitleManifest = {};
}

const audioDurations = Object.fromEntries(
  Object.entries(audioManifest).map(([id, audio]) => [id, audio.duration || 0]),
);
const timings = computeSceneTimings(lesson, audioDurations);
const html = renderCompositionHtml(lesson, { timings, audioManifest, subtitleManifest });

await writeFile("index.html", html, "utf8");
await writeJson("data/timing-manifest.json", { totalDuration: timings.totalDuration, scenes: timings });
console.log(`Built index.html (${timings.totalDuration}s)`);
