import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import useThreads from "../../hooks/useThreads";
import useUsers from "../../hooks/useUsers";
import { useAuth } from "../../hooks/useAuth";
import { getAuth } from "firebase/auth";
import TestComments from "./TestComments";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../config/firebase";

const initialState = {
    title: "",
    description: "",
    image: "",
    preview:""
}

const ThreadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { threads, onUpdate, onDelete } = useThreads();
    const { findUserById } = useUsers();

    const auth = getAuth();
    const currentUser = auth.currentUser?.uid;

    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState(initialState);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const styles = {
        page: {
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#ECECE7",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column"
        },
        container: {
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "1.5rem",
            flex: "1"
        },
        backButton: {
            padding: "0.5rem 1rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "background-color 0.3s"
        },
        threadContainer: {
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "1.5rem"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
            gap: "1rem"
        },
        title: {
            fontSize: "1.8rem",
            fontWeight: "600",
            color: "#333",
            margin: "0",
            flex: "1"
        },
        description: {
            fontSize: "1rem",
            color: "#555",
            lineHeight: "1.6",
            marginBottom: "1rem"
        },
        image: {
            maxWidth: "1920px",
            maxHeight: "1080px",
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "0.5rem"
        },
        metadata: {
            marginTop: "10px",
            padding: "0.8rem 1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "0.9rem",
            color: "#777",
            marginBottom: "1rem"
        },
        userName: {
            fontWeight: "600",
            color: "#4f46e5"
        },
        actionButtons: {
            display: "flex",
            gap: "0.4rem",
            flexShrink: 0
        },
        actionButton: {
            padding: "0.4rem 0.8rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "500",
            minWidth: "60px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
        },
        primaryButton: {
            backgroundColor: "#4f46e5",
            color: "white"
        },
        greenButton: {
            backgroundColor: "#10B981",
            color: "white"
        },
        secondaryButton: {
            backgroundColor: "#6b7280",
            color: "white"
        },
        dangerButton: {
            backgroundColor: "#dc3545",
            color: "white"
        },
        warningButton: {
            backgroundColor: "#f59e0b",
            color: "white"
        },
        buttonsContainer: {
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap"
        },
        uniformButton: {
            padding: "0.4rem 0.8rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "500",
            minWidth: "60px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.3rem"
        },
        upvoteButton: {
            backgroundColor: "#10b981",
            color: "white"
        },
        downvoteButton: {
            backgroundColor: "#ef4444",
            color: "white"
        },
        voteActive: {
            opacity: 1
        },
        voteInactive: {
            opacity: 0.6
        },
        likeDislikeContainer: {
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.5rem",
            marginBottom: "1rem"
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
        },
        input: {
            padding: "0.6rem 0.8rem",
            fontSize: "1rem",
            fontWeight: "600",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontFamily: "'Poppins', sans-serif"
        },
        textarea: {
            padding: "0.6rem 0.8rem",
            fontSize: "0.95rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            minHeight: "100px",
            resize: "vertical",
            fontFamily: "'Poppins', sans-serif"
        },
        editButtons: {
            display: "flex",
            gap: "0.8rem",
            justifyContent: "flex-end"
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        },
        modalContent: {
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
        },
        modalTitle: {
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#333",
            marginBottom: "0.8rem"
        },
        modalText: {
            color: "#666",
            marginBottom: "1.2rem",
            lineHeight: "1.4"
        },
        modalButtons: {
            display: "flex",
            gap: "0.8rem",
            justifyContent: "center"
        },
        notFound: {
            textAlign: "center",
            padding: "3rem 1.5rem",
            fontSize: "1.1rem",
            color: "#666",
            fontFamily: "'Poppins', sans-serif"
        }
    };

    const thread = threads.find((t) => t.id === id);
    if (!thread) return <div style={styles.notFound}>Discussion not found</div>;

    const threadUser = findUserById(thread.userId);
    const isAuthor = thread.userId === currentUser;

    const startEditing = () => {
        setIsEditing(true);
        setEditFormData({
            title: thread.title,
            description: thread.description,
            image: thread.image || "",
            preview: thread.image || ""
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const previewUrl = URL.createObjectURL(file)
            setEditFormData({...editFormData, image: file, preview: previewUrl})
        }
    }

    const cancelEditing = () => {
        setIsEditing(false);
        setEditFormData({ title: "", description: "", image: "" });
    };

    const saveEdit = () => {
        onUpdate(thread.id, {
            ...thread,
            title: editFormData.title,
            description: editFormData.description,
            image: editFormData.image,
        });
        setIsEditing(false);
    };

    const confirmDelete = () => {
        onDelete(thread.id);
        setShowDeleteModal(false);
        navigate("/threads");
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            alert("You must be logged in to post threads.");
            return;
        }

        let imageURL = thread.image || "";

        if (editFormData.image && editFormData.image instanceof File) {
            const storageRef = ref(storage, `threads/${editFormData.image.name}`);
            await uploadBytes(storageRef, editFormData.image);
            imageURL = await getDownloadURL(storageRef);
        }

        if (!editFormData.title.trim() || !editFormData.description.trim()) return;

        await onUpdate(thread.id, {
            ...thread,
            title: editFormData.title,
            description: editFormData.description,
            image: imageURL,
        });

        setEditFormData(initialState);
        setIsEditing(false);
    };

    // Add DB-backed like/dislike function
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

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate("/threads")}
                >
                    ← Back to Discussions
                </button>

                <div style={styles.threadContainer}>
                    {isEditing ? (
                        <div style={styles.form}>
                            <h2 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "1.3rem" }}>Edit Discussion</h2>
                            <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                placeholder="Discussion title"
                                style={styles.input}
                            />
                            <textarea
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                placeholder="Discussion description"
                                style={styles.textarea}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ padding: "0.4rem" }}
                            />
                            {editFormData.preview && (
                                <img
                                    src={editFormData.preview}
                                    alt="Preview"
                                    style={{ ...styles.image, marginTop: "0.5rem" }}
                                />
                            )}
                            <div style={styles.editButtons}>
                                <button
                                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                                    onClick={cancelEditing}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{ ...styles.actionButton, ...styles.greenButton }}
                                    onClick={handleSubmit}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={styles.header}>
                                <h1 style={styles.title}>{thread.title}</h1>

                                {isAuthor && (
                                    <div style={styles.actionButtons}>
                                        <button
                                            style={{ ...styles.actionButton, ...styles.warningButton }}
                                            onClick={startEditing}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            style={{ ...styles.actionButton, ...styles.dangerButton }}
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p style={styles.description}>{thread.description}</p>

                            {thread.image && (
                                <img
                                    src={thread.image}
                                    alt="Discussion"
                                    style={styles.image}
                                />
                            )}

                            {/* Like/Dislike buttons (DB-backed) */}
                            <div style={styles.buttonsContainer}>
                                <button
                                    disabled={!currentUser}
                                    style={{
                                        ...styles.uniformButton,
                                        ...styles.upvoteButton,
                                        ...(thread.votedBy?.[currentUser] === "upvote" ? styles.voteActive : styles.voteInactive)
                                    }}
                                    onClick={() => handleVote(thread, "upvote")}
                                >
                                    👍 {thread.upvotes}
                                </button>
                                <button
                                    disabled={!currentUser}
                                    style={{
                                        ...styles.uniformButton,
                                        ...styles.downvoteButton,
                                        ...(thread.votedBy?.[currentUser] === "downvote" ? styles.voteActive : styles.voteInactive)
                                    }}
                                    onClick={() => handleVote(thread, "downvote")}
                                >
                                    👎 {thread.downvotes}
                                </button>
                            </div>

                            <div style={styles.metadata}>
                                Posted by <Link to={`/users/${threadUser?.uid}`} style={styles.userName}>
                                    {threadUser?.username || threadUser?.email || "Unknown User"}
                                </Link> • {thread.createdAt.toDate ? thread.createdAt.toDate().toLocaleString() : new Date(thread.createdAt).toLocaleString()}
                            </div>
                        </>
                    )}
                </div>

                <TestComments threadId={thread.id} findUserById={findUserById} />

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h3 style={styles.modalTitle}>Delete Discussion</h3>
                            <p style={styles.modalText}>
                                Are you sure you want to delete this discussion? This action cannot be undone and will also delete all comments and replies.
                            </p>
                            <div style={styles.modalButtons}>
                                <button
                                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{ ...styles.actionButton, ...styles.dangerButton }}
                                    onClick={confirmDelete}
                                >
                                    Delete Discussion
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadDetails;
