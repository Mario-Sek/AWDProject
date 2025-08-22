import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import useUsers from "../../hooks/useUsers";
import useCars from "../../hooks/useCars";
import CarLogsDashboard from "../carLogsDashboard/CarLogsDashboard";

const TestUsers = () => {
    const { users, onUpdate } = useUsers();
    const { cars, onAdd, onDelete } = useCars();

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", surname: "", username: "" });
    const [formData, setFormData] = useState({ make: "", model: "", year: "", reg_plate: "", fuel: "", image: "" });

    // Load current user
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
        }
    }, [users]);

    if (!currentUser) return <div style={{ padding: "2rem", fontSize: "1.2rem" }}>Loading profile...</div>;

    // Profile handlers
    const handleChangeProfile = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
    const handleSaveProfile = () => {
        if (!currentUser || !currentUser.docId) return alert("Cannot update profile: Firestore document ID not found");
        onUpdate(currentUser.docId, editData);
        setCurrentUser({ ...currentUser, ...editData });
        setIsEditing(false);
    };

    // Car handlers
    const handleChangeCar = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAddCar = () => {
        if (!formData.make || !formData.model) return;
        onAdd({ ...formData, userId: currentUser.uid, createdAt: new Date() });
        setFormData({ make: "", model: "", year: "", reg_plate: "", fuel: "", image: "" });
    };

    const userCars = cars.filter(c => c.userId === currentUser.uid);

    const styles = {
        container: { maxWidth: "1000px", margin: "2rem auto", padding: "0 1rem", fontFamily: "'Inter', sans-serif" },
        profileCard: { padding: "2rem", border: "1px solid #ccc", borderRadius: "8px", marginBottom: "2rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
        input: { padding: "0.6rem", borderRadius: "8px", border: "1px solid #ddd", width: "100%", marginBottom: "0.75rem" },
        button: { padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", backgroundColor: "#1d4ed8", color: "#fff", cursor: "pointer", fontWeight: "600" },
        carGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" },
        card: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" },
        cardImage: { width: "100%", height: "160px", objectFit: "cover" },
        cardBody: { padding: "1rem" },
        carTitle: { fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.25rem" },
        carInfo: { fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem" },
        deleteButton: { padding: "0.3rem 0.6rem", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#fff", cursor: "pointer", marginTop: "0.5rem" }
    };

    return (
        <div style={styles.container}>
            {/* ===== Profile Section ===== */}
            <div style={styles.profileCard}>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>My Profile</h2>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                    <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1rem", backgroundColor: "#f0f0f0" }}>Photo</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        {isEditing ? (
                            <>
                                <input name="name" value={editData.name} onChange={handleChangeProfile} placeholder="Name" style={styles.input} />
                                <input name="surname" value={editData.surname} onChange={handleChangeProfile} placeholder="Surname" style={styles.input} />
                                <input name="username" value={editData.username} onChange={handleChangeProfile} placeholder="Username" style={styles.input} />
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{currentUser.name} {currentUser.surname}</div>
                                <div style={{ color: '#555' }}>Username: {currentUser.username}</div>
                            </>
                        )}
                        <div style={{ color: '#555' }}>Email: {currentUser.email}</div>
                        <div style={{ color: '#555' }}>Points: {currentUser.points || 0}</div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isEditing ? 'Save' : 'Edit Profile'}
                            </button>
                            {isEditing && (
                                <button onClick={() => { setIsEditing(false); setEditData({ name: currentUser.name, surname: currentUser.surname, username: currentUser.username }); }} style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Add New Car ===== */}
            <div style={{ padding: "1.5rem", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem", fontWeight: "600" }}>Add New Car</h3>
                {["make","model","year","reg_plate","fuel","image"].map(field => (
                    <input key={field} name={field} value={formData[field]} onChange={handleChangeCar} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} style={styles.input} />
                ))}
                <button style={styles.button} onClick={handleAddCar}>Add Car</button>
            </div>

            {/* ===== User Cars + Logs ===== */}
            <h3>My Cars</h3>
            {userCars.length === 0 && <p>No cars added yet.</p>}
            <div style={styles.carGrid}>
                {userCars.map(car => (
                    <div key={car.id} style={styles.card}>
                        {car.image && <img src={car.image} alt={car.make} style={styles.cardImage} />}
                        <div style={styles.cardBody}>
                            <div style={styles.carTitle}>{car.make} {car.model} ({car.year})</div>
                            <div style={styles.carInfo}>Plate: {car.reg_plate} | Fuel: {car.fuel || "N/A"}</div>
                            <button style={styles.deleteButton} onClick={() => onDelete(car.id)}>Delete Car</button>

                            {/* Car Logs Dashboard */}
                            <CarLogsDashboard carId={car.id} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestUsers;
