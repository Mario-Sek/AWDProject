import {addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc, getDocs} from "firebase/firestore";
import {db} from "../../config/firebase";

const repliesRepository = {

    findAllOnce: async (threadId, commentId) => {
        if (!threadId || !commentId) return [];

        try {
            const repliesCol = collection(db, `threads/${threadId}/comments/${commentId}/replies`);
            const snapshot = await getDocs(repliesCol);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error("Error fetching replies:", err);
            return [];
        }
    },

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