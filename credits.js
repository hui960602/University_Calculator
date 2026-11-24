// ================================================
//  分得剛好｜畢業學分進度
// ================================================

const STORAGE_KEY = "fendegangHao-credits";

// 元智大學學則第十三條：第一到第三學年每學期 16～25 學分（第四學年下限 9 學分）
const MIN_PER_SEMESTER = 16;
const MAX_PER_SEMESTER = 25;

// ===== 1. 元智資訊學院英語學士班（114 學年入學）的課程資料 =====
// series：實習 / 專題系列的課，只有選到那個系列時才會出現
const DEPT_COURSES = [
  { id: "IN101", name: "Calculus (I)", credit: 3, term: "Year 1 Fall" },
  { id: "IN102", name: "Introduction to Computer Science", credit: 3, term: "Year 1 Fall" },
  { id: "IN103", name: "Computer Programming (I)", credit: 3, term: "Year 1 Fall" },
  { id: "IN105", name: "Calculus (II)", credit: 3, term: "Year 1 Spring" },
  { id: "IN106", name: "Discrete Mathematics", credit: 3, term: "Year 1 Spring" },
  { id: "IN107", name: "Computer Programming (II)", credit: 3, term: "Year 1 Spring" },
  { id: "IN201", name: "Linear Algebra", credit: 3, term: "Year 2 Fall" },
  { id: "IN202", name: "Data Structures", credit: 3, term: "Year 2 Fall" },
  { id: "IN204", name: "Digital System Design", credit: 3, term: "Year 2 Fall" },
  { id: "IN207", name: "Probability and Statistics", credit: 3, term: "Year 2 Spring" },
  { id: "IN208", name: "Introduction to Algorithms", credit: 3, term: "Year 2 Spring" },
  { id: "IN209", name: "Introduction to Operating System", credit: 3, term: "Year 2 Spring" },
  { id: "IN210", name: "Assembly Language and Computer Organization", credit: 3, term: "Year 2 Spring" },
  { id: "IN301", name: "Introduction to Computer Networks", credit: 3, term: "Year 3 Fall" },
  { id: "IN319", name: "Artificial Intelligence and Applications", credit: 3, term: "Year 3 Spring" },
  { id: "IN431", name: "Special Project (I)", credit: 3, term: "Year 3 Spring", series: "project" },
  { id: "IN421", name: "Practical Training (I)", credit: 3, term: "Year 3 Spring", series: "intern" },
  { id: "IN401", name: "Introduction to Database System", credit: 3, term: "Year 4 Fall" },
  { id: "IN432", name: "Special Project (II)", credit: 3, term: "Year 4 Fall", series: "project" },
  { id: "IN423", name: "Practical Training (III)", credit: 3, term: "Year 4 Fall", series: "intern" }
];

const COLLEGE_COURSES = [
  { id: "CI001", name: "Fundamental Computer Programming - C++ Lab (I)", credit: 2 },
  { id: "CI002", name: "Fundamental Computer Programming - C++ Lab (II)", credit: 2 }
];

const COMMON_COURSES = [
  { id: "CH1", name: "Chinese Reading, Critical Thinking, and Expression (I)", credit: 2 },
  { id: "CH2", name: "Chinese Reading, Critical Thinking, and Expression (II)", credit: 2 },
  { id: "EN1", name: "English (I)", credit: 2 },
  { id: "EN2", name: "English (II)", credit: 2 },
  { id: "TH1", name: "English Thematic Course (1st)", credit: 2 },
  { id: "TH2", name: "English Thematic Course (2nd)", credit: 2 },
  { id: "EL160", name: "English Testing", credit: 2 },
  { id: "CLS", name: "A Guide to Classics (Year 2 or above)", credit: 2 },
  { id: "SVC", name: "Service Learning", credit: 1 }
];

const GE_COURSES = [
  { id: "GE-H", name: "Humanities", credit: 2 },
  { id: "GE-N", name: "Natural Science", credit: 2 },
  { id: "GE-S", name: "Social Science", credit: 2 },
  { id: "GE-L", name: "Life Science", credit: 2 },
  { id: "GE-X", name: "Interdisciplinary (any of the four)", credit: 2 }
];

// 資英系上的選修課（選修科目表）
const ELECTIVE_COURSES = [
  { id: "IN104", name: "Intellectual Property", credit: 3, term: "Year 1 Fall" },
  { id: "IN111", name: "English Listening and Reading (I)", credit: 2, term: "Year 1 Fall" },
  { id: "IN110", name: "Management Information Systems", credit: 3, term: "Year 1 Spring" },
  { id: "IN112", name: "English Listening and Reading (II)", credit: 2, term: "Year 1 Spring" },
  { id: "IN113", name: "Circuit Theory", credit: 3, term: "Year 1 Spring" },
  { id: "IN203", name: "Introduction to Data Communications", credit: 3, term: "Year 2 Fall" },
  { id: "IN206", name: "Web Programming", credit: 3, term: "Year 2 Fall" },
  { id: "IN304", name: "Service and Technology Management", credit: 3, term: "Year 2 Fall" },
  { id: "IN211", name: "Information Privacy", credit: 3, term: "Year 2 Spring" },
  { id: "IN302", name: "Introduction to Compiler", credit: 3, term: "Year 3 Fall" },
  { id: "IN303", name: "Embedded System Design and Practice", credit: 3, term: "Year 3 Fall" },
  { id: "IN309", name: "Virtual Reality", credit: 3, term: "Year 3 Fall" },
  { id: "IN315", name: "Introduction to Big Data Analysis", credit: 3, term: "Year 3 Fall" },
  { id: "IN317", name: "Smart Manufacturing", credit: 3, term: "Year 3 Fall" },
  { id: "IN311", name: "English Presentation Skills", credit: 3, term: "Year 3 Fall" },
  { id: "IN312", name: "Introduction to Artificial Intelligence", credit: 3, term: "Year 3 Fall" },
  { id: "IN320", name: "Introduction to VLSI Design", credit: 3, term: "Year 3 Fall" },
  { id: "IN308", name: "MIS Professional Communication", credit: 3, term: "Year 3 Spring" },
  { id: "IN310", name: "Mobile Device Programming", credit: 3, term: "Year 3 Spring" },
  { id: "IN313", name: "Academic English Writing", credit: 3, term: "Year 3 Spring" },
  { id: "IN314", name: "Introduction to Image Processing", credit: 3, term: "Year 3 Spring" },
  { id: "IN316", name: "Data Mining", credit: 3, term: "Year 3 Spring" },
  { id: "IN318", name: "Sonic Interaction Design", credit: 3, term: "Year 3 Spring" },
  { id: "IN422", name: "Practical Training (II)", credit: 3, term: "Year 3 Spring" },
  { id: "IN402", name: "Introduction to Computer and Network Security", credit: 3, term: "Year 4 Fall" },
  { id: "IN403", name: "Decision Support Systems", credit: 3, term: "Year 4 Fall" },
  { id: "IN404", name: "Marketing Management", credit: 3, term: "Year 4 Fall" },
  { id: "IN424", name: "Practical Training (IV)", credit: 3, term: "Year 4 Fall" },
  { id: "IN425", name: "Practical Training (V)", credit: 4, term: "Year 4 Spring" },
  { id: "IN426", name: "Practical Training (VI)", credit: 3, term: "Year 4 Spring" }
];

// 英語聽與讀：多益未達 750 分要修（學分算在選修）
const LISTENING_COURSES = ELECTIVE_COURSES.filter(function (c) {
  return c.id === "IN111" || c.id === "IN112";
});

// 選修 43 學分的分類規定
const DEPT_ELECTIVE_MIN = 18;    // 資英系選修至少 18 學分
const COLLEGE_ELECTIVE_MIN = 12; // 資訊學院專業選修至少 12 學分
const FREE_ELECTIVE_MAX = 13;    // 自由選修最多採計 13 學分

const ELECTIVE_NEED = 43;

// ===== 2. 狀態 =====
// courseState：每門課的狀態，"" = 未修、"done" = 已修、"now" = 修課中
let state = {
  mode: "yzu-ib",
  courseState: {},
  series: "project",
  outside: [],        // 系外選修，例如 { id: 1, name: "資料庫實務", credit: 3, type: "college", status: "done" }
  outsideNextId: 1,
  cpe: false,
  peDone: "0",
  peNow: false,
  serviceCourse: "",
  serviceActivity: "",
  toeic750: false,
  perSemester: "",
  custom: null,
  customNextId: 4
};

function emptyCategories() {
  return [
    { id: 1, name: "Required", need: "", done: "", now: "" },
    { id: 2, name: "Electives", need: "", done: "", now: "" },
    { id: 3, name: "General Education", need: "", done: "", now: "" }
  ];
}

// 「填入範例」用的假資料（只是示範）
function exampleCategories() {
  return [
    { id: 1, name: "Required", need: "70", done: "38", now: "12" },
    { id: 2, name: "Electives", need: "30", done: "6", now: "3" },
    { id: 3, name: "General Education", need: "28", done: "14", now: "4" }
  ];
}

// ===== 3. 儲存與讀取 =====
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.courseState) state = Object.assign(state, data);
    }
  } catch (e) {}
  if (!state.custom || state.custom.length === 0) state.custom = emptyCategories();
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// 空白當 0；不合理的數字回傳 NaN
function toNum(v) {
  if (v === "" || v === undefined) return 0;
  const n = Number(v);
  return (Number.isFinite(n) && n >= 0 && n <= 300) ? n : NaN;
}

// ===== 4. 課程按鈕（點一下切換：未修 → 已修 → 修課中 → 未修） =====
const NEXT_STATE = { "": "done", "done": "now", "now": "" };
const STATE_TEXT = { "": "", "done": "Completed ✓", "now": "In progress" };

function chipHTML(c) {
  const s = state.courseState[c.id] || "";
  return '<button type="button" class="course-chip ' + s + '" data-course="' + c.id + '">' +
    '<span class="chip-name">' + c.name + "</span>" +
    '<span class="chip-meta">' + c.credit + (c.credit === 1 ? " credit" : " credits") + (s ? " | " + STATE_TEXT[s] : "") + "</span>" +
    "</button>";
}

function deptCoursesNow() {
  return DEPT_COURSES.filter(function (c) { return !c.series || c.series === state.series; });
}

function renderYzu() {
  // 系必修：依學期分組
  const courses = deptCoursesNow();
  const terms = [];
  courses.forEach(function (c) { if (terms.indexOf(c.term) === -1) terms.push(c.term); });

  document.getElementById("dept-list").innerHTML = terms.map(function (t) {
    const inTerm = courses.filter(function (c) { return c.term === t; });
    return '<div class="term-group"><div class="term-head"><span>' + t + "</span>" +
      '<button type="button" class="link-btn" data-term="' + t + '">Mark all completed</button></div>' +
      '<div class="chip-wrap">' + inTerm.map(chipHTML).join("") + "</div></div>";
  }).join("");

  // 系選修：依學期分組（選修不放「整學期標為已修」）
  const eTerms = [];
  ELECTIVE_COURSES.forEach(function (c) { if (eTerms.indexOf(c.term) === -1) eTerms.push(c.term); });
  document.getElementById("elective-list").innerHTML = eTerms.map(function (t) {
    const inTerm = ELECTIVE_COURSES.filter(function (c) { return c.term === t; });
    return '<div class="term-group"><div class="term-head"><span>' + t + "</span></div>" +
      '<div class="chip-wrap">' + inTerm.map(chipHTML).join("") + "</div></div>";
  }).join("");

  document.getElementById("college-list").innerHTML = COLLEGE_COURSES.map(chipHTML).join("");
  document.getElementById("common-list").innerHTML = COMMON_COURSES.map(chipHTML).join("");
  document.getElementById("ge-list").innerHTML = GE_COURSES.map(chipHTML).join("");

  // 實習系列的提醒
  document.getElementById("series-note").textContent = (state.series === "intern")
    ? "Practical Training needs at least 12 credits: besides (I) and (III), you also need (II) and (IV), which count as electives. You must pass the Programming Proficiency Test before taking them."
    : "Special Project (I) and (II) are done on campus, following the program's Special Project rules.";

  // 系外選修：點一下切換已修／修課中，按 ✕ 刪除
  const TYPE_TEXT = { college: "College", free: "Free elective" };
  document.getElementById("outside-list").innerHTML = state.outside.map(function (o) {
    return '<div class="course-chip ' + o.status + '" data-outside="' + o.id + '" role="button" tabindex="0">' +
      '<span class="chip-name">' + escapeHTML(o.name) +
      '<span class="chip-remove" data-remove-outside="' + o.id + '" aria-label="Remove">✕</span></span>' +
      '<span class="chip-meta">' + o.credit + (o.credit === 1 ? " credit" : " credits") + " | " + TYPE_TEXT[o.type] + " | " + STATE_TEXT[o.status] + "</span>" +
      "</div>";
  }).join("");

  // 服務學習：學分已修，就代表時數都滿了，不用再填
  const svcDone = state.courseState.SVC === "done";
  document.getElementById("service-hours").classList.toggle("hidden", svcDone);
  document.getElementById("service-done-note").textContent = svcDone ? "Service Learning credit earned, so your hours are complete ✓" : "";

  // 英語聽與讀：多益未達 750 才需要
  document.getElementById("listening-note").textContent = state.toeic750 ? "" :
    "You need English Listening and Reading (I) and (II). Mark them in the electives above; the credits count as electives.";
}

function fillYzuInputs() {
  document.getElementById("cpe").checked = state.cpe;
  document.getElementById("pe-done").value = state.peDone;
  document.getElementById("pe-now").checked = state.peNow;
  document.getElementById("service-course").value = state.serviceCourse;
  document.getElementById("service-activity").value = state.serviceActivity;
  document.getElementById("toeic750").checked = state.toeic750;
  document.querySelector('input[name="series"][value="' + state.series + '"]').checked = true;
}

// ===== 5. 計算（兩種模式都整理成同樣的 rows 格式） =====
// 一組課程：算出已修和修課中的學分
function sumCourses(list) {
  let done = 0;
  let now = 0;
  list.forEach(function (c) {
    const s = state.courseState[c.id];
    if (s === "done") done += c.credit;
    if (s === "now") now += c.credit;
  });
  return { done: done, now: now };
}

// 建立一列：超過應修的部分不算
function makeRow(name, need, done, now) {
  const doneCounted = Math.min(done, need);
  const afterCounted = Math.min(done + now, need);
  return {
    name: name,
    need: need,
    done: doneCounted,
    now: afterCounted - doneCounted,
    rawDone: done,
    rawNow: now,
    over: done + now > need,
    donePct: doneCounted / need * 100,
    afterPct: afterCounted / need * 100,
    left: need - afterCounted
  };
}

// 系外選修：依類別和狀態加總
function sumOutside(type) {
  let done = 0;
  let now = 0;
  state.outside.forEach(function (o) {
    if (o.type !== type) return;
    if (o.status === "done") done += o.credit;
    if (o.status === "now") now += o.credit;
  });
  return { done: done, now: now };
}

// 把選修學分分到三類，算出畢業能採計多少
// S：資英系選修、C：資訊學院其他系所、F：非資訊學院
function allocElective(S, C, F) {
  const dept = Math.min(S, DEPT_ELECTIVE_MIN);             // 資英系選修最多算到 18
  const overflow = Math.max(0, S - DEPT_ELECTIVE_MIN);     // 資英系選修超過 18 的部分
  const college = C + overflow;                             // 系上認可：資英系選修超過 18 的部分，算進資訊學院專業選修
  const free = Math.min(F, FREE_ELECTIVE_MAX);              // 自由選修最多採計 13
  return {
    dept: dept,
    overflow: overflow,
    college: college,
    free: free,
    rawFree: F,
    total: Math.min(dept + college + free, ELECTIVE_NEED)
  };
}

// 選修的細項：「已修 ＋ 修課中 ／ 門檻　還差」
function electiveDetail(d, a) {
  function line(name, doneVal, afterVal, need, isMax) {
    const nowVal = afterVal - doneVal;
    let tail;
    if (isMax) {
      tail = '<span class="hint">max ' + need + " counted</span>";
    } else if (afterVal >= need) {
      tail = '<span class="saved">met ✓</span>';
    } else {
      tail = '<span class="hint">' + (need - afterVal) + " to go</span>";
    }
    return "<li><span>" + name + "</span><span>" + doneVal + (nowVal > 0 ? " + " + nowVal : "") +
      " / " + (isMax ? "" : "min ") + need + "  " + tail + "</span></li>";
  }
  let html = '<ul class="sub-list">' +
    line("Program electives", d.dept, a.dept, DEPT_ELECTIVE_MIN, false) +
    line("College of Informatics electives", d.college, a.college, COLLEGE_ELECTIVE_MIN, false) +
    line("Free electives", d.free, a.free, FREE_ELECTIVE_MAX, true) +
    "</ul>";
  if (a.overflow > 0) {
    html += '<p class="hint">' + a.overflow + " program elective credits above " + DEPT_ELECTIVE_MIN + " count toward College of Informatics electives.</p>";
  }
  if (a.rawFree > FREE_ELECTIVE_MAX) {
    html += '<p class="hint">You have ' + a.rawFree + " free elective credits. Anything above " + FREE_ELECTIVE_MAX + " does not count toward graduation.</p>";
  }
  return html;
}

function calcYzu() {
  const common = sumCourses(COMMON_COURSES);
  const ge = sumCourses(GE_COURSES);
  const college = sumCourses(COLLEGE_COURSES);
  const dept = sumCourses(deptCoursesNow());
  const deptElective = sumCourses(ELECTIVE_COURSES);
  const outCollege = sumOutside("college");
  const outFree = sumOutside("free");

  const eDone = allocElective(deptElective.done, outCollege.done, outFree.done);
  const eAfter = allocElective(deptElective.done + deptElective.now,
    outCollege.done + outCollege.now, outFree.done + outFree.now);
  const electiveRow = makeRow("Electives", ELECTIVE_NEED, eDone.total, eAfter.total - eDone.total);
  electiveRow.detail = electiveDetail(eDone, eAfter);

  const rows = [
    makeRow("Common Compulsory", 17, common.done, common.now),
    makeRow("General Education", 10, ge.done, ge.now),
    makeRow("College Compulsory", 4, college.done, college.now),
    makeRow("Required Courses", 54, dept.done, dept.now),
    electiveRow
  ];
  return { error: "", rows: rows };
}

function calcCustom() {
  const rows = [];
  for (const c of state.custom) {
    const n = toNum(c.need);
    const d = toNum(c.done);
    const w = toNum(c.now);
    if ([n, d, w].some(Number.isNaN)) {
      return { error: (c.name || "A category") + ": credits must be between 0 and 300" };
    }
    if (n === 0) continue; // 應修沒填的類別先不算
    rows.push(makeRow(c.name || "Untitled", n, d, w));
  }
  return { error: "", rows: rows };
}

function totals(rows) {
  let need = 0;
  let done = 0;
  let now = 0;
  rows.forEach(function (r) { need += r.need; done += r.done; now += r.now; });
  return { need: need, done: done, now: now, left: need - done - now };
}

// 畢業門檻（只有元智模式）：回傳 [{ name, status: "ok" | "now" | "no", text }]
function calcThresholds() {
  const list = [];

  list.push({
    name: "Programming Proficiency Test (CPE)",
    status: state.cpe ? "ok" : "no",
    text: state.cpe ? "Passed" : "Not passed yet"
  });

  const peDone = Number(state.peDone);
  const peAfter = peDone + (state.peNow ? 1 : 0);
  list.push({
    name: "Physical Education, 4 semesters",
    status: peDone >= 4 ? "ok" : (peAfter >= 4 ? "now" : "no"),
    text: peDone + " completed" + (state.peNow ? ", " + peAfter + " after this semester" : "")
  });

  if (state.courseState.SVC === "done") {
    list.push({ name: "Service Learning hours", status: "ok", text: "Service Learning credit earned" });
  } else {
    const sc = toNum(state.serviceCourse) || 0;
    const sa = toNum(state.serviceActivity) || 0;
    list.push({
      name: "Service Learning hours",
      status: (sc >= 18 && sa >= 18) ? "ok" : "no",
      text: "Course " + sc + "/18 hrs, activity " + sa + "/18 hrs"
    });
  }

  const seriesCourses = DEPT_COURSES.filter(function (c) { return c.series === state.series; });
  const sDone = seriesCourses.every(function (c) { return state.courseState[c.id] === "done"; });
  const sAfter = seriesCourses.every(function (c) { return state.courseState[c.id] === "done" || state.courseState[c.id] === "now"; });
  list.push({
    name: (state.series === "intern" ? "Practical Training" : "Special Project") + " series",
    status: sDone ? "ok" : (sAfter ? "now" : "no"),
    text: seriesCourses.map(function (c) { return c.name; }).join(", ")
  });

  if (!state.toeic750) {
    const lDone = LISTENING_COURSES.every(function (c) { return state.courseState[c.id] === "done"; });
    const lAfter = LISTENING_COURSES.every(function (c) { return state.courseState[c.id] === "done" || state.courseState[c.id] === "now"; });
    list.push({
      name: "English Listening and Reading (I) and (II)",
      status: lDone ? "ok" : (lAfter ? "now" : "no"),
      text: "Required below TOEIC 750"
    });
  }
  return list;
}

// ===== 系外選修：新增、刪除、切換 =====
function addOutside() {
  const err = document.getElementById("out-error");
  const nameInput = document.getElementById("out-name");
  const creditInput = document.getElementById("out-credit");
  const name = nameInput.value.trim();
  const credit = Number(creditInput.value);

  if (name === "") { err.textContent = "Enter a course name"; return; }
  if (!Number.isInteger(credit) || credit < 1 || credit > 10) { err.textContent = "Credits must be a whole number from 1 to 10"; return; }

  state.outside.push({
    id: state.outsideNextId++,
    name: name,
    credit: credit,
    type: document.getElementById("out-type").value,
    status: document.getElementById("out-status").value
  });
  nameInput.value = "";
  creditInput.value = "";
  err.textContent = "";
  renderYzu();
  update();
  nameInput.focus();
}

// ===== 6. 畫面：進度 =====
function progressBar(donePct, afterPct) {
  return '<div class="progress">' +
    '<div class="progress-after" style="width:' + afterPct + '%"></div>' +
    '<div class="progress-done" style="width:' + donePct + '%"></div>' +
    "</div>";
}

function renderProgress() {
  const box = document.getElementById("progress-result");
  const r = (state.mode === "custom") ? calcCustom() : calcYzu();
  document.getElementById("credit-error").textContent = r.error;

  if (r.error) {
    box.innerHTML = "";
    renderSemester(null);
    return;
  }

  const t = totals(r.rows);
  if (t.need === 0) {
    box.innerHTML = '<p class="hint">Enter the required credits for each category to see your progress. Or tap "Fill example" to try it out.</p>';
    renderSemester(null);
    return;
  }

  const donePct = t.done / t.need * 100;
  const afterPct = (t.done + t.now) / t.need * 100;

  // 總進度：目前 → 這學期結束後
  let html = '<div class="progress-total">' +
    '<div class="total-compare">' +
      '<div class="total-box"><div class="total-label">Now</div>' +
        '<div class="total-pct">' + Math.floor(donePct) + "%</div>" +
        '<div class="hint">' + t.done + " / " + t.need + " credits</div></div>" +
      '<div class="total-arrow">→</div>' +
      '<div class="total-box after"><div class="total-label">After this semester</div>' +
        '<div class="total-pct">' + Math.floor(afterPct) + "%</div>" +
        '<div class="hint">' + (t.done + t.now) + " / " + t.need + " credits</div></div>" +
    "</div>" +
    progressBar(donePct, afterPct) +
    "</div>";

  html += '<div class="legend"><span class="dot dot-done"></span>Completed  <span class="dot dot-after"></span>After this semester</div>';

  r.rows.forEach(function (row) {
    html += '<div class="progress-item">' +
      '<div class="progress-label"><span>' + escapeHTML(row.name) + "</span>" +
      "<span>" + row.done + (row.now > 0 ? " + " + row.now : "") + " / " + row.need +
      (row.left > 0 ? '  <span class="hint">' + row.left + " to go</span>" : '  <span class="saved">done ✓</span>') +
      "</span></div>" +
      progressBar(row.donePct, row.afterPct) +
      (row.over ? '<p class="hint">Over ' + row.need + " credits. The extra credits do not count toward graduation.</p>" : "") +
      (row.detail || "") +
      "</div>";
  });

  // 畢業門檻
  if (state.mode !== "custom") {
    const icon = { ok: "✓", now: "…", no: "✕" };
    html += '<h3 class="threshold-title">Graduation requirements</h3><ul class="threshold-list">';
    calcThresholds().forEach(function (th) {
      html += '<li class="th-' + th.status + '"><span class="th-icon">' + icon[th.status] + "</span>" +
        "<div><strong>" + th.name + '</strong><div class="hint">' + th.text + "</div></div></li>";
    });
    html += "</ul>";
  }

  if (t.left <= 0) {
    html += '<p class="saved">After this semester, every category is complete 🎓</p>';
  } else {
    html += '<p class="hint">After this semester, <strong>' + t.left + "</strong> credits to go.</p>";
  }

  box.innerHTML = html;
  renderSemester(t);
}

function renderSemester(t) {
  const box = document.getElementById("semester-result");
  const per = Number(state.perSemester);

  if (!t || t.need === 0) {
    box.innerHTML = '<p class="hint">Fill in your credits above first.</p>';
    return;
  }
  if (t.left <= 0) {
    box.innerHTML = '<p class="saved">You have enough credits. No more needed.</p>';
    return;
  }
  if (!Number.isFinite(per) || per <= 0) {
    box.innerHTML = '<p class="hint">Enter how many credits you plan to take each semester.</p>';
    return;
  }

  const semesters = Math.ceil(t.left / per);
  let html = '<p class="big-answer"><strong>' + semesters + (semesters === 1 ? " semester" : " semesters") + "</strong> to go</p>" +
    '<p class="hint">' + t.left + " credits left at " + per + " credits per semester.</p>";

  if (per < MIN_PER_SEMESTER || per > MAX_PER_SEMESTER) {
    html += '<p class="warning">Under YZU Academic Regulations, students in years 1 to 3 must take ' + MIN_PER_SEMESTER + "–" +
      MAX_PER_SEMESTER + " credits per semester (the minimum in year 4 is 9). " + per + " credits is outside this range, so check with your program first.</p>";
  }
  box.innerHTML = html;
}

// ===== 7. 自訂模式的表格 =====
function renderCustom() {
  document.getElementById("category-list").innerHTML = state.custom.map(function (c) {
    return '<div class="credit-row" data-id="' + c.id + '">' +
      '<input type="text" data-field="name" placeholder="Category" value="' + escapeHTML(c.name) + '">' +
      '<input type="number" data-field="need" min="0" placeholder="0" value="' + escapeHTML(c.need) + '">' +
      '<input type="number" data-field="done" min="0" placeholder="0" value="' + escapeHTML(c.done) + '">' +
      '<input type="number" data-field="now" min="0" placeholder="0" value="' + escapeHTML(c.now) + '">' +
      '<button onclick="removeCategory(' + c.id + ')" aria-label="Delete this category">✕</button>' +
      "</div>";
  }).join("");
}

function addCategory() {
  state.custom.push({ id: state.customNextId++, name: "", need: "", done: "", now: "" });
  renderCustom();
  update();
  const rows = document.querySelectorAll(".credit-row");
  rows[rows.length - 1].querySelector("input").focus();
}

function removeCategory(id) {
  state.custom = state.custom.filter(function (c) { return c.id !== id; });
  renderCustom();
  update();
}

function fillExample() {
  state.custom = exampleCategories();
  state.customNextId = 4;
  state.perSemester = "20";
  document.getElementById("per-semester").value = "20";
  renderCustom();
  update();
}

let clearTimer = null;
function clearCategories() {
  const btn = document.getElementById("clear-category-btn");
  if (clearTimer === null) {
    btn.textContent = "Tap again to clear";
    clearTimer = setTimeout(function () { btn.textContent = "Clear all"; clearTimer = null; }, 3000);
    return;
  }
  clearTimeout(clearTimer);
  clearTimer = null;
  btn.textContent = "Clear all";
  state.custom = emptyCategories();
  state.customNextId = 4;
  renderCustom();
  update();
}

// ===== 8. 切換模式、更新 =====
function showMode() {
  const custom = state.mode === "custom";
  document.getElementById("yzu-area").classList.toggle("hidden", custom);
  document.getElementById("custom-area").classList.toggle("hidden", !custom);
}

function update() {
  renderProgress();
  saveData();
}

function init() {
  loadData();

  // 模式
  document.getElementById("mode").value = state.mode;
  document.getElementById("mode").addEventListener("change", function (e) {
    state.mode = e.target.value;
    showMode();
    update();
  });

  // 點課程按鈕切換狀態（整個元智區塊共用一個監聽器）
  document.getElementById("yzu-area").addEventListener("click", function (e) {
    // 系外選修：刪除
    const rm = e.target.closest("[data-remove-outside]");
    if (rm) {
      const rid = Number(rm.dataset.removeOutside);
      state.outside = state.outside.filter(function (o) { return o.id !== rid; });
      renderYzu();
      update();
      return;
    }
    // 系外選修：切換已修／修課中
    const out = e.target.closest("[data-outside]");
    if (out) {
      const o = state.outside.find(function (o) { return o.id === Number(out.dataset.outside); });
      o.status = (o.status === "done") ? "now" : "done";
      renderYzu();
      update();
      return;
    }
    const chip = e.target.closest(".course-chip[data-course]");
    if (chip) {
      const id = chip.dataset.course;
      state.courseState[id] = NEXT_STATE[state.courseState[id] || ""];
      renderYzu();
      update();
      return;
    }
    const termBtn = e.target.closest("[data-term]");
    if (termBtn) {
      deptCoursesNow().forEach(function (c) {
        if (c.term === termBtn.dataset.term) state.courseState[c.id] = "done";
      });
      renderYzu();
      update();
    }
  });

  document.getElementById("out-add-btn").addEventListener("click", addOutside);
  document.getElementById("out-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter") addOutside();
  });

  document.querySelectorAll('input[name="series"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.series = r.value;
      renderYzu();
      update();
    });
  });

  // 元智區塊的其他輸入
  const bind = [
    ["cpe", "cpe", "checked"],
    ["pe-done", "peDone", "value"],
    ["pe-now", "peNow", "checked"],
    ["service-course", "serviceCourse", "value"],
    ["service-activity", "serviceActivity", "value"],
    ["toeic750", "toeic750", "checked"],
    ["per-semester", "perSemester", "value"]
  ];
  bind.forEach(function (b) {
    const el = document.getElementById(b[0]);
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
      state[b[1]] = (b[2] === "checked") ? el.checked : el.value.trim();
      if (b[0] === "toeic750") renderYzu();
      update();
    });
  });

  // 自訂模式
  document.getElementById("category-list").addEventListener("input", function (e) {
    const row = e.target.closest(".credit-row");
    if (!row) return;
    const c = state.custom.find(function (c) { return c.id === Number(row.dataset.id); });
    c[e.target.dataset.field] = e.target.value.trim();
    update();
  });
  document.getElementById("add-category-btn").addEventListener("click", addCategory);
  document.getElementById("example-btn").addEventListener("click", fillExample);
  document.getElementById("clear-category-btn").addEventListener("click", clearCategories);

  document.getElementById("per-semester").value = state.perSemester;
  fillYzuInputs();
  renderYzu();
  renderCustom();
  showMode();
  update();
}

document.addEventListener("DOMContentLoaded", init);
