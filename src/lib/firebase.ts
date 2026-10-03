// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Primary App (Auth & Firestore)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBVbDSMJmqG2-ULAtxROw-1tM6TSOvN5Ho",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "el-diario-de-la-diaspora.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "el-diario-de-la-diaspora",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "el-diario-de-la-diaspora.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "941690277108",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:941690277108:web:cf45e4a4456dff389da2a1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Storage App (dr-tour-vista)
const storageConfig = {
  apiKey: "AIzaSyCwr18Sn4nKae3ctSdNMOQquFvGEgAqYSU",
  authDomain: "dr-tour-vista.firebaseapp.com",
  projectId: "dr-tour-vista",
  storageBucket: "dr-tour-vista.firebasestorage.app",
  messagingSenderId: "29148955860",
  appId: "1:29148955860:web:03c20bf1878e69d3616741"
};

// Prevent re-initialization during hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize the secondary app for storage
let storageApp;
try {
  storageApp = getApp("storageApp");
} catch (e) {
  storageApp = initializeApp(storageConfig, "storageApp");
}

export const db = getFirestore(app);
export const storage = getStorage(storageApp);
export const auth = getAuth(app);
export { app };
