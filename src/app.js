const STORAGE_KEY = "lingotrace-mobile-state-v1";

const sampleReport = {
  schema: "LINGOTRACE_REPORT_V1",
  date: new Date().toISOString().slice(0, 10),
  title: "Evening Speaking Review",
  summary: "今天围绕工作交接和会议推进做了口语练习。整体表达更顺，但介词和副词位置还需要复习。",
  scores: { fluency: 84, accuracy: 76, vocabulary: 88 },
  words: [
    { term: "handover", meaning: "交接", example: "Let's prepare the handover notes before Friday." },
    { term: "timeline", meaning: "时间线；进度安排", example: "Could you walk me through the timeline?" },
    { term: "blocker", meaning: "阻碍进展的问题", example: "The missing data is our biggest blocker." }
  ],
  sentences: [
    { text: "Could you walk me through the timeline?", translation: "你能带我过一下时间线吗？" },
    { text: "I will send over the revised version tonight.", translation: "我今晚会把修订版发过去。" }
  ],
  corrections: [
    { before: "I very like this plan.", after: "I really like this plan.", note: "very 不能直接修饰 like，用 really 更自然。" },
    { before: "We discussed about the timeline.", after: "We discussed the timeline.", note: "discuss 是及物动词，后面不加 about。" }
  ]
};

const defaultState = {
  activeTab: "home",
  reports: [sampleReport],
  review: {},
  importText: "",
  toast: ""
};

let state = loadState();

const tabConfig = [
  { id: "home", label: "首页", icon: "home" },
  { id: "reports", label: "日报", icon: "calendar" },
  { id: "words", label: "词库", icon: "book" },
  { id: "practice", label: "练习", icon: "spark" },
  { id: "settings", label: "设置", icon: "gear" }
];

const icons = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M7 3v4M17 3v4"/><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 10h16"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H20v18H8.5A3.5 3.5 0 0 0 5 23V5.5Z"/><path d="M5 5.5A3.5 3.5 0 0 1 8.5 9H20"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M3 12h2m14 0h2M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v4h16v-4"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>'
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, toast: "" } : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ reports: state.reports, review: state.review }));
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function allWords() {
  return state.reports.flatMap((report) =>
    normalizeList(report.words || report.vocabulary).map((word) => ({
      ...word,
      id: wordId(report, word.term || word.word || word.text),
      reportDate: report.date
    }))
  );
}

function allSentences() {
  return state.reports.flatMap((report) =>
    normalizeList(report.sentences || report.phrases).map((item, index) => ({
      ...item,
      id: `${report.date || "undated"}-sentence-${index}`,
      reportDate: report.date
    }))
  );
}

function allCorrections() {
  return state.reports.flatMap((report) =>
    normalizeList(report.corrections || report.mistakes).map((item, index) => ({
      ...item,
      id: `${report.date || "undated"}-correction-${index}`,
      reportDate: report.date
    }))
  );
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function wordId(report, term = "") {
  return `${report.date || "undated"}-${String(term).toLowerCase().trim()}`;
}

function latestReport() {
  return [...state.reports].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
}

function averageScore(report) {
  const values = Object.values(report?.scores || {}).map(Number).filter((n) => Number.isFinite(n));
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function dueWords() {
  return allWords().filter((word) => state.review[word.id] !== "mastered");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  return `<span class="icon" aria-hidden="true">${icons[name] || ""}</span>`;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <main class="phone-shell">
      <section class="screen">
        ${renderHeader()}
        <div class="content">${renderTab()}</div>
        ${renderNav()}
      </section>
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
    </main>
  `;
  bindEvents();
}

function renderHeader() {
  const latest = latestReport();
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${escapeHtml(latest?.date || "准备开始")}</p>
        <h1>LingoTrace</h1>
      </div>
      <button class="icon-button" data-action="sample" title="加入示例日报">${icon("plus")}</button>
    </header>
  `;
}

function renderTab() {
  const views = {
    home: renderHome,
    reports: renderReports,
    words: renderWords,
    practice: renderPractice,
    settings: renderSettings
  };
  return views[state.activeTab]();
}

function renderHome() {
  const latest = latestReport();
  const score = averageScore(latest);
  const words = allWords();
  const mastered = words.filter((word) => state.review[word.id] === "mastered").length;
  return `
    <section class="hero-band">
      <div class="hero-copy">
        <p>今日学习力</p>
        <strong>${score || "--"}</strong>
      </div>
      <div class="orbit-card">
        <span>${words.length}</span>
        <small>词条</small>
      </div>
    </section>
    <section class="metric-grid">
      ${metric("日报", state.reports.length)}
      ${metric("待复习", dueWords().length)}
      ${metric("已掌握", mastered)}
    </section>
    <section class="panel import-panel">
      <div class="panel-heading">
        <h2>导入日报</h2>
        <button class="text-button" data-action="load-example">示例</button>
      </div>
      <textarea id="importText" placeholder="粘贴 ChatGPT 输出的 LINGOTRACE_REPORT_V1 JSON">${escapeHtml(state.importText)}</textarea>
      <button class="primary-button" data-action="import">${icon("upload")}导入到我的词库</button>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>最近总结</h2></div>
      <p class="summary-text">${escapeHtml(latest?.summary || "还没有日报。先导入一份学习记录，首页会自动更新。")}</p>
    </section>
  `;
}

function metric(label, value) {
  return `<article class="metric"><span>${escapeHtml(value)}</span><small>${escapeHtml(label)}</small></article>`;
}

function renderReports() {
  const reports = [...state.reports].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return `
    <section class="list-stack">
      ${reports.map((report, index) => `
        <article class="panel report-card">
          <div class="panel-heading">
            <div>
              <h2>${escapeHtml(report.title || report.date || "未命名日报")}</h2>
              <p>${escapeHtml(report.date || "无日期")} · ${averageScore(report) || "--"} 分</p>
            </div>
            <button class="icon-button ghost" data-action="delete-report" data-index="${index}" title="删除日报">${icon("trash")}</button>
          </div>
          <p class="summary-text">${escapeHtml(report.summary || "没有总结。")}</p>
          <div class="chips">
            <span>${normalizeList(report.words || report.vocabulary).length} 词</span>
            <span>${normalizeList(report.sentences || report.phrases).length} 句</span>
            <span>${normalizeList(report.corrections || report.mistakes).length} 处纠错</span>
          </div>
        </article>
      `).join("") || empty("暂无日报", "从首页导入第一份 JSON。")}
    </section>
  `;
}

function renderWords() {
  const words = allWords();
  return `
    <section class="list-stack">
      ${words.map((word) => {
        const term = word.term || word.word || word.text || "Untitled";
        return `
          <article class="panel word-card">
            <div class="word-row">
              <div>
                <h2>${escapeHtml(term)}</h2>
                <p>${escapeHtml(word.meaning || word.translation || word.definition || "未填写释义")}</p>
              </div>
              <button class="status-pill ${state.review[word.id] === "mastered" ? "done" : ""}" data-action="toggle-word" data-id="${escapeHtml(word.id)}">
                ${state.review[word.id] === "mastered" ? "已掌握" : "复习中"}
              </button>
            </div>
            <blockquote>${escapeHtml(word.example || word.sentence || "还没有例句。")}</blockquote>
            <small>${escapeHtml(word.reportDate || "")}</small>
          </article>
        `;
      }).join("") || empty("词库为空", "导入日报后会自动整理单词。")}
    </section>
  `;
}

function renderPractice() {
  const word = dueWords()[0] || allWords()[0];
  const sentences = allSentences().slice(0, 3);
  const corrections = allCorrections().slice(0, 3);
  return `
    <section class="panel drill-card">
      <div class="panel-heading"><h2>今日卡片</h2></div>
      ${word ? `
        <p class="prompt">看到中文后，试着说出英文词或造句。</p>
        <h3>${escapeHtml(word.meaning || word.translation || "释义缺失")}</h3>
        <details>
          <summary>显示答案</summary>
          <strong>${escapeHtml(word.term || word.word || word.text)}</strong>
          <p>${escapeHtml(word.example || word.sentence || "")}</p>
        </details>
        <button class="primary-button" data-action="master-current" data-id="${escapeHtml(word.id)}">${icon("check")}这张会了</button>
      ` : empty("没有可练习内容", "先导入一份学习日报。")}
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>句型跟读</h2></div>
      ${sentences.map((item) => `
        <div class="line-item">
          <strong>${escapeHtml(item.text || item.sentence || item.phrase)}</strong>
          <span>${escapeHtml(item.translation || item.meaning || "")}</span>
        </div>
      `).join("") || empty("暂无句型", "日报里加入 sentences 或 phrases 字段。")}
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>纠错复盘</h2></div>
      ${corrections.map((item) => `
        <div class="fix-item">
          <del>${escapeHtml(item.before || item.wrong || "")}</del>
          <ins>${escapeHtml(item.after || item.correct || "")}</ins>
          <span>${escapeHtml(item.note || item.reason || "")}</span>
        </div>
      `).join("") || empty("暂无纠错", "日报里加入 corrections 或 mistakes 字段。")}
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-heading"><h2>数据</h2></div>
      <div class="button-grid">
        <button class="secondary-button" data-action="export">${icon("download")}导出备份</button>
        <button class="secondary-button danger" data-action="clear">${icon("trash")}清空本地数据</button>
      </div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>给 ChatGPT 的提示词</h2></div>
      <p class="summary-text">把学习聊天内容整理为 LINGOTRACE_REPORT_V1 JSON，包含 date、summary、scores、words、sentences、corrections 字段，只输出 JSON。</p>
      <button class="secondary-button" data-action="copy-prompt">${icon("copy")}复制提示词</button>
    </section>
  `;
}

function empty(title, text) {
  return `<div class="empty"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
}

function renderNav() {
  return `
    <nav class="bottom-nav" aria-label="主导航">
      ${tabConfig.map((tab) => `
        <button class="${state.activeTab === tab.id ? "active" : ""}" data-tab="${tab.id}">
          ${icon(tab.icon)}
          <span>${tab.label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setState({ activeTab: button.dataset.tab }));
  });

  const importText = document.querySelector("#importText");
  if (importText) {
    importText.addEventListener("input", (event) => {
      state.importText = event.target.value;
    });
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button));
  });
}

function handleAction(button) {
  const action = button.dataset.action;
  if (action === "load-example" || action === "sample") {
    setState({ activeTab: action === "sample" ? "home" : state.activeTab, importText: JSON.stringify(sampleReport, null, 2), toast: "示例已填入" });
  }
  if (action === "import") importReport();
  if (action === "toggle-word" || action === "master-current") toggleWord(button.dataset.id);
  if (action === "delete-report") deleteReport(Number(button.dataset.index));
  if (action === "export") exportData();
  if (action === "clear") clearData();
  if (action === "copy-prompt") copyPrompt();
}

function importReport() {
  const text = document.querySelector("#importText")?.value.trim();
  if (!text) return setState({ toast: "先粘贴一段 JSON" });
  try {
    const parsed = JSON.parse(text);
    const incoming = Array.isArray(parsed) ? parsed : [parsed.report || parsed];
    const cleaned = incoming.map(cleanReport);
    setState({
      reports: mergeReports(state.reports, cleaned),
      importText: "",
      activeTab: "reports",
      toast: `已导入 ${cleaned.length} 份日报`
    });
  } catch {
    setState({ toast: "JSON 格式没有解析成功" });
  }
}

function cleanReport(report) {
  return {
    schema: report.schema || "LINGOTRACE_REPORT_V1",
    date: report.date || report.day || new Date().toISOString().slice(0, 10),
    title: report.title || report.topic || "Learning Report",
    summary: report.summary || report.overview || "",
    scores: report.scores || report.score || {},
    words: normalizeList(report.words || report.vocabulary || report.items),
    sentences: normalizeList(report.sentences || report.phrases || report.patterns),
    corrections: normalizeList(report.corrections || report.mistakes || report.errors)
  };
}

function mergeReports(existing, incoming) {
  const map = new Map(existing.map((report) => [`${report.date}-${report.title}`, report]));
  incoming.forEach((report) => map.set(`${report.date}-${report.title}`, report));
  return [...map.values()];
}

function toggleWord(id) {
  const next = { ...state.review };
  next[id] = next[id] === "mastered" ? "learning" : "mastered";
  setState({ review: next, toast: next[id] === "mastered" ? "已标记掌握" : "已放回复习" });
}

function deleteReport(index) {
  const sorted = [...state.reports].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const target = sorted[index];
  setState({
    reports: state.reports.filter((report) => report !== target),
    toast: "已删除日报"
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify({ reports: state.reports, review: state.review }, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `lingotrace-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function clearData() {
  if (!confirm("确定清空本地学习数据吗？")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = { ...defaultState, reports: [], review: {}, toast: "已清空" };
  render();
}

function copyPrompt() {
  const prompt = "请把本次英语学习对话整理为 LINGOTRACE_REPORT_V1 JSON，包含 date、title、summary、scores{fluency,accuracy,vocabulary}、words[{term,meaning,example}]、sentences[{text,translation}]、corrections[{before,after,note}]。只输出 JSON。";
  navigator.clipboard?.writeText(prompt);
  setState({ toast: "提示词已复制" });
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

render();
