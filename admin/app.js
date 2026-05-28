const topic = document.getElementById("topic");
const statusPill = document.getElementById("status-pill");
const assetSummary = document.getElementById("asset-summary");
const tabContent = document.getElementById("tab-content");
const previewFrame = document.getElementById("preview-frame");
const renderPreview = document.getElementById("render-preview");
const renderVideo = document.getElementById("render-video");
const renderEmpty = document.getElementById("render-empty");
const renderLink = document.getElementById("render-link");
let activeTab = "logs";
let previewMode = "composition";
let latestStatus = null;
let latestLogs = [];
let latestLesson = null;
let latestRenderSrc = "";

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", async () => {
    await post(`/api/${button.dataset.action}`, { topic: topic.value.trim() });
    await refresh();
  });
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeTab = button.dataset.tab;
    renderTab();
  });
});

document.getElementById("refresh-preview").addEventListener("click", () => {
  if (previewMode === "composition") {
    previewFrame.src = `/preview?ts=${Date.now()}`;
    return;
  }
  refreshRenderedVideo(true);
});

async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok && response.status !== 202) {
    const data = await response.json().catch(() => ({}));
    alert(data.error || `Request failed ${response.status}`);
  }
}

async function refresh() {
  latestStatus = await fetchJson("/api/status");
  latestLogs = (await fetchJson("/api/logs")).logs || [];
  latestLesson = await fetchJson("/api/lesson").catch(() => null);
  renderStatus();
  renderTab();
  renderPreviewMode();
  setButtonsDisabled(latestStatus.running);
}

function renderStatus() {
  statusPill.textContent = latestStatus.status;
  statusPill.dataset.status = latestStatus.status;
  const audioCount = Object.keys(latestStatus.files.audioManifest || {}).length;
  const subtitleCount = Object.keys(latestStatus.files.subtitleManifest || {}).length;
  const renderCount = latestStatus.files.renders.length;
  const totalScenes = latestLesson?.scenes?.length || 0;
  assetSummary.innerHTML = `
    <div><strong>${totalScenes}</strong><span>scenes</span></div>
    <div><strong>${audioCount}</strong><span>audio</span></div>
    <div><strong>${subtitleCount}</strong><span>subtitles</span></div>
    <div><strong>${renderCount}</strong><span>renders</span></div>
  `;
  refreshRenderedVideo(false);
}

function renderTab() {
  if (activeTab === "lesson") {
    tabContent.textContent = JSON.stringify(latestLesson, null, 2);
    return;
  }
  if (activeTab === "assets") {
    tabContent.textContent = JSON.stringify(latestStatus.files, null, 2);
    return;
  }
  tabContent.textContent = latestLogs.map((entry) => `[${entry.time.slice(11, 19)}] ${entry.line}`).join("\n");
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.disabled = disabled;
  });
}

document.querySelectorAll("[data-preview-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    previewMode = button.dataset.previewMode;
    document.querySelectorAll("[data-preview-mode]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderPreviewMode();
  });
});

function renderPreviewMode() {
  const showingRender = previewMode === "render";
  previewFrame.hidden = showingRender;
  renderPreview.hidden = !showingRender;
  if (showingRender) refreshRenderedVideo(false);
}

function refreshRenderedVideo(forceReload) {
  const latestRender = latestStatus?.files?.latestRender;
  if (!latestRender?.src) {
    latestRenderSrc = "";
    renderVideo.removeAttribute("src");
    renderVideo.hidden = true;
    renderEmpty.hidden = false;
    renderLink.hidden = true;
    return;
  }

  const src = `${latestRender.src}${forceReload ? `?ts=${Date.now()}` : ""}`;
  if (forceReload || latestRender.src !== latestRenderSrc) {
    latestRenderSrc = latestRender.src;
    renderVideo.src = src;
    renderVideo.load();
  }
  renderVideo.hidden = false;
  renderEmpty.hidden = true;
  renderLink.href = latestRender.src;
  renderLink.textContent = `Mở video: ${latestRender.name}`;
  renderLink.hidden = false;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url} failed`);
  return response.json();
}

refresh();
setInterval(refresh, 2000);
