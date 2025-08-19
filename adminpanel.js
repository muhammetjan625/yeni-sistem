import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const adminPanel = document.getElementById("admin-panel");
const logoutBtn = document.getElementById("logout-btn");
const usersList = document.getElementById("users-list");
const transactionsList = document.getElementById("transactions-list");

// Toggle panel visibility
function toggleAdminPanel(user) {
  if (user) {
    loginContainer.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadUsers();
    loadTransactions();
  } else {
    loginContainer.classList.remove("hidden");
    adminPanel.classList.add("hidden");
  }
}

// Login form
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Giriş başarılı!");
  } catch (error) {
    console.error(error);
    alert("Giriş başarısız: " + error.message);
  }
});

// Auth state
onAuthStateChanged(auth, (user) => {
  toggleAdminPanel(user);
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Çıkış yapıldı.");
  } catch (error) {
    console.error(error);
    alert("Çıkışta hata: " + error.message);
  }
});

// Load users from Firestore
function loadUsers() {
  const usersCol = collection(db, "users");
  onSnapshot(usersCol, snapshot => {
    usersList.innerHTML = "";
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${data.name || "İsim yok"} | ${data.email}`;
      usersList.appendChild(li);
    });
  }, error => console.error("Kullanıcılar çekilemedi:", error));
}

// Load transactions from Firestore
function loadTransactions() {
  const transactionsCol = collection(db, "transactions");
  onSnapshot(transactionsCol, snapshot => {
    transactionsList.innerHTML = "";
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${data.title} | ${data.category} | ${data.amount} TL`;
      transactionsList.appendChild(li);
    });
  }, error => console.error("İşlemler çekilemedi:", error));
}
