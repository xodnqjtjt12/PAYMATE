// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpNblvrDpyuxMkjpShkm1C4Dg3vxWZfcg",
  authDomain: "paymate-6a66e.firebaseapp.com",
  projectId: "paymate-6a66e",
  storageBucket: "paymate-6a66e.firebasestorage.app",
  messagingSenderId: "624507066302",
  appId: "1:624507066302:web:b39fb4bf1aed00d07f4bef",
  measurementId: "G-SV109TGC9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };