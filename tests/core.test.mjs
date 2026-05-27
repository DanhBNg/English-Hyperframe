import assert from "node:assert/strict";
import test from "node:test";

import { parseEnvText, shouldUseLarvoice, getConfig } from "../scripts/lib/env.mjs";
import { validateLesson } from "../scripts/lib/lesson-schema.mjs";
import { splitSubtitleBlocks } from "../scripts/lib/subtitles.mjs";
import { computeSceneTimings } from "../scripts/lib/timing.mjs";
import { renderCompositionHtml } from "../templates/whiteboard/template.mjs";
import { renderSceneBody } from "../templates/whiteboard/scenes.mjs";

const lesson = {
  topic: "Present perfect vs past simple",
  title: "Present Perfect và Past Simple khác nhau ở đâu?",
  audience: "người Việt học tiếng Anh",
  level: "A2-B1",
  duration_target_seconds: 180,
  learning_goals: ["Phân biệt trải nghiệm", "Nhận ra mốc thời gian", "Sửa lỗi với yesterday"],
  scenes: [
    {
      id: "scene_01",
      kind: "hook",
      headline: "Hai câu giống nhau, cảm giác thời gian khác nhau",
      subheadline: "I have visited vs I visited",
      voiceover:
        "Bạn có thể nói I have visited London hoặc I visited London in 2020. Hai câu đều nói về quá khứ, nhưng một câu nhấn vào trải nghiệm, một câu nhấn vào thời điểm cụ thể.",
      visual_type: "whiteboard_title",
      visual: {
        main_text: "I have visited London.",
        compare_text: "I visited London in 2020.",
        note: "Trải nghiệm không cần thời điểm cụ thể.",
      },
      examples: [
        { en: "I have visited London.", vi: "Tôi đã từng đến London.", note: "Nhấn vào trải nghiệm." },
        { en: "I visited London in 2020.", vi: "Tôi đã đến London năm 2020.", note: "Có mốc thời gian." },
      ],
    },
    {
      id: "scene_02",
      kind: "goals",
      headline: "Sau bài này bạn sẽ biết",
      subheadline: "Ba điểm cần nhớ",
      voiceover:
        "Mục tiêu rất rõ: biết khi nào dùng present perfect, khi nào dùng past simple, và vì sao các từ như yesterday kéo câu về past simple.",
      visual_type: "learning_goals",
      visual: {},
    },
  ],
  recap: ["Present perfect nhấn trải nghiệm.", "Past simple cần mốc quá khứ cụ thể."],
};

test("parseEnvText keeps values and boolean Larvoice flag deterministic", () => {
  const env = parseEnvText("USE_LARVOICE=false\nCUSTOM_API_BASE_URL=https://example.test/v1\n");
  assert.equal(env.CUSTOM_API_BASE_URL, "https://example.test/v1");
  assert.equal(shouldUseLarvoice(env), false);
  assert.equal(shouldUseLarvoice({ USE_LARVOICE: "true" }), true);
});

test("getConfig defaults to TrollLLM Claude Sonnet model", async () => {
  const { getConfig } = await import("../scripts/lib/env.mjs");
  assert.equal(getConfig({}).aiModel, "claude-sonnet-4-6");
  assert.equal(getConfig({ AI_MODEL: "custom-model" }).aiModel, "custom-model");
  assert.equal(getConfig({}).larvoiceApiBaseUrl, "https://larvoice.com/api");
  assert.equal(getConfig({}).fallbackToEdgeTts, true);
  assert.equal(getConfig({ FALLBACK_TO_EDGE_TTS: "false" }).fallbackToEdgeTts, false);
});

test("validateLesson accepts a visual lesson and rejects empty scenes", () => {
  assert.doesNotThrow(() => validateLesson(lesson, { minScenes: 2 }));
  assert.throws(() => validateLesson({ ...lesson, scenes: [] }, { minScenes: 2 }), /at least 2 scenes/);
});

test("splitSubtitleBlocks creates readable non-empty SRT blocks", () => {
  const blocks = splitSubtitleBlocks(lesson.scenes[0].voiceover, 12);
  assert.ok(blocks.length >= 2);
  assert.ok(blocks.every((block) => block.text.length <= 96));
  assert.equal(blocks[0].start, 0);
  assert.equal(blocks.at(-1).end, 12);
});

test("computeSceneTimings uses audio duration when present and keeps sequential starts", () => {
  const timings = computeSceneTimings(lesson, { scene_01: 10.2, scene_02: 7.1 });
  assert.equal(timings[0].start, 0);
  assert.equal(timings[0].duration, 11);
  assert.equal(timings[1].start, 11);
  assert.equal(timings.totalDuration, 19);
});

test("renderCompositionHtml emits HyperFrames timing attributes and timeline registration", () => {
  const html = renderCompositionHtml(lesson, {
    timings: computeSceneTimings(lesson, {}),
    audioManifest: {},
    subtitleManifest: {},
  });
  assert.match(html, /data-composition-id="main"/);
  assert.match(html, /data-width="1080"/);
  assert.match(html, /data-height="1920"/);
  assert.match(html, /class="clip scene/);
  assert.match(html, /data-track-index="1"/);
  assert.match(html, /window\.__timelines\["main"\] = tl/);
});

test("scene renderers use meaningful visual fields instead of repeated fallbacks", () => {
  const ruleHtml = renderSceneBody({
    headline: "Simple Past",
    subheadline: "Hành động hoàn tất",
    voiceover: "Simple Past dùng cho hành động đã xảy ra.",
    visual_type: "rule_board",
    visual: {
      rule: "S + V2/V-ed",
      usage: "Hành động hoàn tất trong quá khứ",
      signals: ["yesterday", "last week"],
    },
    examples: [],
  }, 0, lesson);
  assert.match(ruleHtml, /S \+ V2\/V-ed/);
  assert.match(ruleHtml, /yesterday/);
  assert.doesNotMatch(ruleHtml, /Simple Past dùng cho hành động đã xảy ra/);

  const appHtml = renderSceneBody({
    headline: "Áp dụng",
    subheadline: "Kể về hôm qua",
    voiceover: "Bây giờ hãy thử kể về ngày hôm qua của bạn.",
    visual_type: "application_board",
    visual: {
      scenario: "Kể về ngày hôm qua",
      example: "Yesterday, I woke up at 7am.",
      signals_highlighted: ["Yesterday", "when"],
      prompt: "Tự tạo 2 câu của bạn.",
    },
    examples: [],
  }, 0, lesson);
  assert.match(appHtml, /Yesterday, I woke up at 7am/);
  assert.match(appHtml, /Tự tạo 2 câu của bạn/);
});
