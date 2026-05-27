import { readFile } from "node:fs/promises";

export function parseEnvText(text) {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) {
      env[line] = "";
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

export async function loadEnv(path = ".env") {
  let fileEnv = {};
  try {
    fileEnv = parseEnvText(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return { ...fileEnv, ...process.env };
}

export function shouldUseLarvoice(env) {
  return String(env.USE_LARVOICE || "").trim().toLowerCase() === "true";
}

export function getConfig(env) {
  return {
    customApiBaseUrl: env.CUSTOM_API_BASE_URL || "",
    customApiKey: env.CUSTOM_API_KEY || "",
    aiModel: env.AI_MODEL || "claude-sonnet-4-6",
    larvoiceApiKey: env.LARVOICE_API_KEY || "",
    larvoiceVoiceId: env.LARVOICE_VOICE_ID || "1",
    larvoiceApiBaseUrl: env.LARVOICE_API_BASE_URL || "https://larvoice.com/api",
    fallbackToEdgeTts: String(env.FALLBACK_TO_EDGE_TTS ?? "true").trim().toLowerCase() !== "false",
    useLarvoice: shouldUseLarvoice(env),
    edgeVoice: env.EDGE_TTS_VOICE || "vi-VN-NamMinhNeural",
    edgeFallbackVoice: env.TTS_FALLBACK_VOICE || "vi-VN-HoaiMyNeural",
    defaultDurationSeconds: Number(env.DEFAULT_DURATION_SECONDS || 180),
    adminPort: Number(env.ADMIN_PORT || 3000),
    videoWidth: Number(env.VIDEO_WIDTH || 1080),
    videoHeight: Number(env.VIDEO_HEIGHT || 1920),
  };
}
