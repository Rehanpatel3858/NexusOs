import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBc4lURd-65H__bGHUwDnrgcJoPi1UQomI",
  authDomain: "nexusos-506cd.firebaseapp.com",
  projectId: "nexusos-506cd",
  storageBucket: "nexusos-506cd.firebasestorage.app",
  messagingSenderId: "668747114147",
  appId: "1:668747114147:web:b6968623f5cc50f224c116",
  measurementId: "G-E3BY66VM67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
