import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8waPPrubHQtTV8CpA4Hmo4oeZdmlEF_s",
  authDomain: "english-vocabulary-b.firebaseapp.com",
  projectId: "english-vocabulary-b",
  storageBucket: "english-vocabulary-b.firebasestorage.app",
  messagingSenderId: "371718519602",
  appId: "1:371718519602:web:76c6953f5fe1bab707f52b",
  measurementId: "G-VVBKBDQVF5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('Persistence failed: Browser not supported');
    }
  });
}

const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, googleProvider, analytics };