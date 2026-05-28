import { createReadStream } from "node:fs";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { getConfig, loadEnv } from "../scripts/lib/env.mjs";
import { ensureProjectDirs, readJson, writeJson } from "../scripts/lib/files.mjs";
import { findAvailablePort } from "./ports.mjs";

await ensureProjectDirs();
const config = getConfig(await loadEnv());

const state = {
  status: "idle",
  currentStep: "",
  running: false,
  startedAt: null,
  finishedAt: null,
  lastError: "",
};
const logs = [];

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/") return serveFile(res, "admin/index.html", "text/html");
    if (req.method === "GET" && url.pathname === "/admin/app.js") return serveFile(res, "admin/app.js", "text/javascript");
    if (req.method === "GET" && url.pathname === "/admin/style.css") return serveFile(res, "admin/style.css", "text/css");
    if (req.method === "GET" && url.pathname === "/preview") return serveFile(res, "index.html", "text/html");
    if (req.method === "GET" && url.pathname.startsWith("/assets/")) return serveFile(res, url.pathname.slice(1), mime(url.pathname));
    if (req.method === "GET" && url.pathname.startsWith("/renders/")) {
      return serveRenderFile(req, res, decodeURIComponent(url.pathname.slice("/renders/".length)));
    }
    if (req.method === "GET" && url.pathname === "/api/status") return json(res, await getStatus());
    if (req.method === "GET" && url.pathname === "/api/logs") return json(res, { logs });
    if (req.method === "GET" && url.pathname === "/api/lesson") return json(res, await safeJson("data/lesson.json", null));
    if (req.method === "POST" && url.pathname === "/api/generate") {
      const body = await readBody(req);
      return runJob(res, "generating_lesson", [["node", ["scripts/generate-lesson.mjs", body.topic || "Present perfect vs past simple"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/tts") {
      return runJob(res, "creating_audio", [["node", ["scripts/create-tts.mjs"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/subtitles") {
      return runJob(res, "creating_subtitles", [["node", ["scripts/create-subtitles.mjs"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/build") {
      return runJob(res, "building_composition", [["node", ["scripts/build-composition.mjs"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/check") {
      return runJob(res, "checking", [["npm", ["run", "check"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/render") {
      return runJob(res, "rendering", [["npm", ["run", "render"]]]);
    }
    if (req.method === "POST" && url.pathname === "/api/run-lesson") {
      const body = await readBody(req);
      const topic = body.topic || "Present perfect vs past simple";
      return runJob(res, "generating_lesson", [
        ["node", ["scripts/generate-lesson.mjs", topic]],
        ["node", ["scripts/create-tts.mjs"]],
        ["node", ["scripts/create-subtitles.mjs"]],
        ["node", ["scripts/build-composition.mjs"]],
        ["npm", ["run", "check"]],
        ["npm", ["run", "render"]],
      ]);
    }
    res.writeHead(404);
    res.end("Not found");
  } catch (error) {
    appendLog(`ERROR ${error.stack || error.message}`);
    json(res, { error: error.message }, 500);
  }
});

const port = await findAvailablePort(config.adminPort);
server.listen(port, () => {
  if (port !== config.adminPort) {
    console.log(`Port ${config.adminPort} is busy; using ${port} instead.`);
  }
  console.log(`Admin UI: http://localhost:${port}`);
});

async function runJob(res, initialStatus, commands) {
  if (state.running) return json(res, { error: "A job is already running.", state }, 409);
  state.running = true;
  state.status = initialStatus;
  state.currentStep = initialStatus;
  state.startedAt = new Date().toISOString();
  state.finishedAt = null;
  state.lastError = "";
  logs.length = 0;
  await persistStatus();
  json(res, { accepted: true, state });

  try {
    for (const [command, args] of commands) {
      state.currentStep = `${command} ${args.join(" ")}`;
      appendLog(`> ${state.currentStep}`);
      await persistStatus();
      await run(command, args);
    }
    state.status = "done";
  } catch (error) {
    state.status = "error";
    state.lastError = error.message;
    appendLog(`FAILED ${error.message}`);
  } finally {
    state.running = false;
    state.finishedAt = new Date().toISOString();
    await persistStatus();
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: process.platform === "win32" });
    child.stdout.on("data", (chunk) => appendLog(chunk.toString()));
    child.stderr.on("data", (chunk) => appendLog(chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function getStatus() {
  const renders = await listRenders();
  return {
    ...state,
    files: {
      lesson: await exists("data/lesson.json"),
      audioManifest: await safeJson("data/audio-manifest.json", {}),
      subtitleManifest: await safeJson("data/subtitle-manifest.json", {}),
      timingManifest: await safeJson("data/timing-manifest.json", {}),
      renders,
      latestRender: renders[0] || null,
    },
  };
}

async function listRenders() {
  try {
    const files = await readdir("renders");
    const renderFiles = await Promise.all(
      files
        .filter((file) => /\.(mp4|webm)$/i.test(file))
        .map(async (file) => {
          const fileStat = await stat(path.join("renders", file));
          return {
            name: file,
            src: `/renders/${encodeURIComponent(file)}`,
            size: fileStat.size,
            modifiedAt: fileStat.mtime.toISOString(),
          };
        }),
    );
    return renderFiles.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
  } catch {
    return [];
  }
}

async function safeJson(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch {
    return fallback;
  }
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function persistStatus() {
  await writeJson("data/job-status.json", state);
}

function appendLog(text) {
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    logs.push({ time: new Date().toISOString(), line });
  }
  while (logs.length > 500) logs.shift();
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  return JSON.parse(raw);
}

async function serveFile(res, filePath, contentType) {
  const fullPath = path.resolve(filePath);
  await stat(fullPath);
  res.writeHead(200, { "content-type": contentType });
  createReadStream(fullPath).pipe(res);
}

async function serveRenderFile(req, res, filename) {
  const safeName = path.basename(filename);
  if (safeName !== filename || !/\.(mp4|webm)$/i.test(safeName)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const fullPath = path.resolve("renders", safeName);
  const fileStat = await stat(fullPath);
  const contentType = mime(fullPath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "content-type": contentType,
      "content-length": fileStat.size,
      "accept-ranges": "bytes",
      "cache-control": "no-store",
    });
    createReadStream(fullPath).pipe(res);
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    res.writeHead(416, { "content-range": `bytes */${fileStat.size}` });
    res.end();
    return;
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : fileStat.size - 1;
  if (start >= fileStat.size || end >= fileStat.size || start > end) {
    res.writeHead(416, { "content-range": `bytes */${fileStat.size}` });
    res.end();
    return;
  }

  res.writeHead(206, {
    "content-type": contentType,
    "content-length": end - start + 1,
    "content-range": `bytes ${start}-${end}/${fileStat.size}`,
    "accept-ranges": "bytes",
    "cache-control": "no-store",
  });
  createReadStream(fullPath, { start, end }).pipe(res);
}

function json(res, data, status = 200) {
  if (res.headersSent) return;
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}

function mime(filePath) {
  if (filePath.endsWith(".mp3")) return "audio/mpeg";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".webm")) return "video/webm";
  if (filePath.endsWith(".wav")) return "audio/wav";
  if (filePath.endsWith(".srt")) return "text/plain";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
