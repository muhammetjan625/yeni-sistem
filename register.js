import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await addDoc(collection(db, "users"), { uid: userCredential.user.uid, name, email });
        registerMessage.textContent = "Kayıt başarılı! Yönlendiriliyorsunuz...";
        registerMessage.style.color = "#0f0";
        setTimeout(() => { window.location.href = "login.html"; }, 1000);
    } catch (err) {
        registerMessage.textContent = "Kayıt sırasında hata oluştu!";
        registerMessage.style.color = "#f00";
    }
});
