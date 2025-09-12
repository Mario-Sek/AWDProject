import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./ui/navbar/Navbar";
import AuthForm from "./ui/authForm/AuthForm";
import TestUsers from "./ui/testPages/TestUsers";
import TestThreads from "./ui/testPages/TestThreads";
import ThreadDetails from "./ui/testPages/ThreadDetails";
import {useAuth} from "./hooks/useAuth";
import CarSelector from "./ui/carSpecs/CarSelector";
import Register from "./ui/registerForm/Register";
import CarDetailsPage from "./ui/carDetailsPage/CarDetailsPage";
import CarEditPage from "./ui/carDetailsPage/CarEditPage";
import HomePage from "./ui/pages/HomePage/HomePage";
import Footer from "./ui/footer/Footer";
import CarsPage from "./ui/pages/CarsPage/CarsPage";
import UserPage from "./ui/pages/UserPage/UserPage";

function App() {
    const {user, loading} = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/profile" element={user ? <TestUsers/> : <Navigate to="/login"/>}/>
                <Route path="/users/:id" element={user ? <UserPage/> : <Navigate to="/login"/>}/>
                <Route path="/threads" element={user ? <TestThreads/> : <Navigate to="/login"/>}/>
                <Route path="/threads/:id" element={user ? <ThreadDetails/> : <Navigate to="/login"/>}/>
                <Route path="/carspecs" element={<CarSelector/>}/>
                <Route path="/cars" element={<CarsPage/>}/>
                <Route path="/cars/:id" element={<CarDetailsPage/>}/>
                <Route path="/cars/:id/edit" element={user ? <CarEditPage/> : <Navigate to="/login"/>}/>
                <Route path="/" element={<HomePage/>}/>
                {/* Auth routes */}
                <Route path="/login" element={!user ? <AuthForm mode="login"/> : <Navigate to="/profile"/>}/>
                <Route path="/register" element={!user ? <Register mode="register"/> : <Navigate to="/profile"/>}/>

                <Route path="*" element={<Navigate to={user ? "/user" : "/login"}/>}/> {/* Catch-all */}
            </Routes>

            <Footer/>
        </Router>
    );
}

export default App;
