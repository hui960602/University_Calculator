// ================================================
//  分得剛好｜GPA 計算機
// ================================================

// ===== 1. 換算表：分數 ≥ min 就是這個等第 =====
const SCALES = {
  // 元智大學學則第十七條
  yzu: [
    { min: 80, grade: "A", point: 4 },
    { min: 70, grade: "B", point: 3 },
    { min: 60, grade: "C", point: 2 },
    { min: 50, grade: "D", point: 1 },
    { min: 0,  grade: "E", point: 0 }
  ],
  // 4.3 制（臺師大、東海大學等第制對照表）
  tw43: [
    { min: 90, grade: "A+", point: 4.3 },
    { min: 85, grade: "A",  point: 4.0 },
    { min: 80, grade: "A-", point: 3.7 },
    { min: 77, grade: "B+", point: 3.3 },
    { min: 73, grade: "B",  point: 3.0 },
    { min: 70, grade: "B-", point: 2.7 },
    { min: 67, grade: "C+", point: 2.3 },
    { min: 63, grade: "C",  point: 2.0 },
    { min: 60, grade: "C-", point: 1.7 },
    { min: 50, grade: "D",  point: 1.0 },
    { min: 0,  grade: "E",  point: 0 }
  ]
};

const STORAGE_KEY = "fendegangHao-gpa";

// courses：每一科，例如 { id: 1, name: "微積分", credit: "3", score: "85" }
// credit 和 score 先存成文字，計算時再轉成數字（這樣輸入到一半也不會被清掉）
let courses = [];
let nextId = 1;

// ===== 2. 儲存與讀取 =====
function saveData() {
  try {
    const data = { courses: courses, nextId: nextId, scale: document.getElementById("scale").value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    courses = data.courses || [];
    nextId = data.nextId || 1;
    if (data.scale && SCALES[data.scale]) document.getElementById("scale").value = data.scale;
  } catch (e) {}
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// ===== 3. 計算 =====
function getScale() {
  return SCALES[document.getElementById("scale").value];
}

// 分數 → 等第和積分
function toGrade(score) {
  const scale = getScale();
  for (const row of scale) {
    if (score >= row.min) return row;
  }
  return scale[scale.length - 1];
}

// 檢查一科有沒有填完整、數字合不合理
// 回傳 null 表示這科還沒填完（跳過不算），回傳字串表示有錯誤
function checkCourse(c) {
  if (c.credit === "" && c.score === "") return null;
  if (c.credit === "" || c.score === "") return null;
  const credit = Number(c.credit);
  const score = Number(c.score);
  if (!Number.isFinite(credit) || credit <= 0 || credit > 20) return "Credits must be a number between 0 and 20";
  if (!Number.isFinite(score) || score < 0 || score > 100) return "Score must be a number between 0 and 100";
  return { credit: credit, score: score };
}

function calcResult() {
  let totalCredit = 0;
  let totalPoint = 0;   // 學分 × 積分 的總和
  let totalScore = 0;   // 學分 × 分數 的總和
  let passCredit = 0;   // 及格（60 分以上）的學分
  let error = "";

  courses.forEach(function (c) {
    const ok = checkCourse(c);
    if (ok === null) return;
    if (typeof ok === "string") {
      error = (c.name || "A course") + ": " + ok;
      return;
    }
    const g = toGrade(ok.score);
    totalCredit += ok.credit;
    totalPoint += ok.credit * g.point;
    totalScore += ok.credit * ok.score;
    if (ok.score >= 60) passCredit += ok.credit;
  });

  return {
    error: error,
    totalCredit: totalCredit,
    passCredit: passCredit,
    gpa: totalCredit > 0 ? totalPoint / totalCredit : 0,
    average: totalCredit > 0 ? totalScore / totalCredit : 0
  };
}

// ===== 4. 畫面 =====
function renderScaleTable() {
  const scale = getScale();
  let html = "";
  scale.forEach(function (row, i) {
    const max = (i === 0) ? 100 : scale[i - 1].min - 1;
    html += '<span class="scale-chip"><strong>' + row.grade + "</strong> " +
      row.min + "–" + max + " → " + row.point + "</span>";
  });
  document.getElementById("scale-table").innerHTML = html;
}

function renderCourses() {
  const list = document.getElementById("course-list");
  list.innerHTML = courses.map(function (c) {
    return '<div class="course-row" data-id="' + c.id + '">' +
      '<input type="text" data-field="name" placeholder="Course name" value="' + escapeHTML(c.name) + '">' +
      '<input type="number" data-field="credit" min="0" step="0.5" placeholder="3" value="' + escapeHTML(c.credit) + '">' +
      '<input type="number" data-field="score" min="0" max="100" placeholder="85" value="' + escapeHTML(c.score) + '">' +
      '<span class="grade-badge" id="grade-' + c.id + '"></span>' +
      '<button onclick="removeCourse(' + c.id + ')" aria-label="Delete this course">✕</button>' +
      "</div>";
  }).join("");
  updateGrades();
}

// 只更新每一科的等第標籤（打字時不重畫輸入框，才不會打斷輸入）
function updateGrades() {
  courses.forEach(function (c) {
    const badge = document.getElementById("grade-" + c.id);
    if (!badge) return;
    const ok = checkCourse(c);
    if (ok === null || typeof ok === "string") {
      badge.textContent = "–";
      badge.className = "grade-badge";
      return;
    }
    const g = toGrade(ok.score);
    badge.textContent = g.grade + " " + g.point;
    badge.className = "grade-badge" + (ok.score < 60 ? " fail" : "");
  });
}

function renderResult() {
  const r = calcResult();
  const box = document.getElementById("gpa-result");
  document.getElementById("gpa-error").textContent = r.error;

  if (r.totalCredit === 0) {
    box.innerHTML = '<p class="hint">Enter credits and scores to see your result here.</p>';
    return;
  }

  const max = document.getElementById("scale").value === "yzu" ? 4 : 4.3;
  let html = '<div class="stat-grid">' +
    '<div class="stat"><div class="stat-num">' + r.gpa.toFixed(2) + '</div><div class="stat-label">GPA (out of ' + max + ")</div></div>" +
    '<div class="stat"><div class="stat-num">' + r.average.toFixed(2) + '</div><div class="stat-label">Weighted average</div></div>' +
    '<div class="stat"><div class="stat-num">' + r.totalCredit + '</div><div class="stat-label">Total credits</div></div>' +
    '<div class="stat"><div class="stat-num">' + r.passCredit + '</div><div class="stat-label">Credits passed (60+)</div></div>' +
    "</div>";

  if (document.getElementById("scale").value === "yzu") {
    if (r.average >= 80) {
      html += '<p class="saved">Average 80 or above: under YZU regulations, you may take up to 6 extra credits next semester.</p>';
    } else {
      html += '<p class="hint">Under YZU regulations, a semester average of 80 or above lets you take up to 6 extra credits next semester. You are ' +
        (80 - r.average).toFixed(2) + " points away.</p>";
    }
  }
  box.innerHTML = html;
}

function update() {
  renderResult();
  saveData();
}

// ===== 5. 操作 =====
function addCourse() {
  courses.push({ id: nextId++, name: "", credit: "", score: "" });
  renderCourses();
  update();
  // 自動把游標放到新的科目名稱
  const rows = document.querySelectorAll(".course-row");
  rows[rows.length - 1].querySelector("input").focus();
}

function removeCourse(id) {
  courses = courses.filter(function (c) { return c.id !== id; });
  if (courses.length === 0) courses.push({ id: nextId++, name: "", credit: "", score: "" });
  renderCourses();
  update();
}

let clearTimer = null;
function clearCourses() {
  const btn = document.getElementById("clear-course-btn");
  if (clearTimer === null) {
    btn.textContent = "Tap again to clear";
    clearTimer = setTimeout(function () { btn.textContent = "Clear all"; clearTimer = null; }, 3000);
    return;
  }
  clearTimeout(clearTimer);
  clearTimer = null;
  btn.textContent = "Clear all";
  courses = [{ id: nextId++, name: "", credit: "", score: "" }];
  renderCourses();
  update();
}

// 在輸入框打字時：把值存回 courses，再更新結果
function onCourseInput(e) {
  const input = e.target;
  const row = input.closest(".course-row");
  if (!row) return;
  const c = courses.find(function (c) { return c.id === Number(row.dataset.id); });
  c[input.dataset.field] = input.value.trim();
  updateGrades();
  update();
}

function init() {
  loadData();
  if (courses.length === 0) {
    for (let i = 0; i < 3; i++) courses.push({ id: nextId++, name: "", credit: "", score: "" });
  }
  document.getElementById("scale").addEventListener("change", function () {
    renderScaleTable();
    updateGrades();
    update();
  });
  document.getElementById("course-list").addEventListener("input", onCourseInput);
  document.getElementById("add-course-btn").addEventListener("click", addCourse);
  document.getElementById("clear-course-btn").addEventListener("click", clearCourses);

  renderScaleTable();
  renderCourses();
  update();
}

document.addEventListener("DOMContentLoaded", init);
