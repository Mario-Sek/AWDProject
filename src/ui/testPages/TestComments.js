import React, {useState} from "react";
import useComments from "../../hooks/useComments";
import TestReplies from "./TestReplies";
import {useAuth} from "../../hooks/useAuth";
import {useNavigate} from "react-router-dom";

const initialFormData = {
    description: "",
    downvotes: 0,
    upvotes: 0,
    votedBy: {},
    image: null,
};

const TestComments = ({threadId, findUserById}) => {
    const {user} = useAuth();
    const navigate = useNavigate()
    const {comments, onAdd, onDelete, onUpdate} = useComments(threadId);
    const [formData, setFormData] = useState(initialFormData);
    const [showForm, setShowForm] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editFormData, setEditFormData] = useState({description: "", image: ""});
    const [replyFormOpen, setReplyFormOpen] = useState({});
    const [replyFormData, setReplyFormData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [commentReplyFormOpen, setCommentReplyFormOpen] = useState({});
    const [sortBy, setSortBy] = useState("newest"); // New state for sorting

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
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
        const votedBy = {...(comment.votedBy || {})};

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

        const updatedComment = {...comment, upvotes, downvotes, votedBy};
        onUpdate(comment.id, updatedComment);
    };

    const startEditing = (comment) => {
        if (comment.userId !== user?.uid) return;
        setEditingCommentId(comment.id);
        setEditFormData({description: comment.description, image: comment.image || ""});
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditFormData({description: "", image: ""});
    };

    const saveEdit = (commentId) => {
        onUpdate(commentId, {description: editFormData.description, image: editFormData.image});
        cancelEditing();
    };

    const handleCommentReplyToggle = (commentId) => {
        setCommentReplyFormOpen(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    const handleReplySubmit = (commentId) => {
        const data = replyFormData[commentId];
        if (!data?.description?.trim() || !user) return;

        console.log("Reply submitted:", {commentId, data});

        setReplyFormOpen((prev) => ({...prev, [commentId]: false}));
        setReplyFormData((prev) => ({...prev, [commentId]: {description: "", image: ""}}));
    };

    const handleReplyChange = (commentId, field, value) => {
        setReplyFormData((prev) => ({
            ...prev,
            [commentId]: {...prev[commentId], [field]: value}
        }));
    };

    const confirmDelete = () => {
        onDelete(deleteTarget);
        setDeleteTarget(null);
    };

    // Sort comments based on selected criteria
    const getSortedComments = () => {
        const sortedComments = [...comments];

        if (sortBy === "newest") {
            return sortedComments.sort((a, b) => {
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
        } else if (sortBy === "topRated") {
            return sortedComments.sort((a, b) => {
                const netVotesA = (a.upvotes || 0) - (a.downvotes || 0);
                const netVotesB = (b.upvotes || 0) - (b.downvotes || 0);
                return netVotesB - netVotesA;
            });
        }

        return sortedComments;
    };

    const styles = {
        container: {
            maxWidth: "800px",
            margin: "2rem auto 0",
            fontFamily: "'Poppins', sans-serif",
            padding: "0 1rem"
        },
        header: {
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#333",
            marginBottom: "1.5rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #eee"
        },
        // New styles for the controls container
        controlsContainer: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            gap: "1rem"
        },
        sortContainer: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
        },
        sortLabel: {
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#555"
        },
        sortSelect: {
            padding: "0.4rem 0.8rem",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "0.85rem",
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#fff",
            cursor: "pointer"
        },
        unifiedForm: {
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #eee",
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
        },
        form: {
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
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
        toggleButton: {
            padding: "0.4rem 0.8rem",
            backgroundColor: "#fff",
            color: "#4f46e5",
            border: "2px solid #4f46e5",
            borderRadius: "5px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.8rem"
        },
        commentCard: {
            backgroundColor: "#fff",
            border: "1px solid #eee",
            borderRadius: "10px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        },
        commentHeader: {
            marginBottom: "0.75rem"
        },
        username: {
            fontWeight: "600",
            color: "#4f46e5",
            fontSize: "1rem"
        },
        commentText: {
            color: "#555",
            fontSize: "1rem",
            lineHeight: "1.6",
            margin: "0.75rem 0"
        },
        commentImage: {
            maxWidth: "100%",
            borderRadius: "8px",
            marginTop: "0.75rem"
        },
        metadata: {
            fontSize: "0.9rem",
            color: "#777",
            marginBottom: "1rem"
        },
        buttonsContainer: {
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "1rem"
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
        editButton: {
            backgroundColor: "#f59e0b",
            color: "white"
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "white"
        },
        replyButton: {
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
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        },
        modalContent: {
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

    const sortedComments = getSortedComments();

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Comments ({comments.length})</h3>

            {/* New controls container with sort options on left and add comment button on right */}
            <div style={styles.controlsContainer}>
                <div style={styles.sortContainer}>
                    <span style={styles.sortLabel}>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={styles.sortSelect}
                    >
                        <option value="newest">Newest</option>
                        <option value="topRated">Top Rated</option>
                    </select>
                </div>


                {!showForm && (

                    user ?
                        (< button
                            style={styles.toggleButton}
                            onClick={() => setShowForm(true)}
                        >
                            Add Comment
                        </button>) :
                        (< button
                            style={styles.toggleButton}
                            onClick={() => navigate('login/')}
                        >
                            Add Comment
                        </button>)

                )}
            </div>

            {showForm && (
                <div style={styles.form}>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Share your thoughts about this discussion..."
                        style={styles.textarea}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const blobUrl = URL.createObjectURL(file);
                                setFormData((prev) => ({...prev, image: blobUrl}));
                            }
                        }}
                        style={styles.input}
                    />
                    <div style={styles.formButtons}>
                        <button
                            style={{...styles.smallButton, ...styles.secondaryButton}}
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            style={styles.smallButton}
                            onClick={handleSubmit}
                        >
                            Post Comment
                        </button>
                    </div>
                </div>
            )}

            <div>
                {sortedComments.map((comment) => {
                    const commentUser = findUserById(comment.userId);
                    const currentVote = comment.votedBy?.[user?.uid] || null;
                    const isEditing = editingCommentId === comment.id;
                    const isAuthor = comment.userId === user?.uid;

                    return (
                        <div key={comment.id} style={styles.commentCard}>
                            <div style={styles.commentHeader}>
                                <div style={styles.username}>
                                    {commentUser?.username || commentUser?.email || "Unknown User"}
                                </div>
                                <div style={styles.metadata}>
                                    {comment.createdAt.toDate ? comment.createdAt.toDate().toLocaleString() : new Date(comment.createdAt).toLocaleString()}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={styles.unifiedForm}>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) =>
                                            setEditFormData({...editFormData, description: e.target.value})
                                        }
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
                                            onClick={() => saveEdit(comment.id)}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p style={styles.commentText}>{comment.description}</p>
                                    {comment.image &&
                                        <img src={comment.image} alt="Comment" style={styles.commentImage}/>
                                    }

                                    <div style={styles.buttonsContainer}>
                                        <button
                                            disabled={!user}
                                            style={{
                                                ...styles.voteButton,
                                                ...styles.upvoteButton,
                                                ...(currentVote === "upvote"
                                                    ? styles.voteActive
                                                    : styles.voteInactive)
                                            }}
                                            onClick={() => handleVote(comment, "upvote")}
                                        >
                                            👍 {comment.upvotes}
                                        </button>
                                        <button
                                            disabled={!user}
                                            style={{
                                                ...styles.voteButton,
                                                ...styles.downvoteButton,
                                                ...(currentVote === "downvote"
                                                    ? styles.voteActive
                                                    : styles.voteInactive)
                                            }}
                                            onClick={() => handleVote(comment, "downvote")}
                                        >
                                            👎 {comment.downvotes}
                                        </button>

                                        <button
                                            style={{...styles.actionButton, ...styles.replyButton}}
                                            onClick={() => {
                                                if (!user) navigate("/login")
                                                else
                                                    handleCommentReplyToggle(comment.id)
                                            }}
                                        >
                                            Reply
                                        </button>

                                        {isAuthor && (
                                            <>
                                                <button
                                                    style={{...styles.actionButton, ...styles.editButton}}
                                                    onClick={() => startEditing(comment)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    style={{...styles.actionButton, ...styles.deleteButton}}
                                                    onClick={() => setDeleteTarget(comment.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            <TestReplies
                                threadId={threadId}
                                commentId={comment.id}
                                findUserById={findUserById}
                                commentReplyFormOpen={commentReplyFormOpen[comment.id]}
                                onCommentReplyToggle={() => handleCommentReplyToggle(comment.id)}
                            />
                        </div>
                    );
                })}
            </div>

            {deleteTarget && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Delete Comment</h3>
                        <p style={styles.modalText}>
                            Are you sure you want to delete this comment? This action cannot be undone.
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

export default TestComments;
