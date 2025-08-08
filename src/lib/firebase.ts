// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "eloquent-essays",
  "appId": "1:522620755725:web:1eff8043c96d9c2d2d5a44",
  "storageBucket": "eloquent-essays.firebasestorage.app",
  "apiKey": "AIzaSyCrIa07E89Oo2vqmQv3HYeFzM2-auK-mOM",
  "authDomain": "eloquent-essays.firebaseapp.com",
  "messagingSenderId": "522620755725"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
