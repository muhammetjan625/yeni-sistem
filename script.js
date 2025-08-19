import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAY3fPnXNn56cjmV_7jZYxaUoq_Qf8n8wM",
    authDomain: "gelirgidersistem.firebaseapp.com",
    projectId: "gelirgidersistem",
    storageBucket: "gelirgidersistem.firebasestorage.app",
    messagingSenderId: "1090834640039",
    appId: "1:1090834640039:web:822bfb9f2bd8f7a7af7f82",
    measurementId: "G-0GC9Z60D09"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const transactionsColRef = collection(db, "transactions");

// DOM elemanları
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
let editingId = null;

// Kategori renkleri
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

// İşlemleri listele
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

            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);
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

// Grafiği dikey bar şeklinde çiz
function renderCategoryChart() {
    const categories = {};
    transactions.forEach(t => {
        const key = t.category + (t.type === "income" ? " (Gelir)" : " (Gider)");
        categories[key] = (categories[key] || 0) + t.amount;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    const bgColors = labels.map(l => {
        const cat = l.replace(" (Gelir)", "").replace(" (Gider)", "");
        return getCategoryColors()[cat] || "#9e9e9e";
    });

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ label: "Miktar (TL)", data, backgroundColor: bgColors, borderRadius: 5 }] },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                x: { beginAtZero: true, title: { display: true, text: "Kategori" } }, 
                y: { beginAtZero: true, title: { display: true, text: "Miktar (TL)" } } 
            }
        }
    });
}

// Firebase verilerini dinle
onSnapshot(query(transactionsColRef), snapshot => {
    transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    renderTransactions(filterSelect.value);
}, error => { console.error("Firestore verileri çekilirken hata:", error); });

// Form gönderimi
form.addEventListener("submit", async e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if(!title || isNaN(amount) || amount <= 0){ alert("Geçerli veri giriniz"); return; }

    try{
        if(editingId){
            await updateDoc(doc(db,"transactions",editingId),{title,amount,type,category});
            editingId=null;
            form.querySelector("button[type='submit']").textContent="Ekle";
        } else{
            await addDoc(transactionsColRef,{title,amount,type,category,timestamp:Date.now()});
        }
        form.reset();
    } catch(e){ console.error(e); alert("Hata oluştu"); }
});

// Filtre
filterSelect.addEventListener("change", ()=>{ renderTransactions(filterSelect.value); });

// Dark mode
toggleDarkMode.addEventListener("click", ()=>{ document.body.classList.toggle("dark"); });

// Anonymous login
signInAnonymously(auth).catch(err=>console.error("Anon auth hata:",err));
