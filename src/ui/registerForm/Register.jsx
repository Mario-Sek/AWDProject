import React, { useState } from "react";
import { auth, db, storage } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, query, where, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [error, setError] = useState("");
    const [profilePicture,setProfilePicture] = useState(null)
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

            let photoURL = ""

            if(profilePicture){
                const photoRef = ref(storage, `users/${Date.now()}-${profilePicture.name}`)
                await uploadBytes(photoRef,profilePicture)
                photoURL = await getDownloadURL(photoRef)
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

            navigate("/user");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2>Register</h2>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                <input placeholder="Surname" value={surname} onChange={e => setSurname(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e)=>{
                        setProfilePicture(e.target.files[0])
                        setProfilePreview(URL.createObjectURL(e.target.files[0]))
                    }}
                />
                {profilePreview && (
                    <div style={{ marginTop: "1rem" }}>
                        <img
                            src={profilePreview}
                            alt="Preview"
                            style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%" }}
                        />
                    </div>
                )}
                <button type="submit">Register</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
};

export default Register;
