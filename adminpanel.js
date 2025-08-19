import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAY3fPnXNn56cjmV_7jZYxaUoq_Qf8n8wM",
    authDomain: "gelirgidersistem.firebaseapp.com",
    projectId: "gelirgidersistem",
    storageBucket: "gelirgidersistem.firebasestorage.app",
    messagingSenderId: "1090834640039",
    appId: "1:1090834640039:web:822bfb9f2bd8f7a7af7f82",
    measurementId: "G-0GC9Z60D09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const logoutBtn = document.getElementById("logout-btn");
const usersList = document.getElementById("users-list");
const transactionsList = document.getElementById("transactions-list");
const transactionForm = document.getElementById("transaction-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const ctxEl = document.getElementById("categoryChart");
const adminPanel = document.getElementById("admin-panel");

let transactions = [];
let categoryChart;

// Giriş kontrolü
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        if (adminPanel) adminPanel.classList.remove("hidden");
        loadUsers();
        loadTransactions();
    }
});

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Çıkış yapıldı."); // istersen custom modal buraya eklenebilir
            window.location.href = "index.html";
        } catch (err) {
            alert("Çıkışta hata: " + err.message);
        }
    });
}

// Load users
function loadUsers() {
    if (!usersList) return;
    const usersCol = collection(db, "users");
    onSnapshot(usersCol, snapshot => {
        usersList.innerHTML = "";
        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const li = document.createElement("li");
            li.textContent = `${data.name || "İsim yok"} | ${data.email}`;
            usersList.appendChild(li);
        });
    }, error => alert("Kullanıcılar çekilemedi: " + error.message));
}

// Load transactions
function loadTransactions() {
    if (!transactionsList) return;
    const transactionsCol = collection(db, "transactions");
    onSnapshot(transactionsCol, snapshot => {
        transactionsList.innerHTML = "";
        transactions = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id }));
        transactions.forEach(t => {
            const li = document.createElement("li");
            li.textContent = `${t.title} | ${t.category} | ${t.amount} TL`;
            transactionsList.appendChild(li);
        });
        renderCategoryChart();
    }, error => alert("İşlemler çekilemedi: " + error.message));
}

// Add transaction
if (transactionForm) {
    transactionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = titleInput?.value.trim();
        const amount = parseFloat(amountInput?.value);
        const type = typeSelect?.value;
        const category = categorySelect?.value;

        if (!title || isNaN(amount) || amount <= 0) return alert("Geçerli değer giriniz.");

        try {
            await addDoc(collection(db, "transactions"), { title, amount, type, category, timestamp: Date.now() });
            transactionForm.reset();
        } catch (err) {
            alert("İşlem eklenemedi: " + err.message);
        }
    });
}

// Render vertical bar chart
function renderCategoryChart() {
    if (!ctxEl) return;
    const ctx = ctxEl.getContext("2d");
    const incomeCategories = {};
    const expenseCategories = {};

    transactions.forEach(t => {
        if (t.type === "income") incomeCategories[t.category] = (incomeCategories[t.category] || 0) + t.amount;
        else expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

    const labels = [...new Set([...Object.keys(incomeCategories), ...Object.keys(expenseCategories)])];
    const incomeData = labels.map(l => incomeCategories[l] || 0);
    const expenseData = labels.map(l => expenseCategories[l] || 0);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "Gelir", data: incomeData, backgroundColor: "#4CAF50" },
                { label: "Gider", data: expenseData, backgroundColor: "#e74c3c" }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "top" } }
        }
    });
}
