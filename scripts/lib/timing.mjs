export function estimateVoiceDuration(text) {
  const wordCount = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(8, Math.ceil((wordCount / 130) * 60));
}

export function computeSceneTimings(lesson, audioDurations = {}) {
  let cursor = 0;
  const timings = lesson.scenes.map((scene) => {
    const base = Number(audioDurations[scene.id]) || estimateVoiceDuration(scene.voiceover);
    const duration = Math.max(7, Math.ceil(base + 0.8));
    const timing = { id: scene.id, start: round(cursor), duration };
    cursor += duration;
    return timing;
  });
  timings.totalDuration = round(cursor);
  return timings;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
