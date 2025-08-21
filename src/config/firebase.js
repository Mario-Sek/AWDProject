import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBncvd3CGqRXkJitL0H6PkeweCc8Wpu2sc",
    authDomain: "geartalk-5008f.firebaseapp.com",
    projectId: "geartalk-5008f",
    storageBucket: "geartalk-5008f.appspot.com",  // <-- fixed
    messagingSenderId: "1059714628148",
    appId: "1:1059714628148:web:722e97c1310651f7b8a861",
    measurementId: "G-G6L39DSDMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);
