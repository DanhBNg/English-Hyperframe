import { spawn } from "node:child_process";

export async function getAudioDuration(filePath) {
  try {
    const output = await collect("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const duration = Number(output.trim());
    return Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) / 1000 : 0;
  } catch {
    return 0;
  }
}

function collect(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: process.platform === "win32" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr));
    });
  });
}
