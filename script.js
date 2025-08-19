import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config (senin bilgilerinle)
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
const transactionsColRef = collection(db, "transactions");

// DOM elements
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
const ctx = document.getElementById("categoryChart").getContext("2d");

let transactions = [];
let categoryChart;
let editingId = null; // Düzenleme modunda olan işlemin ID'si
let startX = 0;
let currentSwipedItem = null;

// Renkler
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

// Render işlemleri
function renderTransactions(filter = "all") {
    transactionList.innerHTML = "";
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (filter === "all" || filter === t.type) {
            const li = document.createElement("li");
            li.className = "transaction-item";
            li.setAttribute("data-id", t.id);

            const contentDiv = document.createElement("div");
            contentDiv.className = "transaction-content";
            contentDiv.innerHTML = `<span>${t.category} | ${t.title}</span><span>${t.amount.toFixed(2)} TL</span>`;
            contentDiv.classList.add(`category-${t.category}`);

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "transaction-actions";
            actionsDiv.innerHTML = `<button class="action-btn edit-btn">Düzenle</button><button class="action-btn delete-btn">Sil</button>`;

            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);
            transactionList.appendChild(li);

            addSwipeListeners(li);
        }

        if (t.type === "income") totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    incomeDisplay.textContent = totalIncome.toFixed(2) + " TL";
    expenseDisplay.textContent = totalExpense.toFixed(2) + " TL";
    balanceDisplay.textContent = (totalIncome - totalExpense).toFixed(2) + " TL";

    renderCategoryChart();
}

// Kaydırma efektleri
function addSwipeListeners(item) {
    item.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; if (currentSwipedItem && currentSwipedItem !== item) currentSwipedItem.classList.remove("swiped"); });
    item.addEventListener("touchmove", (e) => {
        const deltaX = e.touches[0].clientX - startX;
        if (deltaX < -50) { item.classList.add("swiped"); currentSwipedItem = item; }
        else if (deltaX > 50) { item.classList.remove("swiped"); if (currentSwipedItem === item) currentSwipedItem = null; }
    });
}

document.addEventListener("click", (e) => {
    if (currentSwipedItem && !currentSwipedItem.contains(e.target)) { currentSwipedItem.classList.remove("swiped"); currentSwipedItem = null; }
});

// Silme ve düzenleme
transactionList.addEventListener("click", async (e) => {
    const li = e.target.closest(".transaction-item");
    if (!li) return;
    const transactionId = li.getAttribute("data-id");

    if (e.target.classList.contains("delete-btn")) {
        const confirmDelete = confirm("Bu işlemi silmek istediğinize emin misiniz?");
        if (confirmDelete) {
            await deleteDoc(doc(db, "transactions", transactionId));
        }
    } else if (e.target.classList.contains("edit-btn")) {
        const transactionToEdit = transactions.find(t => t.id === transactionId);
        if (transactionToEdit) {
            titleInput.value = transactionToEdit.title;
            amountInput.value = transactionToEdit.amount;
            typeSelect.value = transactionToEdit.type;
            categorySelect.value = transactionToEdit.category;
            editingId = transactionId;
            form.querySelector("button[type='submit']").textContent = "Güncelle";
        }
        li.classList.remove("swiped"); currentSwipedItem = null;
    }
});

// Modern dikey bar grafiği
function renderCategoryChart() {
    const categoriesSet = new Set(transactions.map(t => t.category));
    const categories = Array.from(categoriesSet);

    const incomeData = categories.map(cat => transactions.filter(t => t.category === cat && t.type === "income").reduce((sum,t)=>sum+t.amount,0));
    const expenseData = categories.map(cat => transactions.filter(t => t.category === cat && t.type === "expense").reduce((sum,t)=>sum+t.amount,0));

    const colors = getCategoryColors();
    const incomeColors = categories.map(cat => colors[cat] || "#26a69a");
    const expenseColors = categories.map(cat => colors[cat] || "#e74c3c");

    if(categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: categories,
            datasets: [
                { label: "Gelir", data: incomeData, backgroundColor: incomeColors, borderRadius: 5 },
                { label: "Gider", data: expenseData, backgroundColor: expenseColors, borderRadius: 5 }
            ]
        },
        options: {
            responsive:true,
            plugins: { legend:{position:"bottom"}, tooltip:{mode:"index", intersect:false} },
            scales: { x:{ stacked:false, title:{display:true,text:"Kategori"} }, y:{ beginAtZero:true, title:{display:true,text:"Miktar (TL)"} } }
        }
    });
}

// Firebase verilerini dinle
onSnapshot(query(transactionsColRef), snapshot => {
    transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    renderTransactions(filterSelect.value);
});

// Form submit
form.addEventListener("submit", async e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    if(!title || isNaN(amount) || amount <= 0) return alert("Lütfen geçerli değer girin.");

    if(editingId){
        await updateDoc(doc(db,"transactions",editingId), { title, amount, type, category });
        editingId=null;
        form.querySelector("button[type='submit']").textContent="Ekle";
    } else {
        await addDoc(transactionsColRef,{ title, amount, type, category, timestamp:Date.now() });
    }
    form.reset();
});

// Filtre ve dark mode
filterSelect.addEventListener("change", ()=>renderTransactions(filterSelect.value));
toggleDarkMode.addEventListener("click", ()=>document.body.classList.toggle("dark"));

// Anonim auth
signInAnonymously(auth).catch(console.error);
