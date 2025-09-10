import React, {useEffect, useMemo, useState} from "react";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import useUsers from "../../hooks/useUsers";
import useCars from "../../hooks/useCars";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {storage} from "../../config/firebase";
import default_avatar_icon from "../../images/default-avatar-icon.jpg"
import useThreads from "../../hooks/useThreads";
import useComments from "../../hooks/useComments";
import useReplies from "../../hooks/useReplies";
import default_car from "../../images/default-car.png"

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
    const userThreads = threads.filter(t=>t.userId === currentUser?.uid)
    const activeThreads = threads.filter(thread =>
        thread.userId !== currentUser?.uid &&
        thread.comments?.some(c =>
            c.userId === currentUser?.uid || c.replies?.some(r => r.userId === currentUser?.uid)
        )
    );


    // threads--> comments --> replies


    const styles = {
        container: {maxWidth: "1000px", margin: "2rem auto", padding: "0 1rem", fontFamily: "'Inter', sans-serif"},
        profileCard: {
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginBottom: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        },
        input: {
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
            width: "100%",
            marginBottom: "0.75rem"
        },
        select: {
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
            width: "100%",
            marginBottom: "0.75rem"
        },
        button: {
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1d4ed8",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600"
        },
        carGrid: {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem"},
        card: {
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative"
        },
        cardImage: {width: "100%", height: "160px", objectFit: "cover"},
        cardBody: {padding: "1rem"},
        carTitle: {fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.25rem"},
        carInfo: {fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem"},
        deleteButton: {
            padding: "0.3rem 0.6rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            marginTop: "0.5rem"
        }
    };

    if (!currentUser) {
        return <div style={{padding: "2rem", fontSize: "1.2rem"}}>Loading profile...</div>;
    }

    return (
        <div style={styles.container}>
            {/* ===== Profile Section ===== */}
            <div style={styles.profileCard}>
                <h2 style={{textAlign: "center", marginBottom: "1.5rem", color: "#333"}}>My Profile</h2>
                <div style={{display: "flex", gap: "1.5rem"}}>
                    <div style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        border: "2px solid #ccc",
                        overflow: "hidden",
                        cursor: isEditing ? "pointer" : "default"
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
                    <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "0.8rem"}}>
                        {isEditing ? (
                            <>
                                <input name="name" value={editData.name} onChange={handleProfileChange}
                                       placeholder="Name" style={styles.input}/>
                                <input name="surname" value={editData.surname} onChange={handleProfileChange}
                                       placeholder="Surname" style={styles.input}/>
                                <input name="username" value={editData.username} onChange={handleProfileChange}
                                       placeholder="Username" style={styles.input}/>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }}>{currentUser.name} {currentUser.surname}</div>
                                <div style={{color: '#555'}}>Username: {currentUser.username}</div>
                            </>
                        )}
                        <div style={{color: '#555'}}>Email: {currentUser.email}</div>
                        <div style={{color: '#555'}}>Points: {currentUser.points || 0}</div>

                        <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                                {isEditing ? 'Save' : 'Edit Profile'}
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
                                    }}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
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
                padding: "1.5rem",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                marginBottom: "2rem"
            }}>
                <h3 style={{marginBottom: "1rem", fontWeight: "600"}}>Add New Car</h3>

                <select style={styles.select} value={formData.make}
                        onChange={(e) => handleCarChange("make", e.target.value)}>
                    <option value="">Select Make</option>
                    {loadingMakes ? <option>Loading...</option> : makes.map(make => (
                        <option key={make.id} value={make.name}>{make.name}</option>
                    ))}
                </select>

                <select style={styles.select} value={formData.model}
                        onChange={(e) => handleCarChange("model", e.target.value)} disabled={!models.length}>
                    <option value="">Select Model</option>
                    {models.map(model => (
                        <option key={model.name} value={model.name}>{model.name}</option>
                    ))}
                </select>

                <select style={styles.select} value={formData.submodel}
                        onChange={(e) => handleCarChange("submodel", e.target.value)} disabled={!submodels.length}>
                    <option value="">Select Submodel</option>
                    {submodels.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.submodel}</option>
                    ))}
                </select>

                <select style={styles.select} value={formData.trim}
                        onChange={(e) => handleCarChange("trim", e.target.value)} disabled={!trims.length}>
                    <option value="">Select Trim</option>
                    {trims.map(trim => (
                        <option key={trim.id} value={trim.id}>{trim.trim}</option>
                    ))}
                </select>

                <input style={styles.input} name="year" value={formData.year}
                       onChange={(e) => handleCarChange("year", e.target.value)} placeholder="Year"/>
                <input style={styles.input} name="reg_plate" value={formData.reg_plate}
                       onChange={(e) => handleCarChange("reg_plate", e.target.value)} placeholder="Registration Plate"/>
                <input style={styles.input} name="hp" value={formData.hp}
                       onChange={(e) => handleCarChange("hp", e.target.value)} placeholder="Horsepower"/>
                <select
                    style={styles.select}
                    value={formData.fuel}
                    onChange={(e) => handleCarChange("fuel", e.target.value)}
                >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="LPG">LPG</option>
                </select>
                <label>Image</label>
                <input type="file"
                       accept="image/*"
                       onChange={handleImageChange}/>
                {
                    formData.preview && (
                        <img
                            src={profileImagePreview || currentUser.photoURL || default_avatar_icon}
                            alt="preview"
                            style={{maxWidth: "150px", marginTop: "0.5rem"}}/>
                    )
                }
                <button style={styles.button} onClick={handleAddCar}>Add Car</button>
            </div>

            {/* ===== User CarsPage + Logs ===== */}
            <h3>My Cars</h3>
            <div style={styles.carGrid}>
                {userCars.map(car => {
                    const makeName = makes.find(m => String(m.id) === String(car.make))?.name || car.make;

                    return (
                        <div
                            key={car.id}
                            style={{
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "transform 0.3s, box-shadow 0.3s",
                            }}
                            onClick={() => navigate(`/cars/${car.id}`)}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-6px)";
                                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                            }}
                        >

                            {car.image ? (
                                <img
                                    src={car.image}
                                    alt={`${makeName} ${car.model}`}
                                    style={{width: "100%", height: "180px", objectFit: "cover"}}
                                />
                            ) : (
                                /*<div
                                    style={{
                                        width: "100%",
                                        height: "180px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f0f0f0",
                                        color: "#aaa",
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                    }}
                                >*/<img
                                src={default_car}
                                alt={`${makeName} ${car.model}`}
                                style={{width: "100%", height: "180px", objectFit: "cover"}}
                                />

                            )}

                            {/* Card Body */}
                            <div style={{padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem"}}>
                                <div style={{fontSize: "1.2rem", fontWeight: "600"}}>
                                    {makeName} {car.model} ({car.year})
                                </div>
                                <div style={{color: "#555", fontSize: "0.95rem"}}>Plate: {car.reg_plate}</div>
                                <div style={{color: "#555", fontSize: "0.95rem"}}>Fuel: {car.fuel || "N/A"}</div>

                                {/* Buttons */}
                                <div style={{display: "flex", gap: "0.5rem", marginTop: "0.8rem"}}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/cars/${car.id}/edit`);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "0.4rem 0",
                                            borderRadius: "8px",
                                            border: "none",
                                            backgroundColor: "#1d4ed8",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563eb"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1d4ed8"}
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
                                            padding: "0.4rem 0",
                                            borderRadius: "8px",
                                            border: "none",
                                            backgroundColor: "#ef4444",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f87171"}
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
            <h3 style={{marginTop: "2rem"}}>Threads Created by {currentUser.username}</h3>
            <div style={styles.threadGrid}>
                {userThreads.length === 0 ? (
                    <p style={{color: "#555"}}>This user has not created any threads.</p>
                ) : (
                    userThreads.map(thread => (
                        <div key={thread.id} style={styles.threadCard} onClick={() =>  navigate(`/threads/${thread.id}`)}>
                            <h4 style={styles.threadTitle}>{thread.title}</h4>
                            <p style={{color: "#666", fontSize: "0.9rem"}}>{thread.description.slice(0, 100)}...</p>
                        </div>
                    ))
                )}
            </div>

            <h3 style={{marginTop: "2rem"}}>Threads {currentUser.username} is Active In</h3>
            <div style={styles.threadGrid}>
                {activeThreads.length === 0 ? (
                    <p style={{color: "#555"}}>This user is not active in any threads.</p>
                ) : (
                    activeThreads.map(thread => (
                        <div key={thread.id} style={styles.threadCard} onClick={() =>  navigate(`/threads/${thread.id}`)}>
                            <h4 style={styles.threadTitle}>{thread.title}</h4>
                            <p style={{color: "#666", fontSize: "0.9rem"}}>{thread.description.slice(0, 100)}...</p>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};

export default TestUsers;
