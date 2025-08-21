import { useCallback, useState, useEffect } from "react";
import userRepository from "../repository/userRepository";

const initialState = { users: [], loading: true };

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all users from repository
    const fetchUsers = useCallback(() => {
        setLoading(true);
        userRepository
            .findAll()
            .then((fetchedUsers) => {
                setUsers(fetchedUsers);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch users:", err);
                setLoading(false);
            });
    }, []);

    // Update a user and refetch
    const onUpdate = useCallback(
        (docId, data) => {
            userRepository
                .updateUser(docId, data)
                .then(() => fetchUsers())
                .catch((err) => console.error("Failed to update user:", err));
        },
        [fetchUsers]
    );

    // Find user by UID (memoized)
    const findUserById = useCallback(
        (uid) => users.find((user) => user.uid === uid) || null,
        [users]
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, onUpdate, findUserById };
};

export default useUsers;
