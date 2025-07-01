const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const balanceDisplay = document.querySelector(".balance span");
const filterSelect = document.getElementById("filter-select");
const toggleDarkMode = document.getElementById("toggle-dark-mode");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const ctx = document.getElementById("categoryChart").getContext("2d");
let categoryChart;

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getCategoryColors() {
  return {
    "Yiyecek": "#ff7043",
    "İçecek": "#29b6f6",
    "Fatura": "#fdd835",
    "Sigorta": "#66bb6a",
    "Alışveriş": "#ab47bc",
    "Maaş": "#26a69a",
    "Diğer": "#9e9e9e"
  };
}

function renderTransactions(filter = "all") {
  transactionList.innerHTML = "";

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (filter === "all" || filter === t.type) {
      const li = document.createElement("li");
      li.classList.add(`category-${t.category}`);
      li.innerHTML = `<span>${t.category} | ${t.title}</span><span>${t.amount.toFixed(2)} TL</span>`;
      transactionList.appendChild(li);
    }
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  incomeDisplay.textContent = totalIncome.toFixed(2) + " TL";
  expenseDisplay.textContent = totalExpense.toFixed(2) + " TL";
  balanceDisplay.textContent = (totalIncome - totalExpense).toFixed(2) + " TL";

  renderCategoryChart();
}

function renderCategoryChart() {
  // Kategori bazlı toplam gelir ve giderleri ayır
  const incomeCategories = {};
  const expenseCategories = {};
  transactions.forEach(t => {
    if (t.type === "income") {
      incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
    } else {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    }
  });

  const colors = getCategoryColors();

  // Gelir kategorileri için veriler
  const incomeLabels = Object.keys(incomeCategories);
  const incomeData = incomeLabels.map(cat => incomeCategories[cat]);
  const incomeColors = incomeLabels.map(cat => colors[cat] || "#000000");

  // Gider kategorileri için veriler
  const expenseLabels = Object.keys(expenseCategories);
  const expenseData = expenseLabels.map(cat => expenseCategories[cat]);
  const expenseColors = expenseLabels.map(cat => colors[cat] || "#000000");

  // Grafik için veriler ve etiketler birleşik olacak:
  const labels = [...incomeLabels.map(l => l + " (Gelir)"), ...expenseLabels.map(l => l + " (Gider)")];
  const data = [...incomeData, ...expenseData];
  const backgroundColors = [...incomeColors, ...expenseColors.map(c => c)];

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 20,
            padding: 15,
          }
        }
      }
    }
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;
  const category = categorySelect.value;

  if (!title || isNaN(amount) || amount <= 0) {
    alert("Lütfen geçerli bir başlık ve miktar giriniz.");
    return;
  }

  transactions.push({ id: Date.now(), title, amount, type, category });
  saveTransactions();
  renderTransactions(filterSelect.value);

  form.reset();
});

filterSelect.addEventListener("change", () => {
  renderTransactions(filterSelect.value);
});

toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

renderTransactions();

const clearBtn = document.getElementById("clear-btn");

clearBtn.addEventListener("click", () => {
  if (confirm("Tüm kayıtlar silinecek. Emin misin?")) {
    localStorage.removeItem("transactions");
    transactions = [];
    renderTransactions();
  }
});
