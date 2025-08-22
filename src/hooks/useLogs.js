import { useCallback, useEffect, useState } from "react";
import logsRepository from "../repository/subcollections/logsRepository";

const initialState = {
    logs: [],
    loading: true
};

const useLogs = (carId) => {
    const [state, setState] = useState(initialState);

    // Fetch logs with real-time subscription
    const fetchLogs = useCallback(() => {
        const unsubscribe = logsRepository.findAll(carId, (logs) => {
            setState({ logs, loading: false });
        });

        return unsubscribe; // make sure unsubscribe is returned for cleanup
    }, [carId]);

    const onAdd = useCallback((data) => {
        logsRepository.addLog(carId, data).catch((error) => console.error("Add log error:", error));
    }, [carId]);

    const onDelete = useCallback((logId) => {
        logsRepository.deleteLog(carId, logId).catch((error) => console.error("Delete log error:", error));
    }, [carId]);

    const onUpdate = useCallback((logId, data) => {
        logsRepository.updateLog(carId, logId, data).catch((error) => console.error("Update log error:", error));
    }, [carId]);

    const findById = useCallback((logId) => {
        return logsRepository.findById(carId, logId).catch((error) => console.error("Find log error:", error));
    }, [carId]);

    useEffect(() => {
        const unsubscribe = fetchLogs();
        return () => unsubscribe && unsubscribe();
    }, [fetchLogs]);

    return {
        ...state,
        onAdd,
        onUpdate,
        onDelete,
        findById
    };
};

export default useLogs;
