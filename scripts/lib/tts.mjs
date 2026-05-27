import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAudioDuration } from "./ffmpeg.mjs";

export async function synthesizeVoice({ text, outputPath, config, log = () => {} }) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  if (config.useLarvoice) {
    try {
      await synthesizeLarvoice({ text, outputPath, config, log });
    } catch (error) {
      if (!config.fallbackToEdgeTts) throw error;
      log(`LarVoice failed: ${error.message}`);
      log("Falling back to free Edge TTS for this scene.");
      await synthesizeEdge({ text, outputPath: outputPath.replace(/\.(wav|mp3)$/i, ".mp3"), config, log });
      outputPath = outputPath.replace(/\.(wav|mp3)$/i, ".mp3");
    }
  } else {
    await synthesizeEdge({ text, outputPath, config, log });
  }
  const duration = await getAudioDuration(outputPath);
  return { src: outputPath.replaceAll("\\", "/"), duration };
}

async function synthesizeLarvoice({ text, outputPath, config, log }) {
  if (!config.larvoiceApiKey) throw new Error("Missing LARVOICE_API_KEY in .env.");
  const form = new FormData();
  form.set("text", text);
  form.set("voice_id", String(config.larvoiceVoiceId));
  form.set("language_id", "1");
  form.set("model_id", "1");
  form.set("format", "wav");

  const baseUrl = String(config.larvoiceApiBaseUrl || "https://larvoice.com/api").replace(/\/$/, "");
  const create = await fetch(`${baseUrl}/tts`, {
    method: "POST",
    headers: { apikey: config.larvoiceApiKey },
    body: form,
  });
  if (!create.ok) throw new Error(`LarVoice create failed ${create.status}: ${await create.text()}`);
  const job = await create.json();
  const id = job.id;
  if (!id) throw new Error(`LarVoice response missing id: ${JSON.stringify(job)}`);
  log(`LarVoice job ${id} pending`);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await wait(2000);
    const poll = await fetch(`${baseUrl}/tts/${id}`, {
      headers: { apikey: config.larvoiceApiKey },
    });
    if (!poll.ok) throw new Error(`LarVoice poll failed ${poll.status}: ${await poll.text()}`);
    const result = await poll.json();
    if (result.status === "success" && result.output_path) {
      const audio = await fetch(result.output_path);
      if (!audio.ok) throw new Error(`LarVoice audio download failed ${audio.status}`);
      await writeFile(outputPath, Buffer.from(await audio.arrayBuffer()));
      return;
    }
    if (result.status === "failed" || result.status === "error") {
      throw new Error(`LarVoice job ${id} failed: ${JSON.stringify(result)}`);
    }
    log(`LarVoice job ${id}: ${result.status || "pending"}`);
  }
  throw new Error(`LarVoice job ${id} timed out.`);
}

async function synthesizeEdge({ text, outputPath, config, log }) {
  log(`Edge TTS -> ${outputPath}`);
  const voices = [...new Set([config.edgeVoice, config.edgeFallbackVoice, "vi-VN-HoaiMyNeural"])];
  let lastError = null;
  for (const voice of voices) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        log(`Edge TTS voice ${voice}, attempt ${attempt}`);
        await runCommand(resolvePython(), [
          "-m",
          "edge_tts",
          "--voice",
          voice,
          "--text",
          text,
          "--write-media",
          outputPath,
        ]);
        return;
      } catch (error) {
        lastError = error;
        log(`Edge TTS failed with ${voice}: ${error.message.split("\n")[0]}`);
        await wait(1000);
      }
    }
  }
  throw lastError;
}

function resolvePython() {
  if (process.env.PYTHON && existsSync(process.env.PYTHON)) return process.env.PYTHON;
  const localPython = path.join(process.env.LOCALAPPDATA || "", "Python", "bin", "python.exe");
  if (existsSync(localPython)) return localPython;
  return "python";
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], shell: false });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with ${code}: ${stderr}`));
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
