// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq7l6I0t9dlthzV18rpR1acL2tXfNAMQ4",
  authDomain: "pengeluaran-dd4d0.firebaseapp.com",
  projectId: "pengeluaran-dd4d0",
  storageBucket: "pengeluaran-dd4d0.firebasestorage.app",
  messagingSenderId: "254908773545",
  appId: "1:254908773545:web:aeb7451ee78c6c936425b8",
  measurementId: "G-D7XMQ16DQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getStorage } from "firebase/storage";

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export { app, analytics };