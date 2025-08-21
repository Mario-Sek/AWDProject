import React, {useEffect, useState} from 'react';

import useCars from "../../hooks/useCars";
import useUsers from "../../hooks/useUsers";
import userRepository from "../../repository/userRepository";
import TestLogs from "./TestLogs";


const initialFormData = {
    "make": "",
    "model": "",
    "reg_plate": "",
    "year": "",
    "fuel": "",
    "image": "",
}

const TestCars = () => {

    const {cars, onDelete, onAdd, onUpdate} = useCars()
    const {users, findUserById} = useUsers()
//{userRepository.findById(car.userId)}

    const [formData, setFormData] = useState(initialFormData)

    const handleChange = (event) => {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    //site gi imam staveno da se na isti user, ke smenime koga ke se stavi register/login
    const handleSubmit = () => {
        onAdd({...formData,createdAt: new Date(),userId:"5ZPJnwRf7oHg5aTXvNGS"})
        setFormData(initialFormData)
    }

    return (
        <div>
            <h2>Cars Page</h2>
            <h4>Add a new Car:</h4>
            Make: <input type={"text"} name="make" value={formData.make} onChange={handleChange}/>
             Model: <input type={"text"} name="model" value={formData.model} onChange={handleChange}/>
             Year: <input type={"number"} name="year" value={formData.year} onChange={handleChange}/>
             Registration: <input type={"text"} name="reg_plate" value={formData.reg_plate} onChange={handleChange}/>
             Set Image: <input type={"string"} name="image" value="null" onChange={handleChange}/>
             Select Fuel: <select name="fuel" onChange={handleChange}>
                <option value="">Choose fuel type</option>
                <option value="Diesel">Diesel</option>
                <option value="Gas">Gas</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
            </select>
            <button onClick={handleSubmit}>Add A New Car</button>
            {
                cars.map(car => (
                    <li key={car.id}>
                        {car.make} {car.model} {car.reg_plate} {car.year} Driver:
                        {findUserById(car.userId).name} {findUserById(car.userId).surname}

                        <TestLogs carId={car.id}/>

                        <button onClick={() => onDelete(car.id)}>Delete Car</button>
                    </li>
                ))}
        </div>
    );
};

export default TestCars;