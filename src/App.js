import logo from './logo.svg';
import './App.css';
import TestUsers from "./ui/testPages/TestUsers";
import React from "react";
import Test from "./Test"
import TestCars from "./ui/testPages/TestCars";
import TestThreads from "./ui/testPages/TestThreads";

function App() {
    return (
        <div className="App">
            <TestUsers/>
            <TestCars/>
            <TestThreads/>
        </div>
    );
}

export default App;
