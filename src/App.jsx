import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./ui/navbar/Navbar";
import AuthForm from "./ui/authForm/AuthForm";
import TestUsers from "./ui/testPages/TestUsers";
import TestThreads from "./ui/testPages/TestThreads";
import TestCars from "./ui/testPages/TestCars";
import { useAuth } from "./hooks/useAuth";
import CarSelector from "./ui/carSpecs/CarSelector";

function App() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Protected forum route */}
                <Route path="/user" element={user ? <TestUsers /> : <Navigate to="/login" />} />

                <Route path="/threads" element={user ? <TestThreads /> : <Navigate to="/login" />} />

                {/* Login route */}
                <Route path="/login" element={!user ? <AuthForm /> : <Navigate to="/user" />} />

                {/* Optional: redirect / to /forum if logged in */}
                <Route path="/" element={<Navigate to={user ? "/forum" : "/login"} />} />

                {/* car specs route */}
                <Route
                    path="/carspecs"
                    element={user ? <CarSelector /> : <Navigate to="/login" />}
                />


            </Routes>
        </Router>
    );
}

export default App;
