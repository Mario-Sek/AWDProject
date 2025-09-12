import React, {useState, useEffect} from "react";
import useThreads from "../../hooks/useThreads";
import useUsers from "../../hooks/useUsers";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";

const initialFormData = {
    title: "",
    description: "",
    image: null,
    upvotes: 0,
    downvotes: 0,
    votedBy: {},
};

const TestThreads = () => {
    const {threads, onAdd, onDelete, onUpdate} = useThreads();
    const {findUserById} = useUsers();
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

    const [currentPage, setCurrentPage] = useState(1);
    const THREADS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);


    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
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
        const votedBy = {...(thread.votedBy || {})};

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
        onUpdate(thread.id, {...thread, upvotes, downvotes, votedBy});
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
        onUpdate(threadId, {...editFormData});
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

    const totalPages = Math.ceil(filteredThreads.length / THREADS_PER_PAGE);

    const paginatedThreads = filteredThreads.slice(
        (currentPage - 1) * THREADS_PER_PAGE,
        currentPage * THREADS_PER_PAGE
    );


    const styles = {
        page: {
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#ECECE7",
            minHeight: "100vh",
            paddingBottom: "0"
        },
        container: {
            maxWidth: "900px",
            margin: "0 auto",
            padding: "2rem",
            marginBottom: "0"
        },
        header: {
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#333",
            textAlign: "center",
            marginBottom: "2rem"
        },
        filterSection: {
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap"
        },
        searchContainer: {
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flex: "1",
            minWidth: "300px"
        },
        input: {
            padding: "0.6rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif"
        },
        searchInput: {
            flex: "1",
            padding: "0.6rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif"
        },
        select: {
            padding: "0.6rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif",
            backgroundColor: "#fff",
            minWidth: "120px"
        },
        primaryButton: {
            padding: "0.6rem 1.2rem",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s"
        },
        secondaryButton: {
            padding: "0.6rem 1.2rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "1rem"
        },
        form: {
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
        },
        textarea: {
            padding: "0.75rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "1rem",
            fontFamily: "'Poppins', sans-serif",
            minHeight: "100px",
            resize: "vertical"
        },
        threadCard: {
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s"
        },
        threadHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
            gap: "1rem"
        },
        threadTitle: {
            fontSize: "1.4rem",
            fontWeight: "600",
            color: "#333",
            margin: "0",
            flex: "1"
        },
        threadDescription: {
            color: "#555",
            lineHeight: "1.6",
            marginBottom: "1rem"
        },
        threadImage: {
            width: "100%",
            minHeight: "200px",
            maxHeight: "400px",
            borderRadius: "6px",
            marginTop: "0.5rem",
            objectFit: "cover"
        },
        metadata: {
            fontSize: "0.9rem",
            color: "#777",
            marginBottom: "1rem"
        },
        userName: {
            fontWeight: "600",
            color: "#4f46e5"
        },
        buttonsContainer: {
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap"
        },
        // FIXED: All buttons now have exactly the same dimensions
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
        editButton: {
            backgroundColor: "#f59e0b",
            color: "white"
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "white"
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
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        },
        modalBox: {
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center"
        },
        modalButtons: {
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1.5rem"
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.header}>Car Community Discussions</h1>

                {/* Filter Section */}
                <div style={styles.filterSection}>
                    <div style={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                        <label style={{fontSize: "1rem", fontWeight: "500", color: "#555"}}>
                            Sort by:
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="newest">Newest</option>
                            <option value="top">Top Rated</option>
                        </select>
                    </div>
                    <button
                        style={styles.primaryButton}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "Start Discussion"}
                    </button>
                </div>

                {/* Post Thread Form */}
                {showForm && (
                    <div style={styles.form}>
                        <h3 style={{margin: "0 0 1rem 0", color: "#333", fontSize: "1.3rem", fontWeight: "600"}}>
                            Start a New Discussion
                        </h3>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Discussion title *"
                            style={styles.input}
                            required
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="What's on your mind about cars? *"
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
                                    setFormData((prev) => ({...prev, image: blobUrl}));
                                }
                            }}
                            style={styles.input}
                        />
                        <div style={{display: "flex", gap: "1rem", justifyContent: "flex-end"}}>
                            <button
                                style={styles.primaryButton}
                                onClick={() => {
                                    if (!currentUser) navigate('/login')
                                    handleSubmit()
                                }}
                            >
                                Post Discussion
                            </button>
                        </div>
                    </div>
                )}

                {/* Threads List */}
                <div>
                    {paginatedThreads.map((thread) => {
                        const threadUser = findUserById(thread.userId);
                        const currentVote = thread.votedBy?.[currentUser] || null;
                        const isEditing = editingThreadId === thread.id;
                        const isOwner = thread.userId === currentUser;

                        return (
                            <div
                                key={thread.id}
                                style={styles.threadCard}
                                onClick={() => !isEditing && handleOpenThread(thread.id)}
                            >
                                <div style={styles.threadHeader}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                            style={{...styles.input, fontSize: "1.3rem", fontWeight: "600", flex: "1"}}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <h2 style={styles.threadTitle}>{thread.title}</h2>
                                    )}

                                    {isOwner && (
                                        <div style={styles.buttonsContainer}>
                                            {!isEditing ? (
                                                <>
                                                    {/* FIXED: Using uniformButton base with exact same dimensions as vote buttons */}
                                                    <button
                                                        style={{...styles.uniformButton, ...styles.editButton}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditing(thread);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        style={{...styles.uniformButton, ...styles.deleteButton}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteTarget(thread.id);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>

                                                    <button
                                                        style={{
                                                            ...styles.uniformButton,
                                                            backgroundColor: "#6b7280",
                                                            color: "white"
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cancelEditing();
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        style={{
                                                            ...styles.uniformButton,
                                                            backgroundColor: "#10b981",
                                                            color: "white"
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            saveEdit(thread.id);
                                                        }}
                                                    >
                                                        Save
                                                    </button>

                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}
                                         onClick={(e) => e.stopPropagation()}>
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
                                    </div>
                                ) : (
                                    <>
                                        <p style={styles.threadDescription}>{thread.description}</p>
                                        {thread.image &&
                                            <img src={thread.image} alt="Discussion" style={styles.threadImage}/>
                                        }
                                    </>
                                )}

                                <div style={styles.metadata}>
                                    Posted by <span style={styles.userName}>
                                        {threadUser?.username || threadUser?.email || "Unknown User"}
                                    </span> • {thread.createdAt.toDate ? thread.createdAt.toDate().toLocaleString() : new Date(thread.createdAt).toLocaleString()}
                                </div>

                                {!isEditing && (
                                    <div style={styles.buttonsContainer}>
                                        {/* FIXED: Vote buttons use the same uniformButton dimensions */}
                                        <button
                                            disabled={!currentUser}
                                            style={{
                                                ...styles.uniformButton,
                                                ...styles.upvoteButton,
                                                ...(currentVote === "upvote" ? styles.voteActive : styles.voteInactive)
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(thread, "upvote");
                                            }}
                                        >
                                            👍 {thread.upvotes}
                                        </button>
                                        <button
                                            disabled={!currentUser}
                                            style={{
                                                ...styles.uniformButton,
                                                ...styles.downvoteButton,
                                                ...(currentVote === "downvote" ? styles.voteActive : styles.voteInactive)
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(thread, "downvote");
                                            }}
                                        >
                                            👎 {thread.downvotes}
                                        </button>
                                    </div>
                                )}
                            </div>


                        );
                    })}

                    <div style={{display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem"}}>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            style={styles.primaryButton}
                        >
                            Previous
                        </button>
                        <span style={{alignSelf: "center", fontWeight: "500"}}>
        Page {currentPage} of {totalPages}
    </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={styles.primaryButton}
                        >
                            Next
                        </button>
                    </div>

                </div>

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalBox}>
                            <h3 style={{margin: "0 0 1rem 0", color: "#333"}}>Delete Discussion</h3>
                            <p style={{margin: "0 0 1.5rem 0", color: "#666"}}>
                                Are you sure you want to delete this discussion? This action cannot be undone.
                            </p>
                            <div style={styles.modalButtons}>
                                <button
                                    style={styles.secondaryButton}
                                    onClick={() => setDeleteTarget(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={{...styles.primaryButton, backgroundColor: "#dc3545"}}
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
        </div>
    );
};

export default TestThreads;
