import React, { useState } from "react";
import useComments from "../../hooks/useComments";
import TestReplies from "./TestReplies";
import { useAuth } from "../../hooks/useAuth";

const initialFormData = {
    description: "",
    downvotes: 0,
    upvotes: 0,
    votedBy: {},
    image: null,
};

const TestComments = ({ threadId, findUserById }) => {
    const { user } = useAuth(); // logged-in user
    const { comments, onAdd, onDelete, onUpdate } = useComments(threadId);
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
            userId: user.uid,
            upvotes: 0,
            downvotes: 0,
            votedBy: {},
        });
        setFormData(initialFormData);
    };

    const handleVote = (comment, type) => {
        if (!user) return;

        const currentVote = comment.votedBy?.[user.uid] || null;
        let upvotes = comment.upvotes;
        let downvotes = comment.downvotes;
        const votedBy = { ...(comment.votedBy || {}) };

        if (currentVote === type) {
            if (type === "upvote") upvotes -= 1;
            if (type === "downvote") downvotes -= 1;
            delete votedBy[user.uid];
        } else {
            if (currentVote === "upvote") upvotes -= 1;
            if (currentVote === "downvote") downvotes -= 1;
            if (type === "upvote") upvotes += 1;
            if (type === "downvote") downvotes += 1;
            votedBy[user.uid] = type;
        }

        const updatedComment = { ...comment, upvotes, downvotes, votedBy };
        onUpdate(comment.id, updatedComment);
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
        voteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", cursor: "pointer", marginRight: "0.5rem" },
        upvote: { backgroundColor: "#10b981", color: "#fff" },
        downvote: { backgroundColor: "#ef4444", color: "#fff" },
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
                    const currentVote = comment.votedBy?.[user?.uid] || null;

                    return (
                        <li key={comment.id} style={styles.commentCard}>
                            <div style={styles.username}>{commentUser?.username || commentUser?.email || "Unknown User"}</div>
                            <p>{comment.description}</p>
                            {comment.image && <img src={comment.image} alt="comment" style={{ maxWidth: "100%", borderRadius: "6px" }} />}
                            <div style={styles.metadata}>Posted: {comment.createdAt.toDate ? comment.createdAt.toDate().toLocaleString() : new Date(comment.createdAt).toLocaleString()}</div>

                            <div style={styles.buttonsContainer}>
                                <button
                                    disabled={!user}
                                    style={{ ...styles.voteButton, ...styles.upvote, opacity: currentVote === "upvote" ? 1 : 0.6 }}
                                    onClick={() => handleVote(comment, "upvote")}
                                >
                                    👍 {comment.upvotes}
                                </button>
                                <button
                                    disabled={!user}
                                    style={{ ...styles.voteButton, ...styles.downvote, opacity: currentVote === "downvote" ? 1 : 0.6 }}
                                    onClick={() => handleVote(comment, "downvote")}
                                >
                                    👎 {comment.downvotes}
                                </button>
                                <button style={styles.deleteButton} onClick={() => onDelete(comment.id)}>
                                    Delete
                                </button>
                            </div>

                            <TestReplies threadId={threadId} commentId={comment.id} findUserById={findUserById} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TestComments;
