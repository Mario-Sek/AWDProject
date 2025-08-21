import {addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import {db} from "../../config/firebase";

const repliesRepository = {

    findAll: (threadId, commentId, callback) => {
        const repliesRef = collection(db, "threads", threadId, "comments", commentId, "replies")
        const q = query(repliesRef, orderBy("createdAt", "desc"))
        return onSnapshot(q, (snapshot) => {
            const replies = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
            callback(replies)
        })
    },

    findById: async (threadId, commentId, replyId) => {

        const replyRef = doc(db, "threads", threadId, "comments", commentId, "replies", replyId)
        const docSnap = await getDoc(replyRef)

        if (!docSnap.exists())
            return null

        return {id: docSnap.id, ...docSnap.data()}
    },

    addReply: async (threadId, commentId, data) => {
        const repliesRef = collection(db,"threads",threadId,"comments",commentId,"replies")

        return await addDoc(repliesRef,{
            ...data,
            createdAt:new Date()
        })
    },

    updateReply: async (threadId,commentId,replyId,data)=>{
        const replyRef = doc (db,"threads",threadId,"comments",commentId,"replies",replyId)
        await updateDoc(replyRef,data)
    },

    deleteReply: async (threadId,commentId,replyId)=>{
        const replyRef = doc (db,"threads",threadId,"comments",commentId,"replies",replyId)
        await deleteDoc(replyRef)
    }
}

export default repliesRepository