import React, {useState} from "react";
import useReplies from "../../hooks/useReplies";
import {useAuth} from "../../hooks/useAuth";
import {useNavigate} from "react-router-dom";

const TestReplies = ({
                         threadId,
                         commentId,
                         parentReplyId = null,
                         findUserById,
                         level = 0,
                         hideRootReply = false,
                         commentReplyFormOpen = false,
                         onCommentReplyToggle = null
                     }) => {
    const {user} = useAuth();
    const {replies, onAdd, onDelete, onUpdate} = useReplies(threadId, commentId);
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editFormData, setEditFormData] = useState({description: "", image: ""});
    const [replyFormOpen, setReplyFormOpen] = useState({});
    const [replyFormData, setReplyFormData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const navigate = useNavigate()
    const handleChange = (id, value) => {
        setReplyFormData((prev) => ({...prev, [id]: value}));
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

        setReplyFormOpen((prev) => ({...prev, [id]: false}));
        setReplyFormData((prev) => ({...prev, [id]: {description: "", image: ""}}));
    };

    const handleVote = (reply, type) => {
        if (!user) return;
        const currentVote = reply.votedBy?.[user.uid] || null;
        let upvotes = reply.upvotes;
        let downvotes = reply.downvotes;
        const votedBy = {...(reply.votedBy || {})};

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

        onUpdate(reply.id, {...reply, upvotes, downvotes, votedBy});
    };

    const startEditing = (reply) => {
        if (reply.userId !== user?.uid) return;
        setEditingReplyId(reply.id);
        setEditFormData({description: reply.description, image: reply.image || ""});
    };

    const cancelEditing = () => {
        setEditingReplyId(null);
        setEditFormData({description: "", image: ""});
    };

    const saveEdit = (replyId) => {
        onUpdate(replyId, {description: editFormData.description, image: editFormData.image});
        cancelEditing();
    };

    const confirmDelete = () => {
        onDelete(deleteTarget);
        setDeleteTarget(null);
    };

    const repliesWithUsers = replies
        .filter((r) => r.parentId === parentReplyId)
        .map((r) => ({...r, user: findUserById(r.userId)}))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const styles = {
        container: {
            marginLeft: parentReplyId ? `${Math.min(level * 20, 100)}px` : "1rem",
            marginTop: "1rem",
            fontFamily: "'Poppins', sans-serif"
        },
        unifiedForm: {
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem"
        },
        textarea: {
            width: "100%",
            display: "block",
            padding: "0.75rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif",
            minHeight: "80px",
            resize: "vertical",
            boxSizing: "border-box"
        },
        input: {
            width: "100%",
            display: "block",
            padding: "0.6rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif",
            boxSizing: "border-box"
        },
        replyCard: {
            backgroundColor: "#fff",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
        },
        username: {
            fontWeight: "600",
            color: "#4f46e5",
            fontSize: "0.9rem",
            marginBottom: "0.25rem"
        },
        metadata: {
            fontSize: "0.8rem",
            color: "#777",
            marginBottom: "0.75rem"
        },
        replyText: {
            color: "#555",
            fontSize: "0.9rem",
            lineHeight: "1.5",
            margin: "0.5rem 0"
        },
        replyImage: {
            maxWidth: "100%",
            borderRadius: "6px",
            marginTop: "0.5rem"
        },
        buttonsContainer: {
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            marginTop: "1rem",
            alignItems: "center"
        },
        smallButton: {
            padding: "0.4rem 0.8rem",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.8rem",
            minWidth: "50px",
            height: "28px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
        },
        secondaryButton: {
            backgroundColor: "#6b7280",
            color: "white"
        },
        actionButton: {
            padding: "0.25rem 0.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: "500",
            minWidth: "45px",
            height: "26px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
        },
        voteButton: {
            padding: "0.25rem 0.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: "500",
            minWidth: "50px",
            height: "26px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem"
        },
        upvoteButton: {
            backgroundColor: "#10b981",
            color: "white"
        },
        downvoteButton: {
            backgroundColor: "#ef4444",
            color: "white"
        },
        editButton: {
            backgroundColor: "#f59e0b",
            color: "white"
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "white"
        },
        replyButton: {
            backgroundColor: "#4f46e5",
            color: "white"
        },
        replyToggleButton: {
            backgroundColor: "#fff",
            color: "#4f46e5",
            border: "1px solid #4f46e5"
        },
        voteActive: {opacity: 1},
        voteInactive: {opacity: 0.6},
        formButtons: {
            display: "flex",
            gap: "0.5rem",
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
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        },
        modalBox: {
            backgroundColor: "#fff",
            padding: "2rem",
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
            marginBottom: "1rem"
        },
        modalText: {
            color: "#666",
            marginBottom: "1.5rem",
            lineHeight: "1.5"
        },
        modalButtons: {
            display: "flex",
            gap: "1rem",
            justifyContent: "center"
        },
        modalCancelButton: {
            padding: "0.5rem 1rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem"
        },
        modalDeleteButton: {
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem"
        }
    };

    return (
        <div style={styles.container}>
            {/* Root-level reply form - now controlled by parent */}
            {parentReplyId === null && commentReplyFormOpen && (
                <div style={styles.unifiedForm}>
                    <textarea
                        value={replyFormData.root?.description || ""}
                        onChange={(e) =>
                            handleChange("root", { ...replyFormData.root, description: e.target.value })
                        }
                        placeholder="Write your reply..."
                        style={styles.textarea}
                    />

                    {replyFormData.root?.image && (
                        <img src={replyFormData.root.image} alt="Preview" style={styles.replyImage} />
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
                        style={styles.input}
                    />

                    <div style={styles.formButtons}>
                        <button
                            style={{...styles.smallButton, ...styles.secondaryButton}}
                            onClick={onCommentReplyToggle}
                        >
                            Cancel
                        </button>
                        <button
                            style={styles.smallButton}
                            onClick={() => {
                                handleSubmit(null);
                                onCommentReplyToggle();
                            }}
                        >
                            Post Reply
                        </button>
                    </div>
                </div>
            )}

            <div>
                {repliesWithUsers.map((r) => {
                    const currentVote = r.votedBy?.[user?.uid] || null;
                    const isEditing = editingReplyId === r.id;
                    const isAuthor = r.userId === user?.uid;

                    return (
                        <div key={r.id} style={styles.replyCard}>
                            <div style={styles.username}>
                                {r.user?.username || r.user?.email || "Unknown User"}
                            </div>
                            <div style={styles.metadata}>
                                {r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : new Date(r.createdAt).toLocaleString()}
                            </div>

                            {isEditing ? (
                                <div style={styles.unifiedForm}>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            description: e.target.value
                                        })}
                                        style={styles.textarea}
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const blobUrl = URL.createObjectURL(file);
                                                setEditFormData((prev) => ({...prev, image: blobUrl}));
                                            }
                                        }}
                                        style={styles.input}
                                    />
                                    <div style={styles.formButtons}>
                                        <button
                                            style={{...styles.smallButton, ...styles.secondaryButton}}
                                            onClick={cancelEditing}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            style={styles.smallButton}
                                            onClick={() => saveEdit(r.id)}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p style={styles.replyText}>{r.description}</p>
                                    {r.image && <img src={r.image} alt="Reply" style={styles.replyImage}/>}

                                    <div style={styles.buttonsContainer}>
                                        <button
                                            disabled={!user}
                                            style={{
                                                ...styles.voteButton,
                                                ...styles.upvoteButton,
                                                ...(currentVote === "upvote" ? styles.voteActive : styles.voteInactive)
                                            }}
                                            onClick={() => handleVote(r, "upvote")}
                                        >
                                            👍 {r.upvotes}
                                        </button>
                                        <button
                                            disabled={!user}
                                            style={{
                                                ...styles.voteButton,
                                                ...styles.downvoteButton,
                                                ...(currentVote === "downvote" ? styles.voteActive : styles.voteInactive)
                                            }}
                                            onClick={() => handleVote(r, "downvote")}
                                        >
                                            👎 {r.downvotes}
                                        </button>

                                        <button
                                            style={{...styles.actionButton, ...styles.replyToggleButton}}
                                            onClick={() => setReplyFormOpen((prev) => ({
                                                ...prev,
                                                [r.id]: !prev[r.id]
                                            }))}
                                        >
                                            Reply
                                        </button>
                                        {isAuthor && (
                                            <>
                                                <button
                                                    style={{...styles.actionButton, ...styles.editButton}}
                                                    onClick={() => startEditing(r)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    style={{...styles.actionButton, ...styles.deleteButton}}
                                                    onClick={() => setDeleteTarget(r.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {replyFormOpen[r.id] && (
                                        <div style={styles.unifiedForm}>
                                            <textarea
                                                value={replyFormData[r.id]?.description || ""}
                                                onChange={(e) => handleChange(r.id, {
                                                    ...replyFormData[r.id],
                                                    description: e.target.value
                                                })}
                                                placeholder="Write your reply..."
                                                style={styles.textarea}
                                            />
                                            {replyFormData[r.id]?.image && (
                                                <img src={replyFormData[r.id].image} alt="Preview"
                                                     style={styles.replyImage}/>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const blobUrl = URL.createObjectURL(file);
                                                        handleChange(r.id, {...replyFormData[r.id], image: blobUrl});
                                                    }
                                                }}
                                                style={styles.input}
                                            />
                                            <div style={styles.formButtons}>
                                                <button
                                                    style={{...styles.smallButton, ...styles.secondaryButton}}
                                                    onClick={() => setReplyFormOpen((prev) => ({
                                                        ...prev,
                                                        [r.id]: false
                                                    }))}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    style={styles.smallButton}
                                                    onClick={() => handleSubmit(r.id)}
                                                >
                                                    Post Reply
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <TestReplies
                                        threadId={threadId}
                                        commentId={commentId}
                                        parentReplyId={r.id}
                                        findUserById={findUserById}
                                        level={level + 1}
                                        hideRootReply={hideRootReply}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {deleteTarget && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <h3 style={styles.modalTitle}>Delete Reply</h3>
                        <p style={styles.modalText}>
                            Are you sure you want to delete this reply? This action cannot be undone.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                style={styles.modalCancelButton}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                style={styles.modalDeleteButton}
                                onClick={confirmDelete}
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

export default TestReplies;
