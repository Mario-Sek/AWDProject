import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./ui/navbar/Navbar";
import AuthForm from "./ui/authForm/AuthForm";
import TestUsers from "./ui/testPages/TestUsers";
import TestThreads from "./ui/testPages/TestThreads";
import { useAuth } from "./hooks/useAuth";
import CarSelector from "./ui/carSpecs/CarSelector";
import Register from "./ui/registerForm/Register";

function App() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Protected routes */}
                <Route path="/user" element={user ? <TestUsers /> : <Navigate to="/login" />} />
                <Route path="/threads" element={user ? <TestThreads /> : <Navigate to="/login" />} />
                <Route path="/carspecs" element={user ? <CarSelector /> : <Navigate to="/login" />} />

                {/* Auth routes */}
                <Route path="/login" element={!user ? <AuthForm mode="login" /> : <Navigate to="/user" />} />
                <Route path="/register" element={!user ? <Register mode="register" /> : <Navigate to="/user" />} />

                {/* Default route */}
                <Route path="/" element={<Navigate to={user ? "/user" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
