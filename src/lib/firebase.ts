import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Ortak Firebase projesi bağlantı bilgileri
const firebaseConfig = {
    apiKey: "AIzaSyChQYmCjmnGiS9gIr4gOzjcPLJfcRB4yxY",
    authDomain: "ramkar-osgb-sistem.firebaseapp.com",
    projectId: "ramkar-osgb-sistem",
    storageBucket: "ramkar-osgb-sistem.firebasestorage.app",
    messagingSenderId: "527100561674",
    appId: "1:527100561674:web:c9bf4d2c1f81ae59b492f3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
