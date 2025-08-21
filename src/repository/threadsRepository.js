import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "../config/firebase";


const threadsRepository={

    findAll: async () =>{
        const querySnapshot = await getDocs(collection(db,"threads"))
        return querySnapshot.docs.map(doc=>({id:doc.id,...doc.data()}))
    },

    findById: async (threadId) =>{
        const docRef = await doc(db,"threads",threadId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {id: docSnap.id, ...docSnap.data()}
        } else {
            return null
        }
    },

    addThread: async (thread) =>{
        await addDoc(collection(db,"threads"),thread)
    },

    deleteThread: async (threadId) =>{
        const docRef = await doc(db,"threads",threadId)
        await deleteDoc(docRef)
    },

    updateThread: async (threadId,thread) =>{
        const docRef = await doc(db,"threads",threadId)
        await updateDoc(docRef,thread)
    },

}

export default threadsRepository