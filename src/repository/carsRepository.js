import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "../config/firebase";


const carsRepository = {

    findAll: async () => {
        const querySnapshot = await getDocs(collection(db, "cars"));
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    },

    findById: async (carId) => {
        const docRef = await doc(db, "cars", carId) //ref mi e ova again
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {id: docSnap.id, ...docSnap.data()}
        } else {
            return null
        }

    },

    addCar: async (car) => {
        await addDoc(collection(db, "cars"), car)
    },

    updateCar: async (car, carId) => {
        const docRef = await doc(db, "cars", carId)
        await updateDoc(docRef, car)
    },

    deleteCar: async(carId) => {
        const docRef = await doc(db, "cars", carId)
        await deleteDoc(docRef)
    }
}

export default carsRepository