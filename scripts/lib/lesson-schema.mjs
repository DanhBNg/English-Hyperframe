const VISUAL_TYPES = new Set([
  "whiteboard_title",
  "learning_goals",
  "rule_board",
  "example_table",
  "timeline_board",
  "mistake_correction",
  "mindmap_board",
  "application_board",
  "dialogue_board",
  "pronunciation_board",
  "recap_board",
]);

export function validateLesson(lesson, options = {}) {
  const minScenes = options.minScenes ?? 8;
  if (!lesson || typeof lesson !== "object") throw new Error("Lesson must be an object.");
  if (!lesson.title) throw new Error("Lesson missing title.");
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length < minScenes) {
    throw new Error(`Lesson must have at least ${minScenes} scenes.`);
  }

  for (const [index, scene] of lesson.scenes.entries()) {
    const id = scene.id || `scene_${String(index + 1).padStart(2, "0")}`;
    if (!scene.headline) throw new Error(`${id} missing headline.`);
    if (!scene.voiceover || scene.voiceover.trim().length < 80) {
      throw new Error(`${id} voiceover too short.`);
    }
    if (!scene.visual_type) throw new Error(`${id} missing visual_type.`);
    if (!VISUAL_TYPES.has(scene.visual_type)) {
      throw new Error(`${id} has unsupported visual_type: ${scene.visual_type}.`);
    }
  }
}

export function normalizeLesson(lesson, defaults = {}) {
  const normalized = {
    topic: lesson.topic || defaults.topic || "Present perfect vs past simple",
    title: lesson.title || lesson.topic || defaults.topic || "English Mini Lesson",
    audience: lesson.audience || defaults.audience || "người Việt học tiếng Anh",
    level: lesson.level || defaults.level || "A2-B1",
    duration_target_seconds:
      Number(lesson.duration_target_seconds || defaults.durationTargetSeconds || 180),
    learning_goals: Array.isArray(lesson.learning_goals) ? lesson.learning_goals : [],
    recap: Array.isArray(lesson.recap) ? lesson.recap : [],
    scenes: Array.isArray(lesson.scenes) ? lesson.scenes : [],
  };

  normalized.scenes = normalized.scenes.map((scene, index) => ({
    id: scene.id || `scene_${String(index + 1).padStart(2, "0")}`,
    kind: scene.kind || "lesson",
    headline: scene.headline || normalized.title,
    subheadline: scene.subheadline || scene.visual?.note || "",
    voiceover: scene.voiceover || "",
    visual_type: scene.visual_type || "example_table",
    visual: scene.visual || {},
    examples: Array.isArray(scene.examples) ? scene.examples : [],
    practice: scene.practice || null,
  }));

  return normalized;
}
