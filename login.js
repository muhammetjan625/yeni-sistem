import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Giriş başarılı! Admin paneline yönlendiriliyorsunuz.");
        window.location.href = "adminpanel.html";
    } catch (error) {
        console.error(error);
        alert("Giriş başarısız: " + error.message);
    }
});

// Kullanıcı zaten giriş yapmışsa adminpanel.html yönlendir
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "adminpanel.html";
    }
});
