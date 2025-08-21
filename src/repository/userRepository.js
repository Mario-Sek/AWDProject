import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const userRepository = {
    findAll: async () => {
        const querySnapshot = await getDocs(collection(db, "user"));
        // map Firestore document ID to docId
        return querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    },

    updateUser: async (docId, data) => {
        const userRef = doc(db, "user", docId);
        await updateDoc(userRef, data);
    },

    addUser: async (user) => {
        await addDoc(collection(db, "user"), user);
    },

    deleteUser: async (docId) => {
        await deleteDoc(doc(db, "user", docId));
    }
};

export default userRepository;
