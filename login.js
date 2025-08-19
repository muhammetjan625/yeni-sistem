import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAY3fPnXNn56cjmV_7jZYxaUoq_Qf8n8wM",
  authDomain: "gelirgidersistem.firebaseapp.com",
  projectId: "gelirgidersistem",
  storageBucket: "gelirgidersistem.firebasestorage.app",
  messagingSenderId: "1090834640039",
  appId: "1:1090834640039:web:822bfb9f2bd8f7a7af7f82"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM
const loginForm = document.getElementById("login-form");

// Custom modal
function showModal(message) {
    const modal = document.createElement("div");
    modal.classList.add("custom-modal");
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button id="ok-btn">Tamam</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("ok-btn").addEventListener("click", () => modal.remove());
}

// Login işlemi
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) return showModal("E-posta ve şifre giriniz.");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showModal("Giriş başarılı!");
        setTimeout(() => window.location.href = "adminpanel.html", 1000);
    } catch (err) {
        console.error(err);
        showModal("Giriş başarısız: " + err.message);
    }
});
