import React, { useEffect, useState } from "react";
import userRepository from "./repository/userRepository";

export default function Test() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await userRepository.findAll();
                console.log("📥 Users from Firestore:", data);
                setUsers(data);
            } catch (error) {
                console.error("❌ Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Users from Firebase:</h2>
            {users.length > 0 ? (
                <ul>
                    {users.map((u) => (
                        <li key={u.id}>
                            {u.name ? u.name : "No name"} — {u.email ? u.email : "No email"}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found</p>
            )}
        </div>
    );
}
