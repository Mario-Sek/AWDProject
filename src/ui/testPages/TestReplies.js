import React, { useState } from "react";
import useReplies from "../../hooks/useReplies";
import { useAuth } from "../../hooks/useAuth";

const initialFormData = { description: "", downvotes: 0, upvotes: 0, image: null };

const TestReplies = ({ threadId, commentId, findUserById }) => {
    const { user } = useAuth(); // current logged-in user
    const { replies, onAdd, onDelete } = useReplies(threadId, commentId);

    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.description.trim() || !user) return;

        onAdd({
            ...formData,
            createdAt: new Date(),
            userId: user.uid, // actual logged-in user
        });
        setFormData(initialFormData);
    };

    const repliesWithUsers = replies.map((r) => ({ ...r, user: findUserById(r.userId) }));

    const styles = {
        container: { marginLeft: "1rem", maxWidth: "600px", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" },
        replyCard: { border: "1px solid #eee", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.75rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        username: { fontWeight: "bold", color: "#333" },
        metadata: { fontSize: "0.8rem", color: "#555" },
        replyText: { margin: "0.5rem 0" }
    };

    return (
        <div style={styles.container}>
            <h4>Add a reply</h4>
            <div style={styles.form}>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write your reply..."
                    style={styles.textarea}
                />
                <input
                    type="text"
                    name="image"
                    value={formData.image || ""}
                    placeholder="Image URL (optional)"
                    onChange={handleChange}
                    style={styles.input}
                />
                <button style={styles.button} onClick={handleSubmit}>Post Reply</button>
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {repliesWithUsers.map((r) => (
                    <li key={r.id} style={styles.replyCard}>
                        <div style={styles.username}>{r.user?.username || r.user?.email || "Unknown User"}</div>
                        <p style={styles.replyText}>{r.description}</p>
                        {r.image && <img src={r.image} alt="reply" style={{ maxWidth: "100%", borderRadius: "6px" }} />}
                        <div style={styles.metadata}>
                            Upvotes: {r.upvotes} | Downvotes: {r.downvotes} | Posted: {r.createdAt.toDate().toLocaleString()}
                        </div>
                        <button
                            style={{ ...styles.button, backgroundColor: "#dc3545", marginTop: "0.5rem" }}
                            onClick={() => onDelete(r.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TestReplies;
