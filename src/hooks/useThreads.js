import { useCallback, useEffect, useState } from "react";
import threadsRepository from "../repository/threadsRepository";
import userRepository from "../repository/userRepository"; // Import this

const initialState = { threads: [], loading: true };

const useThreads = () => {
    const [state, setState] = useState(initialState);

    const fetchThreads = useCallback(() => {
        setState(initialState);
        threadsRepository.findAll()
            .then(response => setState({ threads: response, loading: false }))
            .catch(console.log);
    }, []);

    const onAdd = useCallback(async (data) => {
        try {
            await threadsRepository.addThread(data);
            if (data.userId) {
                await userRepository.incrementPointsByUid(data.userId, 1); // Award 1 point
            }
            fetchThreads();
        } catch (error) {
            console.error(error);
        }
    }, [fetchThreads]);

    const onDelete = useCallback((id) => {
        threadsRepository.deleteThread(id)
            .then(fetchThreads)
            .catch(console.log);
    }, [fetchThreads]);

    const onUpdate = useCallback((threadId, thread) => {
        threadsRepository.updateThread(threadId, thread)
            .then(fetchThreads)
            .catch(console.log);
    }, [fetchThreads]);

    useEffect(() => { fetchThreads(); }, [fetchThreads]);

    return { ...state, onAdd, onUpdate, onDelete };
};

export default useThreads;
