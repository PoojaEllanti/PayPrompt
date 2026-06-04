// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEI0PabgKMoAMvsqK8OOlTRcAZip7Jf20",
  authDomain: "payprompt-b1ccd.firebaseapp.com",
  projectId: "payprompt-b1ccd",
  storageBucket: "payprompt-b1ccd.firebasestorage.app",
  messagingSenderId: "930597281687",
  appId: "1:930597281687:web:3e8e2f7c442a5d265caed2",
  measurementId: "G-SVNJ5JHBY9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);