
import {initializeApp} from "firebase/app"
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyBncvd3CGqRXkJitL0H6PkeweCc8Wpu2sc",
    authDomain: "geartalk-5008f.firebaseapp.com",
    projectId: "geartalk-5008f",
    storageBucket: "geartalk-5008f.firebasestorage.app",
    messagingSenderId: "1059714628148",
    appId: "1:1059714628148:web:722e97c1310651f7b8a861",
    measurementId: "G-G6L39DSDMW"
}

const app = initializeApp(firebaseConfig)  //init za firebase

export const db = getFirestore(app)