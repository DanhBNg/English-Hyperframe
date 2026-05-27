export function renderSceneBody(scene, index, lesson) {
  const type = scene.visual_type;
  if (type === "whiteboard_title") return whiteboardTitle(scene);
  if (type === "learning_goals") return learningGoals(scene, lesson);
  if (type === "rule_board") return ruleBoard(scene);
  if (type === "timeline_board") return timelineBoard(scene);
  if (type === "mistake_correction") return mistakeCorrection(scene);
  if (type === "mindmap_board") return mindmapBoard(scene);
  if (type === "application_board") return applicationBoard(scene);
  if (type === "dialogue_board") return dialogueBoard(scene);
  if (type === "pronunciation_board") return pronunciationBoard(scene);
  if (type === "recap_board") return recapBoard(scene, lesson);
  return exampleTable(scene);
}

function whiteboardTitle(scene) {
  const mainText = firstText(scene.visual.main_text, scene.visual.title, scene.examples?.[0]?.en, scene.headline);
  const compareText = firstText(scene.visual.compare_text, scene.visual.subtitle, scene.examples?.[1]?.en, scene.subheadline);
  const note = firstText(scene.visual.note, scene.visual.usage, scene.subheadline, summarizeVoiceover(scene));

  return `
    <div class="hero-pair">
      <div class="sentence sentence-good">${escapeHtml(mainText)}</div>
      <div class="sentence sentence-compare">${escapeHtml(compareText)}</div>
    </div>
    <div class="teacher-note">${escapeHtml(note)}</div>
  `;
}

function learningGoals(scene, lesson) {
  const goals = uniqueClean([scene.visual.goals, lesson.learning_goals, bulletsFromScene(scene)]).slice(0, 4);
  return `<div class="goal-stack">${goals
    .map((goal, index) => `<div class="goal-row"><span>${index + 1}</span><strong>${escapeHtml(goal)}</strong></div>`)
    .join("")}</div>`;
}

function ruleBoard(scene) {
  const formula = firstText(scene.visual.formula, scene.visual.rule, scene.subheadline, scene.headline);
  const markers = uniqueClean([
    scene.visual.markers,
    scene.visual.keywords,
    scene.visual.signals,
    scene.visual.usage,
  ]).filter((item) => normalizeKey(item) !== normalizeKey(formula));
  const chips = (markers.length ? markers : bulletsFromScene(scene)).slice(0, 6);

  return `
    <div class="formula-strip">${escapeHtml(formula)}</div>
    <div class="chip-row">${chips.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    ${examples(scene)}
  `;
}

function exampleTable(scene) {
  const headers = tableHeaders(scene).slice(0, 3);
  return `
    <div class="example-table">
      ${headers.map((header) => `<div class="table-head">${escapeHtml(header)}</div>`).join("")}
      ${tableRows(scene)
        .slice(0, 3)
        .map((row) => headers.map((_, index) => `<div${index === 0 ? ' class="en"' : ""}>${escapeHtml(row[index])}</div>`).join(""))
        .join("")}
    </div>
  `;
}

function timelineBoard(scene) {
  return `
    <div class="timeline-line">
      <span class="past">Past</span>
      <span class="now">Now</span>
      <span class="future">Future</span>
      <i class="pin pin-a"></i><i class="pin pin-b"></i>
    </div>
    <div class="teacher-note">${escapeHtml(firstText(scene.visual.caption, scene.visual.note, scene.visual.rule, scene.subheadline))}</div>
    ${examples(scene)}
  `;
}

function mistakeCorrection(scene) {
  const mistake = Array.isArray(scene.visual.mistakes) ? scene.visual.mistakes[0] : null;
  const wrong = firstText(scene.visual.wrong, mistake?.wrong, scene.practice?.question, scene.examples?.[0]?.en, "Câu sai chưa rõ");
  const right = firstText(scene.visual.right, mistake?.right, scene.practice?.answer, scene.examples?.[1]?.en, "Câu đúng chưa rõ");
  const reason = firstText(
    scene.visual.reason,
    mistake?.reason,
    mistake?.explanation,
    scene.practice?.explanation,
    scene.subheadline,
  );

  return `
    <div class="correction-board">
      <div class="wrong">Sai: ${escapeHtml(wrong)}</div>
      <div class="right">Đúng: ${escapeHtml(right)}</div>
      <div class="why">${escapeHtml(reason)}</div>
    </div>
  `;
}

function mindmapBoard(scene) {
  const center = firstText(scene.visual.center, scene.visual.main_text, scene.visual.title, scene.headline);
  const branches = uniqueClean([
    scene.visual.branches,
    scene.visual.nodes,
    scene.visual.markers,
    scene.visual.signals,
    scene.visual.points,
    bulletsFromScene(scene),
  ]).filter((item) => normalizeKey(item) !== normalizeKey(center));

  return `
    <div class="mindmap">
      <div class="mindmap-center">${escapeHtml(center)}</div>
      ${branches.slice(0, 5).map((item, index) => `<div class="mindmap-node node-${index + 1}">${escapeHtml(item)}</div>`).join("")}
    </div>
    ${examples(scene)}
  `;
}

function applicationBoard(scene) {
  const title = firstText(scene.visual.title, scene.visual.scenario, scene.subheadline, "Áp dụng ngay");
  const signalSteps = asArray(scene.visual.signals_highlighted).map((signal) => `Tín hiệu: ${textOf(signal)}`);
  const steps = uniqueClean([
    scene.visual.steps,
    scene.visual.items,
    scene.visual.input,
    scene.visual.output,
    scene.visual.example,
    signalSteps,
    scene.visual.tip,
    scene.visual.prompt,
    bulletsFromScene(scene),
  ]).filter((item) => normalizeKey(item) !== normalizeKey(title));

  return `<div class="application-board">
    <div class="application-title">${escapeHtml(title)}</div>
    ${steps.slice(0, 4).map((item) => `<div class="application-step">${escapeHtml(item)}</div>`).join("")}
  </div>`;
}

function dialogueBoard(scene) {
  const lines = uniqueClean([scene.visual.lines, scene.examples?.map((ex) => ex.en), bulletsFromScene(scene)]);
  return `<div class="dialogue">${lines
    .slice(0, 4)
    .map((line, index) => `<div class="bubble ${index % 2 ? "b" : "a"}">${escapeHtml(line)}</div>`)
    .join("")}</div>`;
}

function pronunciationBoard(scene) {
  const drills = uniqueClean([scene.visual.drills, scene.visual.examples, bulletsFromScene(scene)]);
  return `
    <div class="pronounce-word">${escapeHtml(firstText(scene.visual.word, scene.visual.phrase, scene.headline))}</div>
    <div class="stress">${escapeHtml(firstText(scene.visual.stress, scene.visual.pattern, scene.subheadline))}</div>
    <div class="drill-row">${drills.slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
  `;
}

function recapBoard(scene, lesson) {
  const items = uniqueClean([scene.visual.points, scene.visual.items, lesson.recap, bulletsFromScene(scene)]).slice(0, 5);
  return `<div class="recap-list">${items.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}</div>`;
}

function examples(scene) {
  if (!scene.examples?.length) return "";
  const rows = scene.examples
    .filter((ex) => ex?.en && ex?.vi)
    .slice(0, 2)
    .map((ex) => `<div><strong>${escapeHtml(ex.en)}</strong><span>${escapeHtml(ex.vi)}</span></div>`)
    .join("");
  return rows ? `<div class="mini-examples">${rows}</div>` : "";
}

function tableHeaders(scene) {
  return uniqueClean([scene.visual.columns, scene.visual.headers]).slice(0, 3).concat(["English", "Ý nghĩa", "Ghi chú"]).slice(0, 3);
}

function tableRows(scene) {
  if (Array.isArray(scene.visual.rows) && scene.visual.rows.length) {
    return scene.visual.rows.map((row) => {
      if (Array.isArray(row)) return [textOf(row[0]), textOf(row[1]), textOf(row[2])];
      return [textOf(row.en ?? row.english ?? row.text), textOf(row.vi ?? row.meaning), textOf(row.note ?? row.usage)];
    });
  }

  const source = scene.examples?.length ? scene.examples : fallbackExamples(scene);
  return source.map((ex) => [textOf(ex.en), textOf(ex.vi), textOf(ex.note)]);
}

function fallbackExamples(scene) {
  const bullets = bulletsFromScene(scene);
  return bullets.slice(0, 3).map((item) => ({ en: item, vi: scene.subheadline || "", note: "Ý chính cần nhớ." }));
}

function bulletsFromScene(scene) {
  return uniqueClean(
    String(scene.voiceover || scene.subheadline || scene.headline)
      .split(/[.!?。！？]/)
      .map((item) => item.trim())
      .filter(Boolean),
  ).slice(0, 5);
}

function summarizeVoiceover(scene) {
  return bulletsFromScene(scene)[0] || scene.subheadline || scene.headline;
}

function firstText(...values) {
  return values.map(textOf).find(Boolean) || "";
}

function uniqueClean(values) {
  const result = [];
  const seen = new Set();
  for (const value of values.flat(Infinity)) {
    const text = textOf(value);
    const key = normalizeKey(text);
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object") {
    return firstText(value.label, value.text, value.value, value.title, value.en, value.vi, value.note);
  }
  return String(value).trim();
}

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
