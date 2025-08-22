import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Registers a new user with Firebase Auth and Firestore
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.name
 * @param {string} data.surname
 * @param {string} data.username
 */
export const registerUser = async ({ email, password, name, surname, username }) => {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Set Firebase display name
    await updateProfile(user, { displayName: `${name} ${surname}` });

    // 3. Add user document in Firestore (NO plain password!)
    await setDoc(doc(db, "user", user.uid), {
        uid: user.uid,
        email,
        name,
        surname,
        username,
        points: 0, // start points
        createdAt: serverTimestamp(), // safer timestamp from server
    });

    return user;
};
