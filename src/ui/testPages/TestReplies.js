import React, { useState } from "react";
import useReplies from "../../hooks/useReplies";
import { useAuth } from "../../hooks/useAuth";

const TestReplies = ({ threadId, commentId, parentReplyId = null, findUserById, level = 0 }) => {
    const { user } = useAuth();
    const { replies, onAdd, onDelete, onUpdate } = useReplies(threadId, commentId);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editFormData, setEditFormData] = useState({ description: "", image: "" });
    const [replyFormOpen, setReplyFormOpen] = useState({});
    const [replyFormData, setReplyFormData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleChange = (id, value) => {
        setReplyFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (parentId = null) => {
        const id = parentId || "root";
        const data = replyFormData[id];
        if (!data?.description?.trim() || !user) return;

        onAdd({
            description: data.description,
            image: data.image || null,
            createdAt: new Date(),
            userId: user.uid,
            parentId,
            upvotes: 0,
            downvotes: 0,
            votedBy: {},
        });

        setReplyFormOpen((prev) => ({ ...prev, [id]: false }));
        setReplyFormData((prev) => ({ ...prev, [id]: { description: "", image: "" } }));
    };

    const handleVote = (reply, type) => {
        if (!user) return;
        const currentVote = reply.votedBy?.[user.uid] || null;
        let upvotes = reply.upvotes;
        let downvotes = reply.downvotes;
        const votedBy = { ...(reply.votedBy || {}) };

        if (currentVote === type) {
            if (type === "upvote") upvotes--;
            if (type === "downvote") downvotes--;
            delete votedBy[user.uid];
        } else {
            if (currentVote === "upvote") upvotes--;
            if (currentVote === "downvote") downvotes--;
            if (type === "upvote") upvotes++;
            if (type === "downvote") downvotes++;
            votedBy[user.uid] = type;
        }

        onUpdate(reply.id, { ...reply, upvotes, downvotes, votedBy });
    };

    const startEditing = (reply) => {
        if (reply.userId !== user?.uid) return;
        setEditingReplyId(reply.id);
        setEditFormData({ description: reply.description, image: reply.image || "" });
    };

    const cancelEditing = () => {
        setEditingReplyId(null);
        setEditFormData({ description: "", image: "" });
    };

    const saveEdit = (replyId) => {
        onUpdate(replyId, { description: editFormData.description, image: editFormData.image });
        cancelEditing();
    };

    const repliesWithUsers = replies
        .filter((r) => r.parentId === parentReplyId)
        .map((r) => ({ ...r, user: findUserById(r.userId) }));

    const styles = {
        container: { marginLeft: parentReplyId ? `${level * 20}px` : "1rem", maxWidth: "600px", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" },
        replyCard: { border: "1px solid #eee", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.75rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
        username: { fontWeight: "bold", color: "#333", marginBottom: "0.25rem" },
        metadata: { fontSize: "0.8rem", color: "#555", marginBottom: "0.5rem" },
        replyText: { margin: "0.5rem 0" },
        replyImage: { maxWidth: "100%", borderRadius: "6px", marginTop: "0.5rem" },

        actionsContainer: { display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem", alignItems: "center" },
        baseButton: {
            minWidth: "70px",
            padding: "0.35rem 0.6rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8rem",
            textAlign: "center"
        },
        upvote: { backgroundColor: "#10b981", color: "#fff" },
        downvote: { backgroundColor: "#ef4444", color: "#fff" },
        edit: { backgroundColor: "#f59e0b", color: "#fff" },
        delete: { backgroundColor: "#dc3545", color: "#fff" },
        reply: { backgroundColor: "#6b7280", color: "#fff" },
        cancel: { backgroundColor: "#6b7280", color: "#fff" },

        modalOverlay: {
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000
        },
        modalBox: {
            background: "#fff", padding: "1rem 1.5rem", borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)", maxWidth: "300px", textAlign: "center"
        }
    };

    return (
        <div style={styles.container}>
            {/* Root-level reply behaves like any other reply */}
            {parentReplyId === null && replyFormOpen.root && (
                <div style={styles.form}>
                    <textarea
                        value={replyFormData.root?.description || ""}
                        onChange={(e) => handleChange("root", { ...replyFormData.root, description: e.target.value })}
                        placeholder="Write your reply..."
                        style={styles.textarea}
                    />
                    {replyFormData.root?.image && (
                        <img src={replyFormData.root.image} alt="preview" style={styles.replyImage} />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const blobUrl = URL.createObjectURL(file);
                                handleChange("root", { ...replyFormData.root, image: blobUrl });
                            }
                        }}
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                    <div style={styles.actionsContainer}>
                        <button style={{ ...styles.baseButton, ...styles.reply }} onClick={() => handleSubmit(null)}>Post Reply</button>
                        <button style={{ ...styles.baseButton, ...styles.cancel }} onClick={() => setReplyFormOpen({ ...replyFormOpen, root: false })}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Root-level Reply button */}
            {parentReplyId === null && !replyFormOpen.root && (
                <button style={{ ...styles.baseButton, ...styles.reply }} onClick={() => setReplyFormOpen({ ...replyFormOpen, root: true })}>
                    Reply
                </button>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {repliesWithUsers.map((r) => {
                    const currentVote = r.votedBy?.[user?.uid] || null;
                    const isEditing = editingReplyId === r.id;
                    const isAuthor = r.userId === user?.uid;

                    return (
                        <li key={r.id} style={styles.replyCard}>
                            <div style={styles.username}>{r.user?.username || r.user?.email || "Unknown User"}</div>

                            {isEditing ? (
                                <div style={styles.form}>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        style={styles.textarea}
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
                                        style={styles.input}
                                    />
                                    <div style={styles.actionsContainer}>
                                        <button style={{ ...styles.baseButton, ...styles.edit }} onClick={() => saveEdit(r.id)}>Save</button>
                                        <button style={{ ...styles.baseButton, ...styles.cancel }} onClick={cancelEditing}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p style={styles.replyText}>{r.description}</p>
                                    {r.image && <img src={r.image} alt="reply" style={styles.replyImage} />}
                                    <div style={styles.metadata}>
                                        Posted: {r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : new Date(r.createdAt).toLocaleString()}
                                    </div>

                                    <div style={styles.actionsContainer}>
                                        <button
                                            disabled={!user}
                                            style={{ ...styles.baseButton, ...styles.upvote, opacity: currentVote === "upvote" ? 1 : 0.6 }}
                                            onClick={() => handleVote(r, "upvote")}
                                        >
                                            👍 {r.upvotes}
                                        </button>
                                        <button
                                            disabled={!user}
                                            style={{ ...styles.baseButton, ...styles.downvote, opacity: currentVote === "downvote" ? 1 : 0.6 }}
                                            onClick={() => handleVote(r, "downvote")}
                                        >
                                            👎 {r.downvotes}
                                        </button>
                                        {isAuthor && (
                                            <>
                                                <button style={{ ...styles.baseButton, ...styles.delete }} onClick={() => setDeleteTarget(r.id)}>Delete</button>
                                                <button style={{ ...styles.baseButton, ...styles.edit }} onClick={() => startEditing(r)}>Edit</button>
                                            </>
                                        )}
                                        <button
                                            style={{ ...styles.baseButton, ...styles.reply }}
                                            onClick={() => setReplyFormOpen((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                                        >
                                            Reply
                                        </button>
                                    </div>

                                    {replyFormOpen[r.id] && (
                                        <div style={styles.form}>
                                            <textarea
                                                value={replyFormData[r.id]?.description || ""}
                                                onChange={(e) => handleChange(r.id, { ...replyFormData[r.id], description: e.target.value })}
                                                placeholder="Write your reply..."
                                                style={styles.textarea}
                                            />
                                            {replyFormData[r.id]?.image && (
                                                <img src={replyFormData[r.id].image} alt="preview" style={styles.replyImage} />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const blobUrl = URL.createObjectURL(file);
                                                        handleChange(r.id, { ...replyFormData[r.id], image: blobUrl });
                                                    }
                                                }}
                                                style={{ width: "100%", marginBottom: "0.5rem" }}
                                            />
                                            <div style={styles.actionsContainer}>
                                                <button style={{ ...styles.baseButton, ...styles.reply }} onClick={() => handleSubmit(r.id)}>Post Reply</button>
                                                <button style={{ ...styles.baseButton, ...styles.cancel }} onClick={() => setReplyFormOpen((prev) => ({ ...prev, [r.id]: false }))}>Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    <TestReplies
                                        threadId={threadId}
                                        commentId={commentId}
                                        parentReplyId={r.id}
                                        findUserById={findUserById}
                                        level={level + 1}
                                    />
                                </>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Delete modal */}
            {deleteTarget && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <p style={{ marginBottom: "1rem" }}>Are you sure you want to delete?</p>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                            <button style={{ ...styles.baseButton, ...styles.cancel }} onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button style={{ ...styles.baseButton, ...styles.delete }} onClick={() => { onDelete(deleteTarget); setDeleteTarget(null); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestReplies;
