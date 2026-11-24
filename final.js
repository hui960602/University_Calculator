// ================================================
//  分得剛好｜期末要考幾分
// ================================================

const STORAGE_KEY = "fendegangHao-final";

// 預設的成績項目（score 空白表示還沒考）
function defaultItems() {
  return [
    { id: 1, name: "Coursework", weight: "30", score: "" },
    { id: 2, name: "Midterm", weight: "30", score: "" },
    { id: 3, name: "Final exam", weight: "40", score: "" }
  ];
}

let items = defaultItems();
let nextId = 4;
let target = 60;

// ===== 1. 儲存與讀取 =====
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: items, nextId: nextId, target: target }));
  } catch (e) {}
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.items && data.items.length > 0) items = data.items;
    nextId = data.nextId || nextId;
    target = data.target || 60;
  } catch (e) {}
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// 無條件進位到小數點後 1 位（例如 72.31 → 72.4），寧可多考一點也不要差一點
function ceil1(n) {
  return Math.ceil(n * 10 - 1e-9) / 10;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// ===== 2. 計算 =====
// 回傳 { error, totalWeight, known（已拿到的分數）, unknownWeight（還沒考的比重） }
function analyze() {
  let totalWeight = 0;
  let known = 0;
  let unknownWeight = 0;

  for (const it of items) {
    if (it.weight === "") continue; // 比重沒填的項目先不算
    const w = Number(it.weight);
    if (!Number.isFinite(w) || w < 0 || w > 100) {
      return { error: (it.name || "An item") + ": weight must be between 0 and 100" };
    }
    totalWeight += w;

    if (it.score === "") {
      unknownWeight += w;
    } else {
      const s = Number(it.score);
      if (!Number.isFinite(s) || s < 0 || s > 100) {
        return { error: (it.name || "An item") + ": score must be between 0 and 100" };
      }
      known += s * w / 100;
    }
  }
  return { error: "", totalWeight: totalWeight, known: known, unknownWeight: unknownWeight };
}

// 要達到 goal 分，還沒考的部分平均要考幾分
function requiredScore(a, goal) {
  return (goal - a.known) / (a.unknownWeight / 100);
}

// ===== 3. 畫面 =====
function renderItems() {
  document.getElementById("item-list").innerHTML = items.map(function (it) {
    return '<div class="item-row" data-id="' + it.id + '">' +
      '<input type="text" data-field="name" placeholder="Item name" value="' + escapeHTML(it.name) + '">' +
      '<input type="number" data-field="weight" min="0" max="100" placeholder="30" value="' + escapeHTML(it.weight) + '">' +
      '<input type="number" data-field="score" min="0" max="100" placeholder="Not yet" value="' + escapeHTML(it.score) + '">' +
      '<button onclick="removeItem(' + it.id + ')" aria-label="Delete this item">✕</button>' +
      "</div>";
  }).join("");
}

function renderTarget() {
  document.querySelectorAll(".target-btn").forEach(function (b) {
    b.classList.toggle("selected", Number(b.dataset.target) === target);
  });
  document.getElementById("target").value = target;
}

// 依照需要的分數，給一句話
function verdict(need) {
  if (need <= 0) return { cls: "saved", text: "You're already there. Even 0 on the rest still reaches the target." };
  if (need > 100) return { cls: "warning-text", text: "Not reachable, even with full marks on everything left." };
  if (need >= 90) return { cls: "warning-text", text: "You'll need to do very well." };
  return { cls: "", text: "" };
}

function renderResult() {
  const box = document.getElementById("final-result");
  const errorBox = document.getElementById("final-error");
  const sumBox = document.getElementById("weight-sum");
  const a = analyze();

  if (a.error) {
    errorBox.textContent = a.error;
    box.innerHTML = "";
    return;
  }
  errorBox.textContent = "";

  // 比重加總提示
  if (a.totalWeight === 100) {
    sumBox.textContent = "Total weight: 100% ✓";
    sumBox.className = "hint";
  } else {
    sumBox.textContent = "Total weight: " + fmt(a.totalWeight) + "%. It should add up to exactly 100%.";
    sumBox.className = "error";
  }
  if (a.totalWeight !== 100) {
    box.innerHTML = '<p class="hint">Adjust the weights so they add up to exactly 100%.</p>';
    return;
  }

  // 全部都考完了：直接顯示學期成績
  if (a.unknownWeight === 0) {
    const pass = a.known >= 60;
    box.innerHTML = '<p class="big-answer">Semester grade: <strong>' + fmt(ceil1(a.known)) + "</strong></p>" +
      '<p class="' + (pass ? "saved" : "warning-text") + '">' + (pass ? "Passed ✓" : "Not passed") + "</p>";
    return;
  }

  const maxPossible = a.known + a.unknownWeight; // 還沒考的全部 100 分
  const need = requiredScore(a, target);
  const v = verdict(need);

  let html = '<p class="hint">You have ' + fmt(ceil1(a.known)) + " points so far. The remaining items are worth " +
    fmt(a.unknownWeight) + "%, so the highest possible grade is " + fmt(ceil1(maxPossible)) + ".</p>";

  if (need > 0 && need <= 100) {
    html += '<p class="big-answer">To get ' + target + ", you need at least <strong>" +
      fmt(ceil1(need)) + "</strong> on the rest</p>";
  } else {
    html += '<p class="big-answer">Target: ' + target + "</p>";
  }
  if (v.text) html += '<p class="' + v.cls + '">' + v.text + "</p>";

  // 各種目標一次看
  html += "<table><tr><th>Target</th><th>Needed on the rest</th></tr>";
  [60, 70, 80, 90].forEach(function (g) {
    const n = requiredScore(a, g);
    let text;
    if (n <= 0) text = "Already reached";
    else if (n > 100) text = "Not reachable";
    else text = fmt(ceil1(n));
    html += "<tr" + (g === target ? ' class="row-highlight"' : "") + "><td>" + g + "</td><td>" + text + "</td></tr>";
  });
  html += "</table>";

  box.innerHTML = html;
}

function update() {
  renderResult();
  saveData();
}

// ===== 4. 操作 =====
function addItem() {
  items.push({ id: nextId++, name: "", weight: "", score: "" });
  renderItems();
  update();
  const rows = document.querySelectorAll(".item-row");
  rows[rows.length - 1].querySelector("input").focus();
}

function removeItem(id) {
  items = items.filter(function (it) { return it.id !== id; });
  renderItems();
  update();
}

function resetItems() {
  items = defaultItems();
  nextId = 4;
  renderItems();
  update();
}

function onItemInput(e) {
  const input = e.target;
  const row = input.closest(".item-row");
  if (!row) return;
  const it = items.find(function (it) { return it.id === Number(row.dataset.id); });
  it[input.dataset.field] = input.value.trim();
  update();
}

function init() {
  loadData();
  document.getElementById("item-list").addEventListener("input", onItemInput);
  document.getElementById("add-item-btn").addEventListener("click", addItem);
  document.getElementById("reset-item-btn").addEventListener("click", resetItems);

  document.querySelectorAll(".target-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      target = Number(b.dataset.target);
      renderTarget();
      update();
    });
  });
  document.getElementById("target").addEventListener("input", function (e) {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n >= 1 && n <= 100) {
      target = n;
      document.querySelectorAll(".target-btn").forEach(function (b) {
        b.classList.toggle("selected", Number(b.dataset.target) === target);
      });
      update();
    }
  });

  renderItems();
  renderTarget();
  update();
}

document.addEventListener("DOMContentLoaded", init);
