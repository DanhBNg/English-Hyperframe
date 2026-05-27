import { generateLessonWithAi } from "./lib/ai.mjs";
import { getConfig, loadEnv } from "./lib/env.mjs";
import { ensureProjectDirs, writeJson } from "./lib/files.mjs";

const topic = process.argv.slice(2).join(" ").trim() || "Present perfect vs past simple";
const env = await loadEnv();
const config = getConfig(env);

await ensureProjectDirs();
const lesson = await generateLessonWithAi(
  {
    topic,
    level: env.LEVEL || "A2-B1",
    audience: env.AUDIENCE || "người Việt học tiếng Anh",
    tone: env.TONE || "rõ ràng, gần gũi, có ví dụ thực tế",
    durationTargetSeconds: Number(env.DEFAULT_DURATION_SECONDS || 180),
  },
  config,
);

await writeJson("data/lesson.json", lesson);
console.log(`Wrote data/lesson.json (${lesson.scenes.length} scenes)`);
