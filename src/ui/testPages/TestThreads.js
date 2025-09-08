import React, { useState } from "react";
import useThreads from "../../hooks/useThreads";
import useUsers from "../../hooks/useUsers";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const initialFormData = {
    title: "",
    description: "",
    image: null,
    upvotes: 0,
    downvotes: 0,
    votedBy: {},
};

const TestThreads = () => {
    const { threads, onAdd, onDelete, onUpdate } = useThreads();
    const { findUserById } = useUsers();
    const [formData, setFormData] = useState(initialFormData);
    const [editingThreadId, setEditingThreadId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [filter, setFilter] = useState("newest");
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const auth = getAuth();
    const currentUser = auth.currentUser?.uid;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!currentUser) {
            alert("You must be logged in to post threads.");
            return;
        }
        if (!formData.title.trim() || !formData.description.trim()) return;
        onAdd({
            ...formData,
            createdAt: new Date(),
            userId: currentUser,
            upvotes: 0,
            downvotes: 0,
            votedBy: {},
        });
        setFormData(initialFormData);
        setShowForm(false);
    };

    const handleVote = (thread, type) => {
        if (!currentUser) return;
        const currentVote = thread.votedBy?.[currentUser] || null;
        let upvotes = thread.upvotes;
        let downvotes = thread.downvotes;
        const votedBy = { ...(thread.votedBy || {}) };

        if (currentVote === type) {
            if (type === "upvote") upvotes -= 1;
            if (type === "downvote") downvotes -= 1;
            delete votedBy[currentUser];
        } else {
            if (currentVote === "upvote") upvotes -= 1;
            if (currentVote === "downvote") downvotes -= 1;
            if (type === "upvote") upvotes += 1;
            if (type === "downvote") downvotes += 1;
            votedBy[currentUser] = type;
        }
        onUpdate(thread.id, { ...thread, upvotes, downvotes, votedBy });
    };

    const handleOpenThread = (threadId) => {
        navigate(`/threads/${threadId}`);
    };

    const startEditing = (thread) => {
        setEditingThreadId(thread.id);
        setEditFormData({
            title: thread.title,
            description: thread.description,
            image: thread.image || "",
        });
    };

    const cancelEditing = () => {
        setEditingThreadId(null);
        setEditFormData({});
    };

    const saveEdit = (threadId) => {
        onUpdate(threadId, { ...editFormData });
        cancelEditing();
    };

    // Filter & sort threads
    const filteredThreads = [...threads]
        .filter(
            (t) =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (filter === "top") {
                return b.upvotes - a.upvotes;
            } else {
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            }
        });

    const styles = {
        container: { maxWidth: "800px", margin: "1rem auto", fontFamily: "Arial, sans-serif" },
        form: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
        input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" },
        textarea: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" },
        button: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer", alignSelf: "flex-start", marginRight: "0.5rem" },
        voteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", cursor: "pointer", marginRight: "0.5rem" },
        upvote: { backgroundColor: "#10b981", color: "#fff" },
        downvote: { backgroundColor: "#ef4444", color: "#fff" },
        threadCard: { border: "1px solid #eee", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", cursor: "pointer" },
        threadHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
        deleteButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer", marginLeft: "0.5rem" },
        editButton: { padding: "0.3rem 0.6rem", borderRadius: "6px", border: "none", backgroundColor: "#f59e0b", color: "#fff", cursor: "pointer", marginLeft: "0.5rem" },
        threadImage:{width:"100%",minHeight:"200px",maxHeight:"400px",borderRadius:"6px",marginTop:"0.5rem",objectFit:"cover"},
        metadata: { fontSize: "0.8rem", color: "#555", marginTop: "0.5rem" },
        userName: { fontWeight: "bold", color: "#333" },
        editForm: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" },
        filterBar: { marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" },
        select: { padding: "0.4rem", borderRadius: "6px", border: "1px solid #ccc" },
        searchInput: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", flexGrow: 1 },
        modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
        modalBox: { background: "#fff", padding: "1rem 1.5rem", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", maxWidth: "300px", textAlign: "center" },
    };

    return (
        <div style={styles.container}>
            <h2>Threads</h2>

            {/* Filter + Post Bar + Search */}
            <div style={{ ...styles.filterBar, justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexGrow: 1 }}>
                    <input
                        type="text"
                        placeholder="Search threads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <label>Sort by: </label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
                        <option value="newest">Newest</option>
                        <option value="top">Top</option>
                    </select>
                </div>

                <button style={styles.button} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Post a Thread"}
                </button>
            </div>

            {/* Post Thread Form */}
            {showForm && (
                <div style={{ ...styles.form, marginTop: "1rem" }}>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="*Title"
                        style={styles.input}
                        required
                    />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="*Description"
                        style={styles.textarea}
                        required
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
                        style={styles.input}
                    />

                    <button
                        style={{ ...styles.button, padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        onClick={handleSubmit}
                    >
                        Post Thread
                    </button>
                </div>
            )}


            {/* Threads List */}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredThreads.map((thread) => {
                    const threadUser = findUserById(thread.userId);
                    const currentVote = thread.votedBy?.[currentUser] || null;
                    const isEditing = editingThreadId === thread.id;
                    const isOwner = thread.userId === currentUser;

                    return (
                        <li key={thread.id} style={styles.threadCard} onClick={() => !isEditing && handleOpenThread(thread.id)}>
                            <div style={styles.threadHeader}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editFormData.title}
                                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                        style={{ ...styles.input, width: "80%" }}
                                    />
                                ) : (
                                    <h3>{thread.title}</h3>
                                )}

                                <div>
                                    {isOwner && !isEditing && (
                                        <>
                                            <button style={styles.editButton} onClick={(e) => { e.stopPropagation(); startEditing(thread); }}>Edit</button>
                                            <button style={styles.deleteButton} onClick={(e) => { e.stopPropagation(); setDeleteTarget(thread.id); }}>Delete</button>
                                        </>
                                    )}
                                    {isEditing && isOwner && (
                                        <>
                                            <button style={styles.editButton} onClick={(e) => { e.stopPropagation(); saveEdit(thread.id); }}>Save</button>
                                            <button style={styles.deleteButton} onClick={(e) => { e.stopPropagation(); cancelEditing(); }}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={styles.editForm}>
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
                                </div>
                            ) : (
                                <>
                                    <p>{thread.description}</p>
                                    {thread.image && <img src={thread.image} alt="thread" style={styles.threadImage} />}
                                </>
                            )}


                            <div style={styles.metadata}>
                                Posted by <span style={styles.userName}>{threadUser?.username || threadUser?.email || "Unknown"}</span> on{" "}
                                {thread.createdAt.toDate ? thread.createdAt.toDate().toLocaleString() : new Date(thread.createdAt).toLocaleString()}
                            </div>

                            {!isEditing && (
                                <div style={{ marginTop: "0.5rem" }}>
                                    <button
                                        disabled={!currentUser}
                                        style={{ ...styles.voteButton, ...styles.upvote, opacity: currentVote === "upvote" ? 1 : 0.6 }}
                                        onClick={(e) => { e.stopPropagation(); handleVote(thread, "upvote"); }}
                                    >
                                        👍 {thread.upvotes}
                                    </button>
                                    <button
                                        disabled={!currentUser}
                                        style={{ ...styles.voteButton, ...styles.downvote, opacity: currentVote === "downvote" ? 1 : 0.6 }}
                                        onClick={(e) => { e.stopPropagation(); handleVote(thread, "downvote"); }}
                                    >
                                        👎 {thread.downvotes}
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <p style={{ marginBottom: "1rem" }}>Are you sure you want to delete this thread?</p>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                            <button
                                style={{ ...styles.button, backgroundColor: "#6b7280" }}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.button, backgroundColor: "#dc3545" }}
                                onClick={() => {
                                    onDelete(deleteTarget);
                                    setDeleteTarget(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestThreads;
