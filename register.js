import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), { name, email });

        window.location.href = "adminpanel.html";
    } catch (error) {
        alert("Kayıt başarısız: " + error.message);
    }
});
