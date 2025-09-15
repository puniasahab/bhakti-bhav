// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLoe9hw6JjA3igGU5uGjd1R4bqzNaYgOg",
  authDomain: "bhakti-bhav-f507b.firebaseapp.com",
  projectId: "bhakti-bhav-f507b",
  storageBucket: "bhakti-bhav-f507b.firebasestorage.app",
  messagingSenderId: "553054076489",
  appId: "1:553054076489:web:6b42aa599266b1eabb4998",
  measurementId: "G-8VDVBY46R5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);