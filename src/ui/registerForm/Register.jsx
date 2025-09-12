import React, { useState } from "react";
import { auth, db, storage } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, query, where, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [error, setError] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    const navigate = useNavigate();

    const checkUsernameExists = async (username) => {
        const q = query(collection(db, "user"), where("username", "==", username));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (await checkUsernameExists(username)) {
                setError("Username already taken");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let photoURL = "";

            if (profilePicture) {
                const photoRef = ref(storage, `users/${Date.now()}-${profilePicture.name}`);
                await uploadBytes(photoRef, profilePicture);
                photoURL = await getDownloadURL(photoRef);
            }

            await setDoc(doc(db, "user", user.uid), {
                uid: user.uid,
                email,
                username,
                name,
                surname,
                photoURL: photoURL || null,
                points: 0,
                createdAt: serverTimestamp(),
            });

            navigate("/profile");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Register</h2>
            <form onSubmit={handleRegister} style={styles.form}>
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required />
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
                <input placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} style={styles.input} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setProfilePicture(e.target.files[0]);
                        setProfilePreview(URL.createObjectURL(e.target.files[0]));
                    }}
                    style={styles.fileInput}
                />
                {profilePreview && (
                    <div style={styles.previewWrapper}>
                        <img
                            src={profilePreview}
                            alt="Preview"
                            style={styles.previewImage}
                        />
                    </div>
                )}
                <button type="submit" style={styles.submitButton}>Register</button>
                {error && <p style={styles.errorText}>{error}</p>}
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "450px",
        margin: "3rem auto",
        padding: "3rem",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#fff",
    },
    heading: {
        textAlign: "center",
        marginBottom: "1.5rem",
        fontSize: "24px",
        color: "#1F2937",
        fontWeight: 600,
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
    fileInput: {
        padding: "0.5rem 0",
    },
    previewWrapper: {
        display: "flex",
        justifyContent: "center",
        marginTop: "0.5rem",
    },
    previewImage: {
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "50%",
        border: "2px solid #ddd",
    },
    submitButton: {
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
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: "0.5rem",
        fontWeight: 500,
    },
};

export default Register;
