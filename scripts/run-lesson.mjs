import { spawn } from "node:child_process";

const topic = process.argv.slice(2).join(" ").trim() || "Present perfect vs past simple";
const steps = [
  ["node", ["scripts/generate-lesson.mjs", topic]],
  ["node", ["scripts/create-tts.mjs"]],
  ["node", ["scripts/create-subtitles.mjs"]],
  ["node", ["scripts/build-composition.mjs"]],
  ["npm", ["run", "check"]],
];

for (const [command, args] of steps) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  await run(command, args);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}
