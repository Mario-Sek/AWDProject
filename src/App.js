import logo from './logo.svg';
import './App.css';
import HomePage from "./HomePage";
import React from "react";
import Test from "./Test"
import TestCars from "./TestCars";
import CarSelector from "./components/CarSelector";
function App() {
  return (
    <div className="App">
      <CarSelector/>
    </div>
  );
}

export default App;
