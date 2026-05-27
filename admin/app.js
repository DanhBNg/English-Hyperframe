const topic = document.getElementById("topic");
const statusPill = document.getElementById("status-pill");
const assetSummary = document.getElementById("asset-summary");
const tabContent = document.getElementById("tab-content");
const previewFrame = document.getElementById("preview-frame");
let activeTab = "logs";
let latestStatus = null;
let latestLogs = [];
let latestLesson = null;

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
  previewFrame.src = `/preview?ts=${Date.now()}`;
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
  setButtonsDisabled(latestStatus.running);
}

function renderStatus() {
  statusPill.textContent = latestStatus.status;
  statusPill.dataset.status = latestStatus.status;
  const audioCount = Object.keys(latestStatus.files.audioManifest || {}).length;
  const subtitleCount = Object.keys(latestStatus.files.subtitleManifest || {}).length;
  const totalScenes = latestLesson?.scenes?.length || 0;
  assetSummary.innerHTML = `
    <div><strong>${totalScenes}</strong><span>scenes</span></div>
    <div><strong>${audioCount}</strong><span>audio</span></div>
    <div><strong>${subtitleCount}</strong><span>subtitles</span></div>
    <div><strong>${latestStatus.files.renders.length}</strong><span>renders</span></div>
  `;
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url} failed`);
  return response.json();
}

refresh();
setInterval(refresh, 2000);
