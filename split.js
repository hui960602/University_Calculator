// ================================================
//  分得剛好｜分帳計算機
// ================================================

// ===== 1. 資料 =====
// members：成員，例如 { id: 1, name: "小明" }
// expenses：消費，例如
//   { id: 5, title: "午餐", amount: 300,
//     payers: [{ id: 1, amount: 300 }],   // 誰付了多少
//     participants: [1, 2, 3] }           // 誰有參與（存成員 id）
let members = [];
let expenses = [];
let nextId = 1; // 每新增一個成員或消費，就給它一個新的編號
let editingId = null; // 正在編輯的消費 id；null 表示目前是「新增」模式

const STORAGE_KEY = "fendegangHao-data";

// ===== 2. 儲存與讀取（存在瀏覽器的 localStorage，重新整理也不會不見） =====
function saveData() {
  try {
    const data = { members: members, expenses: expenses, nextId: nextId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // 有些瀏覽器不允許儲存，失敗也不影響計算
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    members = data.members || [];
    expenses = data.expenses || [];
    nextId = data.nextId || 1;
  } catch (e) {
    // 讀取失敗就從空白開始
  }
}

// ===== 3. 小工具 =====
// 把特殊符號轉換掉，避免名字裡的 < > 被當成 HTML
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function getName(id) {
  const m = members.find(function (m) { return m.id === id; });
  return m ? m.name : "?";
}

// 成員在名單中的順序（用來決定「排前面的人」）
function memberIndex(id) {
  return members.findIndex(function (m) { return m.id === id; });
}

function money(n) {
  return "NT$" + n.toLocaleString("en-US");
}

// ===== 4. 成員 =====
function addMember() {
  const input = document.getElementById("member-name");
  const error = document.getElementById("member-error");
  const name = input.value.trim();

  if (name === "") {
    error.textContent = "Name cannot be empty";
    return;
  }
  if (members.some(function (m) { return m.name === name; })) {
    error.textContent = "There is already a member called \"" + name + "\"";
    return;
  }

  members.push({ id: nextId++, name: name });
  input.value = "";
  error.textContent = "";
  update();
  input.focus();
}

function removeMember(id) {
  // 如果這個人還出現在某筆消費裡，就不能刪
  const used = expenses.some(function (e) {
    return e.participants.includes(id) || e.payers.some(function (p) { return p.id === id; });
  });
  if (used) {
    document.getElementById("member-error").textContent =
      getName(id) + " is still in the expense list. Delete those expenses first.";
    return;
  }
  members = members.filter(function (m) { return m.id !== id; });
  document.getElementById("member-error").textContent = "";
  update();
}

// ===== 5. 新增消費 =====
function toggleMultiPayer() {
  const multi = document.getElementById("multi-payer").checked;
  document.getElementById("payer-select").classList.toggle("hidden", multi);
  document.getElementById("multi-payer-box").classList.toggle("hidden", !multi);
}

function toggleAllParticipants() {
  const boxes = document.querySelectorAll("#participant-box input");
  const allChecked = Array.from(boxes).every(function (b) { return b.checked; });
  boxes.forEach(function (b) { b.checked = !allChecked; });
}

function addExpense() {
  const error = document.getElementById("expense-error");
  const titleInput = document.getElementById("expense-title");
  const amountInput = document.getElementById("expense-amount");
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  // --- 檢查輸入 ---
  if (members.length === 0) {
    error.textContent = "Add members first";
    return;
  }
  if (title === "") {
    error.textContent = "Item name cannot be empty";
    return;
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    error.textContent = "Amount must be a whole number greater than 0";
    return;
  }

  const participants = Array.from(
    document.querySelectorAll("#participant-box input:checked")
  ).map(function (b) { return Number(b.value); });

  if (participants.length === 0) {
    error.textContent = "Select at least one person who shared this expense";
    return;
  }

  // --- 誰付錢 ---
  let payers = [];
  const multi = document.getElementById("multi-payer").checked;

  if (multi) {
    const inputs = document.querySelectorAll("#multi-payer-box input");
    for (const input of inputs) {
      if (input.value.trim() === "") continue; // 沒填就當作 0
      const paid = Number(input.value);
      if (!Number.isInteger(paid) || paid < 0) {
        error.textContent = "Paid amounts must be whole numbers of 0 or more";
        return;
      }
      if (paid > 0) {
        payers.push({ id: Number(input.dataset.id), amount: paid });
      }
    }
    if (payers.length === 0) {
      error.textContent = "Enter how much each person paid";
      return;
    }
    const sum = payers.reduce(function (total, p) { return total + p.amount; }, 0);
    if (sum !== amount) {
      error.textContent =
        "Paid amounts add up to " + money(sum) + ", but the total is " + money(amount);
      return;
    }
  } else {
    const payerId = Number(document.getElementById("payer-select").value);
    payers = [{ id: payerId, amount: amount }];
  }

  // --- 存起來 ---
  const expense = {
    id: editingId !== null ? editingId : nextId++,
    title: title,
    amount: amount,
    payers: payers,
    participants: participants
  };

  if (editingId !== null) {
    // 編輯模式：用新的內容取代原本那一筆
    const index = expenses.findIndex(function (e) { return e.id === editingId; });
    expenses[index] = expense;
  } else {
    // 新增模式：加到清單最後面
    expenses.push(expense);
  }
  resetForm(); // 清空表單，參與者恢復全選，避免下一筆沿用上一筆的勾選
  update();
}

function removeExpense(id) {
  if (id === editingId) resetForm(); // 刪掉的是正在編輯的那筆，就離開編輯模式
  expenses = expenses.filter(function (e) { return e.id !== id; });
  update();
}

// 按下「編輯」：把這筆消費的內容填回上面的表單
function startEdit(id) {
  const e = expenses.find(function (e) { return e.id === id; });
  if (!e) return;
  editingId = id;

  document.getElementById("expense-title").value = e.title;
  document.getElementById("expense-amount").value = e.amount;

  // 誰付錢
  const multi = e.payers.length > 1;
  document.getElementById("multi-payer").checked = multi;
  document.querySelectorAll("#multi-payer-box input").forEach(function (input) {
    const p = e.payers.find(function (p) { return p.id === Number(input.dataset.id); });
    input.value = (multi && p) ? p.amount : "";
  });
  if (!multi) {
    document.getElementById("payer-select").value = e.payers[0].id;
  }
  toggleMultiPayer();

  // 誰有參與
  document.querySelectorAll("#participant-box input").forEach(function (b) {
    b.checked = e.participants.includes(Number(b.value));
  });

  // 切換成編輯模式的文字和按鈕
  document.getElementById("form-title").textContent = "2. Edit expense: " + e.title;
  document.getElementById("add-expense-btn").textContent = "Save changes";
  document.getElementById("cancel-edit-btn").classList.remove("hidden");
  document.getElementById("expense-error").textContent = "";

  renderExpenses(); // 讓正在編輯的那筆變色
  document.getElementById("expense-form").scrollIntoView({ behavior: "smooth" });
}

// 離開編輯模式，把表單恢復成空白的「新增」狀態
function resetForm() {
  editingId = null;
  document.getElementById("expense-title").value = "";
  document.getElementById("expense-amount").value = "";
  document.getElementById("multi-payer").checked = false;
  document.querySelectorAll("#multi-payer-box input").forEach(function (i) { i.value = ""; });
  document.querySelectorAll("#participant-box input").forEach(function (b) { b.checked = true; });
  toggleMultiPayer();

  document.getElementById("form-title").textContent = "2. Add an expense";
  document.getElementById("add-expense-btn").textContent = "Add expense";
  document.getElementById("cancel-edit-btn").classList.add("hidden");
  document.getElementById("expense-error").textContent = "";
}

function cancelEdit() {
  resetForm();
  renderExpenses();
}

// ===== 6. 計算 =====

// 算出一筆消費中，每個參與的人應付多少
function calcShares(expense) {
  const shares = {};
  const n = expense.participants.length;
  const base = Math.floor(expense.amount / n);   // 每人先分到的整數金額
  const remainder = expense.amount - base * n;   // 除不盡多出來的錢

  expense.participants.forEach(function (id) { shares[id] = base; });
  if (remainder === 0) return shares;

  // 多出來的錢給「付最多的人」吸收；金額一樣時，選名單中排前面的
  let absorber = null;
  expense.payers.forEach(function (p) {
    if (
      absorber === null ||
      p.amount > absorber.amount ||
      (p.amount === absorber.amount && memberIndex(p.id) < memberIndex(absorber.id))
    ) {
      absorber = p;
    }
  });

  if (expense.participants.includes(absorber.id)) {
    shares[absorber.id] += remainder;
  } else {
    // 付款的人沒有參與：多出來的錢依名單順序，一人分 1 元
    const ordered = members.filter(function (m) {
      return expense.participants.includes(m.id);
    });
    for (let i = 0; i < remainder; i++) {
      shares[ordered[i].id] += 1;
    }
  }
  return shares;
}

// 算出每個人總共付了多少（paid）、應付多少（share）
function calcSummary() {
  const summary = {};
  members.forEach(function (m) { summary[m.id] = { paid: 0, share: 0 }; });

  expenses.forEach(function (e) {
    e.payers.forEach(function (p) { summary[p.id].paid += p.amount; });
    const shares = calcShares(e);
    for (const id in shares) {
      summary[id].share += shares[id];
    }
  });
  return summary;
}

// 算出誰要轉給誰：每次都讓「欠最多的人」付給「被欠最多的人」
function calcTransfers(summary) {
  const creditors = []; // 多付的人（要收錢）
  const debtors = [];   // 少付的人（要給錢）

  members.forEach(function (m) {
    const diff = summary[m.id].paid - summary[m.id].share;
    if (diff > 0) creditors.push({ id: m.id, amount: diff });
    if (diff < 0) debtors.push({ id: m.id, amount: -diff });
  });

  const transfers = [];
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort(function (a, b) { return b.amount - a.amount; });
    debtors.sort(function (a, b) { return b.amount - a.amount; });

    const c = creditors[0];
    const d = debtors[0];
    const pay = Math.min(c.amount, d.amount);

    transfers.push({ from: d.id, to: c.id, amount: pay });
    c.amount -= pay;
    d.amount -= pay;

    if (c.amount === 0) creditors.shift();
    if (d.amount === 0) debtors.shift();
  }
  return transfers;
}

// ===== 7. 畫面 =====
function renderMembers() {
  const list = document.getElementById("member-list");
  if (members.length === 0) {
    list.innerHTML = '<li class="hint">No members yet. Add the people you are splitting with.</li>';
    return;
  }
  list.innerHTML = members.map(function (m) {
    return '<li class="chip">' + escapeHTML(m.name) +
      '<button onclick="removeMember(' + m.id + ')" aria-label="Remove ' +
      escapeHTML(m.name) + '">✕</button></li>';
  }).join("");
}

function renderForm() {
  // 付款人下拉選單（保留原本選的人）
  const select = document.getElementById("payer-select");
  const oldPayer = select.value;
  select.innerHTML = members.map(function (m) {
    return '<option value="' + m.id + '">' + escapeHTML(m.name) + "</option>";
  }).join("");
  if (members.some(function (m) { return String(m.id) === oldPayer; })) {
    select.value = oldPayer;
  }

  // 多人付款的金額欄（保留原本填的數字）
  const payerBox = document.getElementById("multi-payer-box");
  const oldValues = {};
  payerBox.querySelectorAll("input").forEach(function (i) { oldValues[i.dataset.id] = i.value; });
  payerBox.innerHTML = members.map(function (m) {
    return '<label class="payer-row"><span>' + escapeHTML(m.name) + "</span>" +
      '<input type="number" min="0" step="1" placeholder="0" data-id="' + m.id +
      '" value="' + (oldValues[m.id] || "") + '"></label>';
  }).join("");

  // 參與者勾選框（保留原本的勾選；新成員預設勾選）
  const box = document.getElementById("participant-box");
  const oldChecked = {};
  box.querySelectorAll("input").forEach(function (b) { oldChecked[b.value] = b.checked; });
  box.innerHTML = members.map(function (m) {
    const checked = (m.id in oldChecked) ? oldChecked[m.id] : true;
    return '<label class="check"><input type="checkbox" value="' + m.id + '"' +
      (checked ? " checked" : "") + "> " + escapeHTML(m.name) + "</label>";
  }).join("");

  if (members.length === 0) {
    box.innerHTML = '<span class="hint">Members will appear here</span>';
  }
}

function payerText(e) {
  if (e.payers.length === 1) return "Paid by " + getName(e.payers[0].id);
  return e.payers.map(function (p) {
    return getName(p.id) + " " + money(p.amount);
  }).join(", ") + " paid together";
}

function participantText(e) {
  if (e.participants.length === members.length) {
    return "Shared by all " + members.length;
  }
  return "Shared by " + e.participants.map(getName).join(", ");
}

function renderExpenses() {
  const list = document.getElementById("expense-list");
  if (expenses.length === 0) {
    list.innerHTML = '<p class="hint">No expenses yet</p>';
    return;
  }
  list.innerHTML = expenses.map(function (e) {
    const cls = (e.id === editingId) ? "expense-item editing" : "expense-item";
    return '<div class="' + cls + '"><div>' +
      '<div class="expense-title">' + escapeHTML(e.title) + " · " + money(e.amount) + "</div>" +
      '<div class="expense-meta">' + escapeHTML(payerText(e)) + " | " +
      escapeHTML(participantText(e)) + "</div></div>" +
      '<div class="item-actions">' +
      '<button onclick="startEdit(' + e.id + ')">Edit</button>' +
      '<button onclick="removeExpense(' + e.id + ')" aria-label="Delete this expense">✕</button>' +
      "</div></div>";
  }).join("");
}

function renderResult() {
  const result = document.getElementById("result");
  if (expenses.length === 0) {
    result.innerHTML = '<p class="hint">Add an expense to see the result here</p>';
    return;
  }

  const summary = calcSummary();
  const transfers = calcTransfers(summary);
  const total = expenses.reduce(function (t, e) { return t + e.amount; }, 0);

  let html = '<p class="total">Total ' + money(total) + "</p>";

  // 每個人的明細表
  html += "<table><tr><th>Member</th><th>Paid</th><th>Share</th><th>Balance</th></tr>";
  members.forEach(function (m) {
    const s = summary[m.id];
    const diff = s.paid - s.share;
    let diffText = "0";
    let cls = "";
    if (diff > 0) { diffText = "+" + diff; cls = "plus"; }
    if (diff < 0) { diffText = String(diff); cls = "minus"; }
    html += "<tr><td>" + escapeHTML(m.name) + "</td><td>" + money(s.paid) +
      "</td><td>" + money(s.share) + '</td><td class="' + cls + '">' + diffText + "</td></tr>";
  });
  html += "</table>";

  // 轉帳建議
  if (transfers.length === 0) {
    html += '<p class="hint">Everyone is even. No transfers needed 🎉</p>';
  } else {
    html += '<ul class="transfer-list">';
    transfers.forEach(function (t) {
      html += "<li>" + escapeHTML(getName(t.from)) + " → " + escapeHTML(getName(t.to)) +
        "  <strong>" + money(t.amount) + "</strong></li>";
    });
    html += "</ul>";
  }
  result.innerHTML = html;
}

// 每次資料改變，就重畫整個畫面並儲存
function update() {
  renderMembers();
  renderForm();
  renderExpenses();
  renderResult();
  saveData();
}

// ===== 8. 複製結果、清除 =====
function buildResultText() {
  const summary = calcSummary();
  const transfers = calcTransfers(summary);
  const total = expenses.reduce(function (t, e) { return t + e.amount; }, 0);

  let text = "[University Calculator | Bill split]\n";
  text += "Total: " + money(total) + "\n\n";
  text += "Expenses:\n";
  expenses.forEach(function (e) {
    text += "- " + e.title + " " + money(e.amount) + " (" + payerText(e) + "; " +
      participantText(e) + ")\n";
  });
  text += "\nTransfers:\n";
  if (transfers.length === 0) {
    text += "Everyone is even. No transfers needed.\n";
  } else {
    transfers.forEach(function (t) {
      text += getName(t.from) + " → " + getName(t.to) + " " + money(t.amount) + "\n";
    });
  }
  return text;
}

function copyResult() {
  const msg = document.getElementById("copy-msg");
  if (expenses.length === 0) {
    msg.textContent = "Nothing to copy yet";
    return;
  }
  const text = buildResultText();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () { msg.textContent = "Copied. Paste it into your group chat."; })
      .catch(function () { fallbackCopy(text, msg); });
  } else {
    fallbackCopy(text, msg);
  }
}

// 舊瀏覽器的複製方法
function fallbackCopy(text, msg) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
    msg.textContent = "Copied. Paste it into your group chat.";
  } catch (e) {
    msg.textContent = "Copy failed. Select the text manually.";
  }
  document.body.removeChild(area);
}

// 清除要按兩次：第一次按會先問「確定嗎」，3 秒內再按一次才真的清除
// （不用 confirm() 跳窗，因為有些瀏覽器或 App 內的預覽會擋掉跳窗）
let clearTimer = null;

function clearAll() {
  const btn = document.getElementById("clear-btn");

  if (clearTimer === null) {
    btn.textContent = "Tap again to clear";
    clearTimer = setTimeout(function () {
      btn.textContent = "Clear all";
      clearTimer = null;
    }, 3000);
    return;
  }

  clearTimeout(clearTimer);
  clearTimer = null;
  btn.textContent = "Clear all";

  members = [];
  expenses = [];
  nextId = 1;
  resetForm();
  document.getElementById("copy-msg").textContent = "";
  update();
}

// ===== 9. 開始 =====
function init() {
  loadData();

  document.getElementById("add-member-btn").addEventListener("click", addMember);
  document.getElementById("member-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter") addMember();
  });
  document.getElementById("multi-payer").addEventListener("change", toggleMultiPayer);
  document.getElementById("toggle-all-btn").addEventListener("click", toggleAllParticipants);
  document.getElementById("add-expense-btn").addEventListener("click", addExpense);
  document.getElementById("cancel-edit-btn").addEventListener("click", cancelEdit);
  document.getElementById("copy-btn").addEventListener("click", copyResult);
  document.getElementById("clear-btn").addEventListener("click", clearAll);

  toggleMultiPayer();
  update();
}

document.addEventListener("DOMContentLoaded", init);
