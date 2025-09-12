import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh", // reduced from 100vh to reduce scroll
        padding: "1rem",
        backgroundColor: "#f9fafb",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
    },
    title: {
        marginBottom: "1.5rem",
        fontSize: "1.8rem",
        fontWeight: 600,
        color: "#1F2937",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    button: {
        padding: "0.75rem",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#4f46e5",
        color: "#fff",
        fontSize: "16px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.3s",
    },
};
