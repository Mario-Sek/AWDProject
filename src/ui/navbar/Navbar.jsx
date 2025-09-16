import {Link, useNavigate} from "react-router-dom";
import {auth} from "../../config/firebase";
import {useAuth} from "../../hooks/useAuth";
import {useEffect, useState} from "react";
import logo from "../../images/logo-tp-novo.png";
import default_avatar from "../../images/default-avatar-icon.jpg"
import useUsers from "../../hooks/useUsers";

export default function Navbar() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [hoveredLink, setHoveredLink] = useState("")
    const {users, refetch} = useUsers()

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    useEffect(() => {
        if (user) {
            refetch()
        }
    }, [users, refetch])

    return (

        <nav style={styles.navbar}>
            <div style={styles.leftSection}>
                <Link to="/">
                    <img src={logo} alt="logo" style={styles.logo}/>
                </Link>
            </div>

            <div style={styles.rightLinks}>
                <Link to="/" style={{
                    ...styles.link,
                    ...(hoveredLink === "/" ? styles.linkHover : {})
                }}
                      onMouseEnter={() => setHoveredLink("/")}
                      onMouseLeave={() => setHoveredLink("")}
                >Home</Link>

                <Link
                    to="/threads"
                    style={{
                        ...styles.link,
                        ...(hoveredLink === "threads" ? styles.linkHover : {})
                    }}
                    onMouseEnter={() => setHoveredLink("threads")}
                    onMouseLeave={() => setHoveredLink("")}
                >
                    Threads
                </Link>


                <Link to="/cars" style={{
                    ...styles.link,
                    ...(hoveredLink === "cars" ? styles.linkHover : {})
                }}
                      onMouseEnter={() => setHoveredLink("cars")}
                      onMouseLeave={() => setHoveredLink("")}
                >See All Cars</Link>

                <Link to="/carspecs" style={{
                    ...styles.link,
                    ...(hoveredLink === "carspecs" ? styles.linkHover : {})
                }}
                      onMouseEnter={() => setHoveredLink("carspecs")}
                      onMouseLeave={() => setHoveredLink("")}
                >Compare Cars</Link>


                {user ? (
                    <>
                        <div
                            style={styles.profileWrapper}
                            onMouseEnter={() => setShowDropdown(true)}
                            onMouseLeave={() => setShowDropdown(false)}
                        >
                            <img
                                src={
                                    users?.length > 0
                                        ? users.find(u => u.uid === auth.currentUser?.uid)?.photoURL || default_avatar
                                        : default_avatar
                                } alt="pp"
                                style={styles.avatar}
                            />
                            {showDropdown && (
                                <div style={styles.dropdown}>
                                    <Link to="/profile" style={styles.dropdownLink}>My Profile</Link>
                                    <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{display: "flex", gap: "1rem"}}>
                        <Link to="/login" style={styles.loginButton}>Login</Link>
                        <Link to="/register" style={{
                            ...styles.loginButton,
                            backgroundColor: "#10b981"
                        }}>
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.3rem 4rem",
        backgroundColor: "#ECECE7",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif",
    },
    leftSection: {
        display: "flex",
        alignItems: "center",
    },
    logo: {
        marginTop: "-3.8rem",
        marginBottom: "-3.8rem",
        marginLeft: "-2rem",
        height: "auto",
        width: "16rem",
        cursor: "pointer"
    },
    rightLinks: {
        display: "flex",
        alignItems: "center",
        gap: "3rem",
    },
    link: {
        color: "#1F2937",
        textDecoration: "none",
        fontWeight: 500,
        fontSize: "17px",
        transition: "color 0.3s, transform 0.2s",
    },
    linkHover: {
        color: "#b8b8be",
    },
    profileWrapper: {
        position: "relative",
        display: "inline-block",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        cursor: "pointer",
        border: "3px solid transparent",
        transition: "border 0.3s",
    },
    dropdown: {
        position: "absolute",
        right: 0,
        top: "49px",
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "8px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: "160px",
        zIndex: 9999,
    },
    dropdownLink: {
        padding: "10px 15px",
        textDecoration: "none",
        color: "#333",
        display: "block",
    },
    logoutButton: {
        padding: "10px 15px",
        background: "none",
        border: "none",
        color: "red",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
    },
    loginButton: {
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        backgroundColor: "#4f46e5",
        color: "#fff",
        textDecoration: "none",
        fontWeight: 600,
        transition: "background 0.3s",
    },
};

