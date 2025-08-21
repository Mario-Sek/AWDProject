import {useCallback, useEffect, useState} from "react";
import logsRepository from "../repository/subcollections/logsRepository";

const initialState = {
    "logs": [],
    "loading": true
}

const useLogs = (carId) => {
    const [state,setState] = useState(initialState)

    const fetchLogs = useCallback(()=>{
        const unsubscribe = logsRepository.findAll(carId, (logs) => {
            setState({ logs, loading: false });
        });

        return unsubscribe;
    },[carId])

    const onAdd = useCallback((data)=>{
        logsRepository.addLog(carId,data)
            .then(()=>{
                fetchLogs()
                console.log("Added Log")
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchLogs,carId])

    const findById = useCallback((logId)=>{
        return logsRepository.findById(carId,logId)
            .then(()=>{
                fetchLogs()
                console.log("Log found")
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchLogs,carId])

    const onDelete = useCallback((logId)=>{
        logsRepository.deleteLog(carId,logId)
            .then(()=>{
                fetchLogs()
                console.log("Log Deleted")
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchLogs,carId])

    const onUpdate = useCallback((logId,data)=>{
        logsRepository.updateLog(carId,logId,data)
            .then(()=>{
                console.log("Log updated")
                fetchLogs()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchLogs,carId])

    useEffect(() => {
        const unsubscribe = fetchLogs();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchLogs]);

    return {...state, onAdd: onAdd, onUpdate: onUpdate, onDelete: onDelete, findById: findById}
}

export default useLogs