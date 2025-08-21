import {collection, query, orderBy, onSnapshot, doc, getDoc, addDoc, deleteDoc, updateDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const commentsRepository = {

    findAll: (threadId, callback) => { //za sekoj update od fs
        const commentsRef = collection(db, "threads", threadId, "comments")
        const q = query(commentsRef, orderBy("createdAt", "asc"))
        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            callback(comments)
        })
    },

    findById: async (threadId, commentId) => {
        const docRef = doc(db, "threads", threadId, "comments", commentId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists())
            return null

        return {id: docSnap.id, ...docSnap.data()}
    },

    addComment: async (threadId,data) => {
        const docRef = collection(db,"threads",threadId,"comments") //tuka koristam collection poso nalepuvam na listata komentari
        return await addDoc(docRef,{
            ...data,
            createdAt:new Date()
        })
    },

    deleteComment: async (threadId,commentId) => {
        const docRef = doc(db,"threads",threadId,"comments",commentId)
        await deleteDoc(docRef)
    },

    updateComment: async (threadId,commentId, data) => {
        const docRef = doc(db,"threads",threadId,"comments",commentId)
        await updateDoc(docRef,data)
    }

}

export default commentsRepository