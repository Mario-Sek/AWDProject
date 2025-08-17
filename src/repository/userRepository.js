import {collection, doc, getDocs, addDoc, deleteDoc, getDoc, updateDoc} from "firebase/firestore"

import {db} from "../config/firebase"


//TODO: USER SE MISLI NA USERS OD DB, sum ispustil s na krajot nekjam pak racno da vnesuvam data,
//TODO: NE MENUVAJ, POSTO RABOTI


const userRepository = {

    findAll: async () => {
        const querySnapshot = await getDocs(collection(db, "user"));
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    },

    findById: async (userId) => {
        const docRef = doc(db, "user", userId) // mi ja sodrzi adresata
        const docSnap = await getDoc(docRef) //podatocite od taa adresa

        if (docSnap.exists()) {
            return {id: docSnap.id, ...docSnap.data()} // ... gi spojuvaat polinjava od objektot od fs
        } else {
            return null
        }
    },

    updateUser: async (userId, data) => {
        const docRef = doc(db,"user",userId)
        await updateDoc(docRef,data)
    },

    addUser: async (user) => {
        await addDoc(collection(db, "user"), user) //kazuvame vo koja kolekcija
    },

    deleteUser: async (userId) => {
        await deleteDoc(doc(db, "user", userId))
    }

}

export default userRepository;