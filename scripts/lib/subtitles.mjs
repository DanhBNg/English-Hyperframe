export function splitSubtitleBlocks(text, durationSeconds) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = cleaned.match(/[^.!?。！？]+[.!?。！？]?/g) || [cleaned];
  const chunks = [];

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    let current = [];
    for (const word of words) {
      const next = [...current, word].join(" ");
      if (next.length > 88 && current.length) {
        chunks.push(current.join(" "));
        current = [word];
      } else {
        current.push(word);
      }
    }
    if (current.length) chunks.push(current.join(" "));
  }

  const total = Math.max(1, Number(durationSeconds) || chunks.length * 3);
  const unit = total / chunks.length;
  return chunks.map((text, index) => ({
    index: index + 1,
    start: round(index * unit),
    end: index === chunks.length - 1 ? round(total) : round((index + 1) * unit),
    text,
  }));
}

export function toSrt(blocks) {
  return blocks
    .map(
      (block, index) =>
        `${index + 1}\n${formatSrtTime(block.start)} --> ${formatSrtTime(block.end)}\n${block.text}\n`,
    )
    .join("\n");
}

function formatSrtTime(seconds) {
  const ms = Math.round((seconds % 1) * 1000);
  const total = Math.floor(seconds);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms).padStart(3, "0")}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
