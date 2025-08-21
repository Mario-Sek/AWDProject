import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
    const { user } = useAuth(); // use Firebase Auth directly
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
            <Link to="/user">User</Link>
            <Link to="/threads">Threads</Link>

            {user ? (
                <>
                    <span style={{ marginLeft: "auto" }}>Hi, {user.email}</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <Link to="/login" style={{ marginLeft: "auto" }}>
                    Login
                </Link>
            )}
        </nav>
    );
}
