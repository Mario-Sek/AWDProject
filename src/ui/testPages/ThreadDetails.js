import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import useThreads from "../../hooks/useThreads";
import useUsers from "../../hooks/useUsers";
import { useAuth } from "../../hooks/useAuth";
import TestComments from "./TestComments";

const ThreadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { threads, onUpdate, onDelete } = useThreads();
    const { findUserById } = useUsers();

    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: "", description: "", image: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const thread = threads.find((t) => t.id === id);
    if (!thread) return <div>Thread not found</div>;

    const threadUser = findUserById(thread.userId);
    const isAuthor = thread.userId === user?.uid;

    const startEditing = () => {
        setIsEditing(true);
        setEditFormData({
            title: thread.title,
            description: thread.description,
            image: thread.image || "",
        });
    };

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
        navigate("/"); // go back to home or threads list
    };

    const styles = {
        container: { maxWidth: "800px", margin: "1rem auto", fontFamily: "Arial, sans-serif" },
        button: {
            padding: "0.35rem 0.75rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginRight: "0.4rem",
        },
        edit: { backgroundColor: "#f59e0b", color: "#fff" },
        delete: { backgroundColor: "#dc3545", color: "#fff" },
        save: { backgroundColor: "#f59e0b", color: "#fff" },
        cancel: { backgroundColor: "#dc3545", color: "#fff" },

        modalOverlay: {
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        modalContent: {
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            width: "320px",
            textAlign: "center",
        }
    };

    return (
        <div style={styles.container}>
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="Thread title"
                        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
                    />
                    <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Thread description"
                        style={{ width: "100%", minHeight: "80px", marginBottom: "0.5rem", padding: "0.5rem" }}
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
                        style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
                    />

                    <div>
                        <button style={{ ...styles.button, ...styles.save }} onClick={saveEdit}>Save</button>
                        <button style={{ ...styles.button, ...styles.cancel }} onClick={cancelEditing}>Cancel</button>
                    </div>
                </>
            ) : (
                <>
                    <h2>{thread.title}</h2>
                    <p>{thread.description}</p>
                    {thread.image && (
                        <img
                            src={thread.image}
                            alt="thread"
                            style={{ maxWidth: "100%", borderRadius: "6px", marginTop: "0.5rem" }}
                        />
                    )}
                    <p>
                        Posted by <b>{threadUser?.username || threadUser?.email || "Unknown"}</b>{" "}
                        on {thread.createdAt.toDate ? thread.createdAt.toDate().toLocaleString() : new Date(thread.createdAt).toLocaleString()}
                    </p>

                    {isAuthor && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <button style={{ ...styles.button, ...styles.edit }} onClick={startEditing}>Edit</button>
                            <button style={{ ...styles.button, ...styles.delete }} onClick={() => setShowDeleteModal(true)}>Delete</button>
                        </div>
                    )}
                </>
            )}

            <h3 style={{ marginTop: "1.5rem" }}>Comments</h3>
            <TestComments threadId={thread.id} findUserById={findUserById} />

            {/* Delete Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <p>Are you sure you want to delete this thread?</p>
                        <div style={{ marginTop: "1rem" }}>
                            <button
                                style={{
                                    ...styles.button,
                                    backgroundColor: "#888", // gray
                                    color: "#fff",           // text color
                                    border: "none"           // optional
                                }}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>

                            <button style={{ ...styles.button, ...styles.delete }} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreadDetails;
