import React, {useEffect, useState} from 'react';

import useCars from "./hooks/useCars";
import useUsers from "./hooks/useUsers";
import userRepository from "./repository/userRepository";

const TestCars = () => {

    const {cars} = useCars()
    const {users, findUserById} = useUsers()
//{userRepository.findById(car.userId)}
    return (
        <div>
            {cars.map(car => (
                <li key={car.id}>
                    {car.make} {car.model} {car.reg_plate} {car.year} Driver:
                </li>
            ))}
        </div>
    );
};

export default TestCars;