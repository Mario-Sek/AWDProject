import { useCallback, useState, useEffect } from "react";
import userRepository from "../repository/userRepository";

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all users from repository
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedUsers = await userRepository.findAll();
            setUsers(fetchedUsers);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Could not load users. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a user and refetch
    const onUpdate = useCallback(
        async (docId, data) => {
            try {
                await userRepository.updateUser(docId, data);
                await fetchUsers();
            } catch (err) {
                console.error("Failed to update user:", err);
                setError("Could not update user. Please try again.");
            }
        },
        [fetchUsers]
    );

    // Find user by UID (memoized)
    const findUserById = useCallback(
        (uid) => users.find((user) => user.uid === uid) || null,
        [users]
    );

    // Initial fetch on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, onUpdate, findUserById, refetch: fetchUsers };
};

export default useUsers;
