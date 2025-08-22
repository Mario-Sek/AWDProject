import React, { useState } from "react";
import useComments from "../../hooks/useComments";
import TestReplies from "./TestReplies";
import { useAuth } from "../../hooks/useAuth";

const initialFormData = {
    description: "",
    downvotes: 0,
    upvotes: 0,
    image: null,
};

const TestComments = ({ threadId, findUserById }) => {
    const { user } = useAuth(); // current logged-in user
    const { comments, onAdd, onDelete } = useComments(threadId);
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (event) => {
        const { name, value } = event.target;
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

    const styles = {
        container: { maxWidth: "700px", margin: "1rem auto", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" },
        commentCard: { border: "1px solid #eee", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        username: { fontWeight: "bold", color: "#333" },
        metadata: { fontSize: "0.8rem", color: "#555" },
        buttonsContainer: { marginTop: "0.5rem", display: "flex", gap: "0.5rem" },
        deleteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer" },
    };

    return (
        <div style={styles.container}>
            <h4>Comments</h4>

            <div style={styles.form}>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add a comment..."
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
                    Post Comment
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {comments.map((comment) => {
                    const commentUser = findUserById(comment.userId);
                    return (
                        <li key={comment.id} style={styles.commentCard}>
                            <div style={styles.username}>{commentUser?.username || commentUser?.email || "Unknown User"}</div>
                            <p>{comment.description}</p>
                            {comment.image && <img src={comment.image} alt="comment" style={{ maxWidth: "100%", borderRadius: "6px" }} />}
                            <div style={styles.metadata}>Posted: {comment.createdAt.toDate().toLocaleString()}</div>
                            <div style={styles.buttonsContainer}>
                                <button style={styles.deleteButton} onClick={() => onDelete(comment.id)}>
                                    Delete
                                </button>
                            </div>

                            {/* Replies */}
                            <TestReplies threadId={threadId} commentId={comment.id} findUserById={findUserById} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TestComments;
