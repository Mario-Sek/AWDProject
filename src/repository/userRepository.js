import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "user";

const userRepository = {
    findAll: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION));
            return querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Failed to fetch users.");
        }
    },

    updateUser: async (docId, data) => {
        try {
            const userRef = doc(db, COLLECTION, docId);
            await updateDoc(userRef, data);
        } catch (error) {
            console.error(`Error updating user ${docId}:`, error);
            throw new Error("Failed to update user.");
        }
    },

    addUser: async (user) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION), user);
            return docRef.id;
        } catch (error) {
            console.error("Error adding user:", error);
            throw new Error("Failed to add user.");
        }
    },

    deleteUser: async (docId) => {
        try {
            await deleteDoc(doc(db, COLLECTION, docId));
        } catch (error) {
            console.error(`Error deleting user ${docId}:`, error);
            throw new Error("Failed to delete user.");
        }
    }
};

export default userRepository;
