import { readFileSync } from "node:fs";
import path from "node:path";
import { renderSceneBody, escapeHtml } from "./scenes.mjs";

const STYLE = readFileSync(path.join("templates", "whiteboard", "style.css"), "utf8");

export function renderCompositionHtml(lesson, { timings, audioManifest = {}, subtitleManifest = {} }) {
  const duration = timings.totalDuration;
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${STYLE}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="1080" data-height="1920">
      ${lesson.scenes.map((scene, index) => renderScene(scene, index, lesson, timings[index], subtitleManifest[scene.id])).join("\n")}
      ${lesson.scenes.map((scene, index) => renderAudio(scene, timings[index], audioManifest[scene.id])).join("\n")}
      ${renderTransitions(timings)}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${lesson.scenes.map((scene, index) => renderSceneTimeline(scene, timings[index], index === lesson.scenes.length - 1)).join("\n")}
      ${renderTransitionTimeline(timings)}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

function renderScene(scene, index, lesson, timing, subtitles = []) {
  return `<section id="${scene.id}" class="clip scene" data-start="${timing.start}" data-duration="${timing.duration}" data-track-index="1">
    <div class="scene-frame">
      <div class="scene-content">
        <h1 class="headline">${escapeHtml(scene.headline)}</h1>
        <div class="subheadline">${escapeHtml(scene.subheadline || lesson.topic)}</div>
        <div class="visual-zone">${renderSceneBody(scene, index, lesson)}</div>
      </div>
    </div>
    ${renderSubtitleClips(scene.id, timing, subtitles)}
  </section>`;
}

function renderAudio(scene, timing, audio) {
  if (!audio?.src) return "";
  return `<audio id="${scene.id}_audio" data-start="${timing.start}" data-duration="${timing.duration}" data-track-index="20" src="${audio.src}" data-volume="1"></audio>`;
}

function renderSubtitleClips(sceneId, timing, subtitles) {
  if (!Array.isArray(subtitles) || !subtitles.length) return "";
  return subtitles
    .map((block, index) => {
      const start = round(timing.start + block.start);
      const duration = Math.max(0.05, round(block.end - block.start - 0.01));
      return `<div id="${sceneId}_sub_${index + 1}" class="clip subtitle" data-start="${start}" data-duration="${duration}" data-track-index="30">${escapeHtml(block.text)}</div>`;
    })
    .join("\n");
}

function renderTransitions(timings) {
  return timings
    .slice(0, -1)
    .map((timing, index) => {
      const start = round(timing.start + timing.duration - 0.28);
      return `<div id="transition_${index + 1}" class="clip transition-wipe" data-start="${start}" data-duration="0.56" data-track-index="40"><div class="transition-panel"></div></div>`;
    })
    .join("\n");
}

function renderSceneTimeline(scene, timing, isLast) {
  const t = timing.start + 0.18;
  const q1 = timing.start + timing.duration * 0.16;
  const end = timing.start + timing.duration - 0.8;
  const hideAt = timing.start + timing.duration;
  const id = `#${scene.id}`;
  const frame = `${id} .scene-frame`;
  return `
      tl.set("${frame}", { opacity: 1, visibility: "visible" }, ${round(timing.start)});
      tl.fromTo("${id} .headline", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", immediateRender: false }, ${round(t)});
      tl.fromTo("${id} .subheadline", { opacity: 0 }, { opacity: 1, duration: 0.42, ease: "sine.out", immediateRender: false }, ${round(t + 0.18)});
      tl.fromTo("${id} .visual-zone > *", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power1.out", immediateRender: false }, ${round(q1)});
      ${
        scene.visual_type === "mindmap_board"
          ? `tl.fromTo("${id} .mindmap-node", { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, stagger: 0.12, ease: "power2.out", immediateRender: false }, ${round(q1 + 0.22)});`
          : ""
      }
      ${
        isLast
          ? `tl.to("${frame}", { opacity: 0, duration: 0.55, ease: "power2.in" }, ${round(end)});
      tl.set("${frame}", { visibility: "hidden" }, ${round(end + 0.55)});`
          : `tl.set("${frame}", { opacity: 0, visibility: "hidden" }, ${round(hideAt)});`
      }`;
}

function renderTransitionTimeline(timings) {
  return timings
    .slice(0, -1)
    .map((timing, index) => {
      const start = round(timing.start + timing.duration - 0.28);
      const selector = `#transition_${index + 1} .transition-panel`;
      return `
      tl.set("${selector}", { opacity: 1, visibility: "visible", xPercent: 0 }, ${start});
      tl.fromTo("${selector}", { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power3.in", immediateRender: false }, ${start});
      tl.to("${selector}", { xPercent: 100, duration: 0.28, ease: "power3.out" }, ${round(start + 0.28)});
      tl.set("${selector}", { opacity: 0, visibility: "hidden", xPercent: 0, scaleX: 0 }, ${round(start + 0.56)});`;
    })
    .join("\n");
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
