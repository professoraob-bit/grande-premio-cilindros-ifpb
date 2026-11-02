import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot, query, where, serverTimestamp, increment, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, firebaseIsConfigured } from "../firebase-config.js";
let app, auth, db;
if (firebaseIsConfigured) { app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app); }
export { app, auth, db, firebaseIsConfigured, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, onSnapshot, query, where, serverTimestamp, increment, deleteDoc, writeBatch };
