import { readFile, writeFile } from "node:fs/promises";
import { getConfig, loadEnv } from "./lib/env.mjs";
import { ensureProjectDirs, readJson, writeJson } from "./lib/files.mjs";
import { synthesizeVoice } from "./lib/tts.mjs";

const env = await loadEnv();
const config = getConfig(env);
await ensureProjectDirs();

const lesson = await readJson("data/lesson.json");
const manifest = {};

for (const scene of lesson.scenes) {
  const ext = config.useLarvoice ? "wav" : "mp3";
  const outputPath = `assets/audio/${scene.id}.${ext}`;
  console.log(`Creating TTS for ${scene.id}`);
  const audio = await synthesizeVoice({
    text: scene.voiceover,
    outputPath,
    config,
    log: (line) => console.log(line),
  });
  manifest[scene.id] = audio;
}

await writeJson("data/audio-manifest.json", manifest);
await writeFile("data/audio-provider.txt", config.useLarvoice ? "larvoice\n" : "edge-tts\n", "utf8");
console.log("Wrote data/audio-manifest.json");
