import {addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import {db} from "../../config/firebase";


const logsRepository = {

    findAll: (carId, callback) => {
        const logsRef = collection(db, "cars", carId, "logs")
        const q = query(logsRef, orderBy("date_on", "desc"))

        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            callback(logs);
        });
    },

    findById: async (carId, logId) => {
        const logRef = doc(db, "cars", carId, "logs", logId)
        const docSnap = await getDoc(logRef)

        if (!docSnap.exists()) return null

        return {id:docSnap.id, ...docSnap.data()}
    },

    addLog: async (carId,data)=>{
        const logsRef = collection(db, "cars", carId, "logs")
        await addDoc(logsRef,{
            ...data, date_on: new Date()
        })
    },

    updateLog: async (carId,logId,data)=>{
        const logRef = doc(db, "cars", carId, "logs", logId)
        await updateDoc(logRef,data)
    },

    deleteLog: async (carId,logId)=>{
        const logRef = doc(db, "cars", carId, "logs", logId)
        await deleteDoc(logRef)
    }

}

export default logsRepository