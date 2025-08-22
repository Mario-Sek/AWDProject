import React, { useState } from "react";
import useThreads from "../../hooks/useThreads";
import TestComments from "./TestComments";
import useUsers from "../../hooks/useUsers";

const initialFormData = {
    title: "",
    description: "",
    image: null,
    upvotes: 0,
    downvotes: 0,
};

const TestThreads = () => {
    const { threads, onAdd, onDelete } = useThreads();
    const { findUserById } = useUsers();
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim() || !formData.description.trim()) return;
        onAdd({ ...formData, createdAt: new Date(), userId: findUserById?.uid || null });
        setFormData(initialFormData);
    };

    const styles = {
        container: { maxWidth: "800px", margin: "1rem auto", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer", alignSelf: "flex-start" },
        threadCard: { border: "1px solid #eee", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        threadHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
        deleteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer" },
        threadImage: { maxWidth: "100%", borderRadius: "6px", marginTop: "0.5rem" },
        metadata: { fontSize: "0.8rem", color: "#555", marginTop: "0.5rem" },
        userName: { fontWeight: "bold", color: "#333" },
    };

    return (
        <div style={styles.container}>
            <h2>Threads</h2>

            <div style={styles.form}>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                    style={styles.input}
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    style={styles.textarea}
                />
                <input
                    type="text"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleChange}
                    placeholder="Image URL (optional)"
                    style={styles.input}
                />
                <button style={styles.button} onClick={handleSubmit}>
                    Post Thread
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {threads.map((thread) => {
                    const threadUser = findUserById(thread.userId);
                    return (
                        <li key={thread.id} style={styles.threadCard}>
                            <div style={styles.threadHeader}>
                                <h3>{thread.title}</h3>
                                <button style={styles.deleteButton} onClick={() => onDelete(thread.id)}>
                                    Delete
                                </button>
                            </div>
                            <p>{thread.description}</p>
                            {thread.image && <img src={thread.image} alt="thread" style={styles.threadImage} />}
                            <div style={styles.metadata}>
                                Posted by <span style={styles.userName}>{threadUser?.username || threadUser?.email || "Unknown"}</span> on {thread.createdAt.toDate().toLocaleString()}
                            </div>

                            {/* Pass findUserById to comments to render actual commenters */}
                            <TestComments threadId={thread.id} findUserById={findUserById} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TestThreads;
