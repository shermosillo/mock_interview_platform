
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpvUNgSUDP6zfEZHRuMVBs0WRz4oIGRo4",
  authDomain: "prepwise-43fca.firebaseapp.com",
  projectId: "prepwise-43fca",
  storageBucket: "prepwise-43fca.firebasestorage.app",
  messagingSenderId: "1049544215020",
  appId: "1:1049544215020:web:69746611a2cfb6eed898c9",
  measurementId: "G-ZKZXPC3Q78"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);