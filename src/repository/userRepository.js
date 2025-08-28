import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, increment, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "user";

const userRepository = {
    findAll: async () => {
        const querySnapshot = await getDocs(collection(db, COLLECTION));
        return querySnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data(),
        }));
    },

    updateUser: async (docId, data) => {
        const userRef = doc(db, COLLECTION, docId);
        await updateDoc(userRef, data);
    },

    addUser: async (user) => {
        const docRef = await addDoc(collection(db, COLLECTION), user);
        return docRef.id;
    },

    deleteUser: async (docId) => {
        await deleteDoc(doc(db, COLLECTION, docId));
    },

    incrementPoints: async (docId, value = 1) => {
        const userRef = doc(db, COLLECTION, docId);
        await updateDoc(userRef, { points: increment(value) });
    },

    // NEW: Increment points by UID (Firebase Auth)
    incrementPointsByUid: async (uid, value = 1) => {
        try {
            const q = query(collection(db, COLLECTION), where("uid", "==", uid));
            const snapshot = await getDocs(q);

            if (snapshot.empty) throw new Error(`No user found with uid: ${uid}`);

            const userDocId = snapshot.docs[0].id;
            await updateDoc(doc(db, COLLECTION, userDocId), { points: increment(value) });
        } catch (error) {
            console.error(`Error incrementing points for user ${uid}:`, error);
            throw new Error("Failed to increment points.");
        }
    }
};

export default userRepository;
