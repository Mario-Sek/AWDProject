import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {getAuth} from "firebase/auth";
import useUsers from "../../../hooks/useUsers";
import useCars from "../../../hooks/useCars";
import useThreads from "../../../hooks/useThreads";
import default_avatar_icon from "../../../images/default-avatar-icon.jpg";
import default_car from "../../../images/default-car.png";
import {useAuth} from "../../../hooks/useAuth";

const UserPage = () => {
    const {id} = useParams();
    const {users, onUpdate} = useUsers();
    const {cars, onAdd, onDelete} = useCars();
    const {threads} = useThreads();
    const navigate = useNavigate();
    const {user} = useAuth()

    const [currentUser, setCurrentUser] = useState(null);
    const [viewedUser, setViewedUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        setCurrentUser(auth.currentUser || null);
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            const found = users.find(u => u.uid === id);
            setViewedUser(found || null);
        }
    }, [id, users]);

    if (!viewedUser) {
        return <div style={{padding: "2rem"}}>Loading user...</div>;
    }

    const isOwner = currentUser?.uid === viewedUser.uid;
    const userCars = cars.filter(c => c.userId === viewedUser.uid);
    const userThreads = threads.filter(t => t.userId === viewedUser.uid);

    if(isOwner){
        navigate("/profile")
    }

    return (
        <div style={{maxWidth: "900px", margin: "2rem auto", padding: "1rem"}}>
            <div style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                <img
                    src={viewedUser.photoURL || default_avatar_icon}
                    alt="User"
                    style={{width: "120px", height: "120px", borderRadius: "50%"}}
                />
                <div>
                    <h2>{viewedUser.name} {viewedUser.surname}</h2>
                    <p>Username: {viewedUser.username}</p>
                    <p>Email: {viewedUser.email}</p>
                    <p>Points: {viewedUser.points || 0}</p>
                    {isOwner && (
                        <button onClick={() => navigate("/profile/edit")}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <h3 style={{marginTop: "2rem"}}>Cars</h3>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem"}}>
                {userCars.length === 0 ? (
                    <p>No cars.</p>
                ) : (
                    userCars.map(car => (

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
                                    alt={`${car.make} ${car.model}`}
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
                                    alt={`${car.make} ${car.model}`}
                                    style={{width: "100%", height: "180px", objectFit: "cover"}}
                                />

                            )}

                            {/* Card Body */}
                            <div style={{padding: "1rem", display: "flex", flexDirection: "column", gap: "0.3rem"}}>
                                <div style={{fontSize: "1.2rem", fontWeight: "600"}}>
                                    {car.make} {car.model} ({car.year})
                                </div>
                                <div style={{color: "#555", fontSize: "0.95rem"}}>Plate: {car.reg_plate}</div>
                                <div style={{color: "#555", fontSize: "0.95rem"}}>Fuel: {car.fuel || "N/A"}</div>


                                {user.uid === viewedUser.uid ?
                                    (<div style={{display: "flex", gap: "0.5rem", marginTop: "0.8rem"}}>
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
                                    </div>) : ""}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <h3 style={{marginTop: "2rem"}}>Threads</h3>
            {userThreads.length === 0 ? (
                <p>No threads.</p>
            ) : (
                userThreads.map(t => (
                    <div key={t.id} onClick={() => navigate(`/threads/${t.id}`)}>
                        <h4>{t.title}</h4>
                        <p>{t.description}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserPage;
