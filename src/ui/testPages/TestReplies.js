import React, { useState } from "react";
import useReplies from "../../hooks/useReplies";
import { useAuth } from "../../hooks/useAuth";

const initialFormData = { description: "", downvotes: 0, upvotes: 0, votedBy: {}, image: null };

const TestReplies = ({ threadId, commentId, findUserById }) => {
    const { user } = useAuth(); // logged-in user
    const { replies, onAdd, onDelete, onUpdate } = useReplies(threadId, commentId);
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
            userId: user.uid,
            upvotes: 0,
            downvotes: 0,
            votedBy: {},
        });
        setFormData(initialFormData);
    };

    const handleVote = (reply, type) => {
        if (!user) return; // prevent anonymous voting

        const currentVote = reply.votedBy?.[user.uid] || null;
        let upvotes = reply.upvotes;
        let downvotes = reply.downvotes;
        const votedBy = { ...(reply.votedBy || {}) };

        if (currentVote === type) {
            // remove same vote
            if (type === "upvote") upvotes -= 1;
            if (type === "downvote") downvotes -= 1;
            delete votedBy[user.uid];
        } else {
            // switch vote
            if (currentVote === "upvote") upvotes -= 1;
            if (currentVote === "downvote") downvotes -= 1;
            if (type === "upvote") upvotes += 1;
            if (type === "downvote") downvotes += 1;
            votedBy[user.uid] = type;
        }

        const updatedReply = { ...reply, upvotes, downvotes, votedBy };
        onUpdate(reply.id, updatedReply);
    };

    const repliesWithUsers = replies.map((r) => ({ ...r, user: findUserById(r.userId) }));

    const styles = {
        container: { marginLeft: "1rem", maxWidth: "600px", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" },
        voteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", cursor: "pointer", marginRight: "0.5rem" },
        upvote: { backgroundColor: "#10b981", color: "#fff" },
        downvote: { backgroundColor: "#ef4444", color: "#fff" },
        replyCard: { border: "1px solid #eee", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.75rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        username: { fontWeight: "bold", color: "#333" },
        metadata: { fontSize: "0.8rem", color: "#555" },
        replyText: { margin: "0.5rem 0" },
        deleteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer", marginTop: "0.5rem" },
        buttonsContainer: { marginTop: "0.5rem", display: "flex", gap: "0.5rem" },
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
                {repliesWithUsers.map((r) => {
                    const currentVote = r.votedBy?.[user?.uid] || null;

                    return (
                        <li key={r.id} style={styles.replyCard}>
                            <div style={styles.username}>{r.user?.username || r.user?.email || "Unknown User"}</div>
                            <p style={styles.replyText}>{r.description}</p>
                            {r.image && <img src={r.image} alt="reply" style={{ maxWidth: "100%", borderRadius: "6px" }} />}
                            <div style={styles.metadata}>
                                Posted: {r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : new Date(r.createdAt).toLocaleString()}
                            </div>

                            {/* Voting buttons */}
                            <div style={styles.buttonsContainer}>
                                <button
                                    disabled={!user}
                                    style={{ ...styles.voteButton, ...styles.upvote, opacity: currentVote === "upvote" ? 1 : 0.6 }}
                                    onClick={() => handleVote(r, "upvote")}
                                >
                                    👍 {r.upvotes}
                                </button>
                                <button
                                    disabled={!user}
                                    style={{ ...styles.voteButton, ...styles.downvote, opacity: currentVote === "downvote" ? 1 : 0.6 }}
                                    onClick={() => handleVote(r, "downvote")}
                                >
                                    👎 {r.downvotes}
                                </button>
                                <button style={styles.deleteButton} onClick={() => onDelete(r.id)}>Delete</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TestReplies;
