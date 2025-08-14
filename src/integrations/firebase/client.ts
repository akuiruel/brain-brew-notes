// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;