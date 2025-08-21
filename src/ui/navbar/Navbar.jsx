import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.leftLinks}>
                <Link to="/user" style={styles.link}>User</Link>
                <Link to="/threads" style={styles.link}>Threads</Link>
            </div>

            <div style={styles.rightSection}>
                {user ? (
                    <>
                        <span style={styles.userGreeting}>Hi, {user.email}</span>
                        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" style={{ ...styles.link, ...styles.loginLink }}>Login</Link>
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
        padding: "0.8rem 2rem",
        backgroundColor: "#4f46e5",
        color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
    },
    leftLinks: {
        display: "flex",
        gap: "1.5rem"
    },
    link: {
        color: "#fff",
        textDecoration: "none",
        fontWeight: 500,
        transition: "color 0.2s",
    },
    loginLink: {
        fontWeight: 600,
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        backgroundColor: "#fff",
        color: "#4f46e5",
        textDecoration: "none",
        transition: "all 0.2s",
    },
    rightSection: {
        display: "flex",
        alignItems: "center",
        gap: "1rem"
    },
    userGreeting: {
        fontWeight: 500,
    },
    logoutButton: {
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#f43f5e",
        color: "#fff",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.2s",
    }
};
