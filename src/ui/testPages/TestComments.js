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
    const { user } = useAuth();
    const { comments, onAdd, onDelete, onUpdate } = useComments(threadId);
    const [formData, setFormData] = useState(initialFormData);

    const [showForm, setShowForm] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editFormData, setEditFormData] = useState({ description: "", image: "" });

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
        setShowForm(false);
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

    const startEditing = (comment) => {
        if (comment.userId !== user?.uid) return;
        setEditingCommentId(comment.id);
        setEditFormData({ description: comment.description, image: comment.image || "" });
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditFormData({ description: "", image: "" });
    };

    const saveEdit = (commentId) => {
        onUpdate(commentId, { description: editFormData.description, image: editFormData.image });
        cancelEditing();
    };

    const styles = {
        container: { maxWidth: "700px", margin: "1rem auto", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        button: { padding: "0.4rem 0.8rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer", fontSize: "0.8rem" },
        toggleButton: { padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #007bff", backgroundColor: "#fff", color: "#007bff", cursor: "pointer", marginBottom: "1rem", fontSize: "0.8rem" },
        commentCard: { border: "1px solid #eee", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        username: { fontWeight: "bold", color: "#333" },
        metadata: { fontSize: "0.8rem", color: "#555" },
        buttonsContainer: { marginTop: "0.5rem", display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" },
        baseButton: { padding: "0.35rem 0.6rem", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.8rem", minWidth: "65px", textAlign: "center" },
        upvote: { backgroundColor: "#10b981", color: "#fff" },
        downvote: { backgroundColor: "#ef4444", color: "#fff" },
        deleteButton: { backgroundColor: "#dc3545", color: "#fff" },
        editButton: { backgroundColor: "#f59e0b", color: "#fff" },
        replyButton: { backgroundColor: "#6b7280", color: "#fff" },
    };

    return (
        <div style={styles.container}>
            {!showForm ? (
                <button style={styles.toggleButton} onClick={() => setShowForm(true)}>Post Comment</button>
            ) : (
                <div style={styles.form}>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Add a comment..."
                        style={styles.textarea}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const blobUrl = URL.createObjectURL(file);
                                setFormData((prev) => ({ ...prev, image: blobUrl }));
                            }
                        }}
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={styles.button} onClick={handleSubmit}>Post</button>
                        <button style={{ ...styles.button, backgroundColor: "#6b7280" }} onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {comments.map((comment) => {
                    const commentUser = findUserById(comment.userId);
                    const currentVote = comment.votedBy?.[user?.uid] || null;
                    const isEditing = editingCommentId === comment.id;
                    const isAuthor = comment.userId === user?.uid;

                    return (
                        <li key={comment.id} style={styles.commentCard}>
                            <div style={styles.username}>{commentUser?.username || commentUser?.email || "Unknown User"}</div>
                            {isEditing ? (
                                <>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        style={{ width: "100%", minHeight: "60px", marginBottom: "0.5rem" }}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const blobUrl = URL.createObjectURL(file);
                                                setEditFormData((prev) => ({ ...prev, image: blobUrl }));
                                            }
                                        }}
                                        style={{ width: "100%", marginBottom: "0.5rem" }}
                                    />
                                    <div style={styles.buttonsContainer}>
                                        <button style={{ ...styles.baseButton, ...styles.editButton }} onClick={() => saveEdit(comment.id)}>Save</button>
                                        <button style={{ ...styles.baseButton, backgroundColor: "#6b7280", color: "#fff" }} onClick={cancelEditing}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>{comment.description}</p>
                                    {comment.image && <img src={comment.image} alt="comment" style={{ maxWidth: "100%", borderRadius: "6px" }} />}
                                    <div style={styles.metadata}>
                                        Posted: {comment.createdAt.toDate ? comment.createdAt.toDate().toLocaleString() : new Date(comment.createdAt).toLocaleString()}
                                    </div>

                                    <div style={styles.buttonsContainer}>
                                        <button
                                            disabled={!user}
                                            style={{ ...styles.baseButton, ...styles.upvote, opacity: currentVote === "upvote" ? 1 : 0.6 }}
                                            onClick={() => handleVote(comment, "upvote")}
                                        >
                                            👍 {comment.upvotes}
                                        </button>
                                        <button
                                            disabled={!user}
                                            style={{ ...styles.baseButton, ...styles.downvote, opacity: currentVote === "downvote" ? 1 : 0.6 }}
                                            onClick={() => handleVote(comment, "downvote")}
                                        >
                                            👎 {comment.downvotes}
                                        </button>
                                        {isAuthor && (
                                            <>
                                                <button style={{ ...styles.baseButton, ...styles.deleteButton }} onClick={() => onDelete(comment.id)}>Delete</button>
                                                <button style={{ ...styles.baseButton, ...styles.editButton }} onClick={() => startEditing(comment)}>Edit</button>
                                            </>
                                        )}

                                    </div>
                                </>
                            )}
                            <TestReplies threadId={threadId} commentId={comment.id} findUserById={findUserById} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TestComments;
