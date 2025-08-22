import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            },
            (err) => {
                console.error("Auth state change error:", err);
                setError("Failed to fetch authentication state.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { user, loading, error };
};
