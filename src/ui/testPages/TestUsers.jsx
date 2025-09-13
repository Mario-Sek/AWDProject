import React, {useEffect, useState} from "react";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import useUsers from "../../hooks/useUsers";
import useCars from "../../hooks/useCars";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../config/firebase";
import default_avatar_icon from "../../images/default-avatar-icon.jpg"
import useThreads from "../../hooks/useThreads";
import default_car from "../../images/default-car.png"
import commentsRepository from "../../repository/subcollections/commentsRepository";
import repliesRepository from "../../repository/subcollections/repliesRepository";
import { motion, AnimatePresence } from "framer-motion";


const VERCEL_BASE_URL = "https://carapi-zeta.vercel.app";

const initialForm = {
    make: "",
    model: "",
    submodel: "",
    trim: "",
    year: "",
    reg_plate: "",
    fuel: "",
    image: "",
    preview: "",
    hp: ""
}

const TestUsers = () => {
    const {users, onUpdate, refetch} = useUsers();
    const {cars, onAdd, onDelete} = useCars();
    const {threads} = useThreads()
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({name: "", surname: "", username: ""});

    // ----- Car form state -----
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [submodels, setSubmodels] = useState([]);
    const [trims, setTrims] = useState([]);
    const [loadingMakes, setLoadingMakes] = useState(true);
    const [formData, setFormData] = useState(initialForm);
    const [profileImage, setProfileImage] = useState(currentUser?.photoURL || default_avatar_icon);
    const [previewImage, setPreviewImage] = useState(currentUser?.photoURL || default_avatar_icon);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [newProfileFile, setNewProfileFile] = useState(null);

    const [contributedThreads, setContributedThreads] = useState([]);

    // ----- Load current user -----
    useEffect(() => {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser && users.length > 0) {
            const firestoreUser = users.find(u => u.uid === firebaseUser.uid);
            if (firestoreUser) {
                setCurrentUser(firestoreUser);
                setEditData({
                    name: firestoreUser.name || "",
                    surname: firestoreUser.surname || "",
                    username: firestoreUser.username || ""
                });
            }
            setProfileImage(firestoreUser.photoURL || default_avatar_icon);
        }
    }, [users]);

    useEffect(() => {
        const loadMakes = async () => {
            try {
                setLoadingMakes(true);
                const res = await fetch(`${VERCEL_BASE_URL}/api/makes`);
                const data = await res.json();
                if (Array.isArray(data)) setMakes(data);
                else if (Array.isArray(data.data)) setMakes(data.data);
                else setMakes([]);
            } catch (err) {
                console.error("Error loading makes:", err);
                setMakes([]);
            } finally {
                setLoadingMakes(false);
            }
        };
        loadMakes();
    }, []);

    // ----- Fetch dependent lists -----
    const fetchModels = async (makeId) => {
        if (!makeId) return setModels([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/models?make_id=${makeId}`);
            const data = await res.json();
            setModels(Array.isArray(data) ? data : []);
        } catch {
            setModels([]);
        }
    };

    const fetchSubmodels = async (makeId, modelName) => {
        if (!makeId || !modelName) return setSubmodels([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/submodels?make_id=${makeId}&model=${encodeURIComponent(modelName)}`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [];
            const unique = Array.from(new Set(arr.map(s => s.submodel)))
                .map(sub => arr.find(d => d.submodel === sub));
            setSubmodels(unique);
        } catch {
            setSubmodels([]);
        }
    };

    const fetchTrims = async (submodelId) => {
        if (!submodelId) return setTrims([]);
        try {
            const res = await fetch(`${VERCEL_BASE_URL}/api/trims?submodel_id=${submodelId}`);
            const data = await res.json();
            const arr = Array.isArray(data) ? data : [];
            const unique = Array.from(new Set(arr.map(t => t.trim)))
                .map(trim => arr.find(d => d.trim === trim));
            setTrims(unique);
        } catch {
            setTrims([]);
        }
    };

    // ----- Handlers -----
    const handleProfileChange = (e) => setEditData({...editData, [e.target.name]: e.target.value});

    const handleSaveProfile = async () => {
        const updatedData = {...editData};

        if (newProfileFile) {
            const imageRef = ref(storage, `users/${Date.now()}-${newProfileFile.name}`);
            await uploadBytes(imageRef, newProfileFile);
            const downloadURL = await getDownloadURL(imageRef);
            updatedData.photoURL = downloadURL;
        }

        await onUpdate(currentUser.docId, updatedData);
        setCurrentUser(prev => ({...prev, ...updatedData}));
        setProfileImagePreview(null);
        setNewProfileFile(null);
        setIsEditing(false);
    };

    const handleCarChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        // Reset dependent fields and load new options
        if (field === "make") {
            setModels([]);
            setSubmodels([]);
            setTrims([]);
            fetchModels(value);
        }
        if (field === "model") {
            setSubmodels([]);
            setTrims([]);
            fetchSubmodels(formData.make, value);
        }
        if (field === "submodel") {
            setTrims([]);
            fetchTrims(value);
        }
    };

    const handleAddCar = async () => {
        if (!formData.make || !formData.model || !formData.reg_plate) return;

        let imageUrl = "";

        if (formData.image instanceof File) {
            const imageRef = ref(storage, `cars/${Date.now()}-${formData.image.name}`);
            await uploadBytes(imageRef, formData.image);
            imageUrl = await getDownloadURL(imageRef);
        }
        const auth = getAuth();
        await onAdd({
            ...formData,
            image: imageUrl, //se cuva url, vo fb si vlece od toj storage
            preview: "",
            createdAt: new Date(),
            userId: auth.currentUser.uid
        });

        setFormData(initialForm);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const previewUrl = URL.createObjectURL(file)
            setFormData({...formData, image: file, preview: previewUrl})
        }
    }

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfileImagePreview(URL.createObjectURL(file)) // за preview
        setNewProfileFile(file) // за Save
    };

    const userCars = cars.filter(c => c.userId === currentUser?.uid)
    //za threads
    const userThreads = threads.filter(t => t.userId === currentUser?.uid);

    useEffect(() => {
        const fetchContributions = async () => {
            if (!threads.length || !currentUser) return;

            const result = [];

            for (const thread of threads) {
                if (thread.userId === currentUser.uid) continue; // skip own threads

                // fetch comments
                const comments = await commentsRepository.findAllOnce(thread.id);
                let userContributed = false;

                for (const comment of comments) {
                    if (comment.userId === currentUser.uid) {
                        userContributed = true;
                        break;
                    }

                    // fetch replies for this comment
                    const replies = await repliesRepository.findAllOnce(thread.id, comment.id);
                    if (replies.some(r => {
                        // adjust this depending on your reply object
                        return r.userId === currentUser.uid || r.user?.userId === currentUser.uid;
                    })) {
                        userContributed = true;
                        break;
                    }
                }

                if (userContributed) result.push(thread);
            }

            setContributedThreads(result);
        };

        fetchContributions();
    }, [threads, currentUser]);

    // --- Input/Select base style ---
    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        border: "2px solid #e5e7eb",
        borderRadius: "10px",
        fontSize: "1rem",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        backgroundColor: "#fafbfc",
        outline: "none",
        marginBottom: "1.25rem"
    };

    const handleInputFocus = (e) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.backgroundColor = "white";
        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = "#e5e7eb";
        e.target.style.backgroundColor = "#fafbfc";
        e.target.style.boxShadow = "none";
    };

    const buttonStyle = {
        padding: "0.6rem 1.2rem",
        backgroundColor: "rgb(79, 70, 229)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background-color 0.3s"
    };

    const labelStyle = {
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "#374151", // dark gray
        marginBottom: "0.25rem",
    };


    if (!currentUser) {
        return (
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "1.5rem 1rem",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                backgroundColor: "#fafafa",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{
                    padding: "2rem",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08)",
                    fontSize: "1.2rem",
                    color: "#374151"
                }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: "#fafafa",
            minHeight: "100vh"
        }}>
            {/* ===== Profile Section ===== */}
            <div style={{
                padding: "2rem",
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                border: "1px solid #f1f5f9",
                marginBottom: "2rem"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "2rem",
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#1f2937"
                }}>
                    My Profile
                </h2>

                <div style={{display: "flex", gap: "2rem", alignItems: "flex-start"}}>
                    <div style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        border: "3px solid #e5e7eb",
                        overflow: "hidden",
                        cursor: isEditing ? "pointer" : "default",
                        flexShrink: 0,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                    }}
                         onClick={() => isEditing && document.getElementById("profileImageInput").click()}
                    >
                        <img
                            src={profileImagePreview || currentUser.photoURL || default_avatar_icon}
                            alt="User"
                            style={{width: "100%", height: "100%", objectFit: "cover"}}
                        />
                    </div>

                    <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        style={{display: "none"}}
                        onChange={handleProfileImageChange}
                    />

                    <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem"}}>
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 15 }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                    style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                                >
                                    <div>
                                        <label style={labelStyle}>Name</label>
                                        <input
                                            name="name"
                                            value={editData.name}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your name"
                                            style={inputStyle}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Surname</label>
                                        <input
                                            name="surname"
                                            value={editData.surname}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your surname"
                                            style={inputStyle}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Username</label>
                                        <input
                                            name="username"
                                            value={editData.username}
                                            onChange={handleProfileChange}
                                            placeholder="Enter your username"
                                            style={inputStyle}
                                            onFocus={handleInputFocus}
                                            onBlur={handleInputBlur}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                    style={{
                                        background: "#f8fafc",
                                        padding: "1rem",
                                        borderRadius: "10px"
                                    }}
                                >
                                    <div style={{fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "0.5rem"}}>
                                        {currentUser.name} {currentUser.surname}
                                    </div>
                                    <div style={{color: "#6b7280", fontSize: "1rem"}}>@{currentUser.username}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>


                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "1rem"
                        }}>
                            <div style={{
                                background: "#f8fafc",
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                borderLeft: "3px solid #3b82f6"
                            }}>
                                <div style={{fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>Email</div>
                                <div style={{fontSize: "1rem", color: "#374151", fontWeight: "600", marginTop: "0.25rem"}}>
                                    {currentUser.email}
                                </div>
                            </div>
                            <div style={{
                                background: "#f8fafc",
                                padding: "0.75rem 1rem",
                                borderRadius: "10px",
                                borderLeft: "3px solid #10b981"
                            }}>
                                <div style={{fontSize: "0.875rem", color: "#6b7280", fontWeight: "500"}}>Points</div>
                                <div style={{fontSize: "1rem", color: "#374151", fontWeight: "600", marginTop: "0.25rem"}}>
                                    {currentUser.points || 0}
                                </div>
                            </div>
                        </div>

                        <div style={{marginTop: '1rem', display: 'flex', gap: '0.75rem'}}>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                style={{
                                    ...buttonStyle,
                                    backgroundColor: "#10b981"
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            name: currentUser.name,
                                            surname: currentUser.surname,
                                            username: currentUser.username
                                        });
                                        setProfileImagePreview(null);
                                        setNewProfileFile(null);
                                    }}
                                    style={{
                                        padding: "0.6rem 1.2rem",
                                        backgroundColor: "white",
                                        color: "#374151",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "6px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "1rem",
                                        transition: "all 0.3s"
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                                    onMouseOut={(e) => e.target.style.backgroundColor = "white"}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Add New Car ===== */}
            <div style={{
                padding: "2rem",
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                border: "1px solid #f1f5f9",
                marginBottom: "2rem"
            }}>
                <h3 style={{
                    marginBottom: "2rem",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#1f2937",
                    textAlign: "center"
                }}>
                    Add New Car
                </h3>

                <div style={{
                    display: "grid",
                    gap: "1.25rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    marginBottom: "2rem"
                }}>
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Make
                        </label>
                        <select
                            style={inputStyle}
                            value={formData.make}
                            onChange={(e) => handleCarChange("make", e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select Make</option>
                            {loadingMakes ? <option>Loading...</option> : makes.map(make => (
                                <option key={make.id} value={make.id}>{make.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Model
                        </label>
                        <select
                            style={{
                                ...inputStyle,
                                opacity: !models.length ? 0.6 : 1,
                                cursor: !models.length ? "not-allowed" : "pointer"
                            }}
                            value={formData.model}
                            onChange={(e) => handleCarChange("model", e.target.value)}
                            disabled={!models.length}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select Model</option>
                            {models.map(model => (
                                <option key={model.name} value={model.name}>{model.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Submodel
                        </label>
                        <select
                            style={{
                                ...inputStyle,
                                opacity: !submodels.length ? 0.6 : 1,
                                cursor: !submodels.length ? "not-allowed" : "pointer"
                            }}
                            value={formData.submodel}
                            onChange={(e) => handleCarChange("submodel", e.target.value)}
                            disabled={!submodels.length}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select Submodel</option>
                            {submodels.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.submodel}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Trim
                        </label>
                        <select
                            style={{
                                ...inputStyle,
                                opacity: !trims.length ? 0.6 : 1,
                                cursor: !trims.length ? "not-allowed" : "pointer"
                            }}
                            value={formData.trim}
                            onChange={(e) => handleCarChange("trim", e.target.value)}
                            disabled={!trims.length}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select Trim</option>
                            {trims.map(trim => (
                                <option key={trim.id} value={trim.id}>{trim.trim}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Year
                        </label>
                        <input
                            style={inputStyle}
                            name="year"
                            value={formData.year}
                            onChange={(e) => handleCarChange("year", e.target.value)}
                            placeholder="Enter year"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Registration Plate
                        </label>
                        <input
                            style={inputStyle}
                            name="reg_plate"
                            value={formData.reg_plate}
                            onChange={(e) => handleCarChange("reg_plate", e.target.value)}
                            placeholder="Enter plate number"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Horsepower
                        </label>
                        <input
                            style={inputStyle}
                            name="hp"
                            value={formData.hp}
                            onChange={(e) => handleCarChange("hp", e.target.value)}
                            placeholder="Enter horsepower"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#374151",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Fuel Type
                        </label>
                        <select
                            style={inputStyle}
                            value={formData.fuel}
                            onChange={(e) => handleCarChange("fuel", e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        >
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Electric">Electric</option>
                            <option value="LPG">LPG</option>
                        </select>
                    </div>
                </div>

                <div style={{marginBottom: "2rem"}}>
                    <label style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                    }}>
                        Car Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            width: "100%",
                            padding: "0.875rem 1rem",
                            border: "2px solid #e5e7eb",
                            borderRadius: "10px",
                            fontSize: "1rem",
                            transition: "all 0.2s ease",
                            boxSizing: "border-box",
                            backgroundColor: "#fafbfc"
                        }}
                    />
                    {formData.preview && (
                        <div style={{marginTop: "1rem"}}>
                            <img
                                src={formData.preview || default_car}
                                alt="Car preview"
                                style={{
                                    maxWidth: "200px",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                                }}
                            />
                        </div>
                    )}
                </div>

                <div style={{textAlign: "center"}}>
                    <button
                        style={buttonStyle}
                        onClick={handleAddCar}
                        onMouseOver={(e) => e.target.style.backgroundColor = "rgb(67, 56, 202)"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "rgb(79, 70, 229)"}
                    >
                        Add Car
                    </button>
                </div>
            </div>

            {/* ===== User Cars ===== */}
            <div style={{marginBottom: "2rem"}}>
                <h3 style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "1.5rem",
                    textAlign: "center"
                }}>
                    My Cars
                </h3>

                {userCars.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "4rem 2rem",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            margin: "0 auto 1.5rem",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem"
                        }}>
                            🚗
                        </div>
                        <h4 style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#374151"
                        }}>
                            No cars added yet
                        </h4>
                        <p style={{
                            margin: 0,
                            fontSize: "1rem",
                            color: "#6b7280"
                        }}>
                            Add your first car to start tracking fuel consumption
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem"
                    }}>
                        {userCars.map(car => {
                            const makeName = makes.find(m => String(m.id) === String(car.make))?.name || car.make;

                            return (
                                <div
                                    key={car.id}
                                    style={{
                                        background: "white",
                                        borderRadius: "16px",
                                        boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)",
                                        border: "1px solid #f1f5f9",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() => navigate(`/cars/${car.id}`)}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 12px 20px -4px rgba(0, 0, 0, 0.15)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 5px -1px rgba(0, 0, 0, 0.04)";
                                    }}
                                >
                                    <img
                                        src={car.image || default_car}
                                        alt={`${makeName} ${car.model}`}
                                        style={{width: "100%", height: "180px", objectFit: "cover"}}
                                    />

                                    <div style={{padding: "1.5rem"}}>
                                        <div style={{
                                            fontSize: "1.25rem",
                                            fontWeight: "700",
                                            color: "#1f2937",
                                            marginBottom: "1rem"
                                        }}>
                                            {makeName} {car.model} ({car.year})
                                        </div>

                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                            gap: "0.75rem",
                                            marginBottom: "1.5rem"
                                        }}>
                                            <div style={{
                                                background: "#f8fafc",
                                                padding: "0.5rem 0.75rem",
                                                borderRadius: "8px"
                                            }}>
                                                <div style={{fontSize: "0.75rem", color: "#6b7280", fontWeight: "500"}}>Plate</div>
                                                <div style={{fontSize: "0.875rem", color: "#374151", fontWeight: "600"}}>
                                                    {car.reg_plate}
                                                </div>
                                            </div>
                                            <div style={{
                                                background: "#f8fafc",
                                                padding: "0.5rem 0.75rem",
                                                borderRadius: "8px"
                                            }}>
                                                <div style={{fontSize: "0.75rem", color: "#6b7280", fontWeight: "500"}}>Fuel</div>
                                                <div style={{fontSize: "0.875rem", color: "#374151", fontWeight: "600"}}>
                                                    {car.fuel || "N/A"}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{display: "flex", gap: "0.75rem"}}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/cars/${car.id}/edit`);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: "0.6rem 1rem",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    backgroundColor: "rgb(79, 70, 229)",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "0.875rem",
                                                    fontWeight: "600",
                                                    transition: "all 0.3s",
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgb(67, 56, 202)"}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgb(79, 70, 229)"}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm("Are you sure you want to delete this car?")) {
                                                        onDelete(car.id);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: "0.6rem 1rem",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    backgroundColor: "#ef4444",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "0.875rem",
                                                    fontWeight: "600",
                                                    transition: "all 0.3s",
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dc2626"}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#ef4444"}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== User Threads ===== */}
            <div style={{marginBottom: "2rem"}}>
                <h3 style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "1.5rem",
                    textAlign: "center"
                }}>
                    Threads Created by {currentUser.username}
                </h3>

                {userThreads.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem 2rem",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div style={{
                            width: "70px",
                            height: "70px",
                            margin: "0 auto 1.25rem",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.75rem"
                        }}>
                            💬
                        </div>
                        <h4 style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#374151"
                        }}>
                            No threads created yet
                        </h4>
                        <p style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            color: "#6b7280"
                        }}>
                            This user has not created any threads.
                        </p>
                    </div>
                ) : (
                    <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                        {userThreads.map(thread => (
                            <div
                                key={thread.id}
                                style={{
                                    padding: "1.5rem",
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    border: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onClick={() => navigate(`/threads/${thread.id}`)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 8px 12px -2px rgba(0, 0, 0, 0.15)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <h4 style={{
                                    marginBottom: "0.75rem",
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#1f2937"
                                }}>
                                    {thread.title}
                                </h4>
                                <p style={{
                                    color: "#6b7280",
                                    fontSize: "0.95rem",
                                    margin: 0,
                                    lineHeight: "1.5"
                                }}>
                                    {thread.description.slice(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== Contributed Threads ===== */}
            <div style={{marginBottom: "2rem"}}>
                <h3 style={{
                    fontSize: "1.75rem",
                    fontWeight: "700",
                    color: "#1f2937",
                    marginBottom: "1.5rem",
                    textAlign: "center"
                }}>
                    Threads {currentUser.username} Contributed To
                </h3>

                {contributedThreads.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem 2rem",
                        backgroundColor: "white",
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div style={{
                            width: "70px",
                            height: "70px",
                            margin: "0 auto 1.25rem",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.75rem"
                        }}>
                            📝
                        </div>
                        <h4 style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.125rem",
                            fontWeight: "600",
                            color: "#374151"
                        }}>
                            No contributions yet
                        </h4>
                        <p style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            color: "#6b7280"
                        }}>
                            You have not contributed to any threads.
                        </p>
                    </div>
                ) : (
                    <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                        {contributedThreads.map(thread => (
                            <div
                                key={thread.id}
                                style={{
                                    padding: "1.5rem",
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    border: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onClick={() => navigate(`/threads/${thread.id}`)}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 8px 12px -2px rgba(0, 0, 0, 0.15)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <h4 style={{
                                    marginBottom: "0.75rem",
                                    fontSize: "1.25rem",
                                    fontWeight: "600",
                                    color: "#1f2937"
                                }}>
                                    {thread.title}
                                </h4>
                                <p style={{
                                    color: "#6b7280",
                                    fontSize: "0.95rem",
                                    margin: 0,
                                    lineHeight: "1.5"
                                }}>
                                    {thread.description.slice(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestUsers;
