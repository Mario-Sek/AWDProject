import { useCallback, useState, useEffect } from "react";
import userRepository from "../repository/userRepository";

const initialState = { users: [], loading: true };

const useUsers = () => {
    const [state, setState] = useState(initialState);

    const fetchUsers = useCallback(() => {
        setState(initialState);
        userRepository.findAll()
            .then(users => setState({ users, loading: false }))
            .catch(console.log);
    }, []);

    const onUpdate = useCallback((docId, data) => {
        userRepository.updateUser(docId, data)
            .then(() => fetchUsers())
            .catch(console.log);
    }, [fetchUsers]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    return { ...state, onUpdate };
};

export default useUsers;
