import { useCallback, useState, useEffect } from "react";
import carsRepository from "../repository/carsRepository";

const initialState = {
    cars: [],
    loading: true
};

const useCars = () => {
    const [state, setState] = useState(initialState);

    const fetchCars = useCallback(() => {
        carsRepository.findAll()
            .then((response) => {
                setState({ cars: response, loading: false });
            })
            .catch((error) => console.error("Fetch cars error:", error));
    }, []);

    const onAdd = useCallback((data) => {
        carsRepository.addCar(data)
            .then(() => {
                console.log("Car successfully added");
                fetchCars();
            })
            .catch((error) => console.error("Add car error:", error));
    }, [fetchCars]);

    const onDelete = useCallback((id) => {
        carsRepository.deleteCar(id)
            .then(() => {
                console.log(`Car with ID ${id} has been removed`);
                fetchCars();
            })
            .catch((error) => console.error("Delete car error:", error));
    }, [fetchCars]);

    const onUpdate = useCallback((data, id) => {
        carsRepository.updateCar(data, id)
            .then(() => {
                console.log("Car updated");
                fetchCars();
            })
            .catch((error) => console.error("Update car error:", error));
    }, [fetchCars]);

    const findById = useCallback((id) => state.cars.find(car => car.id === id), [state.cars]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    return {
        ...state,
        onAdd,
        onDelete,
        onUpdate,
        findById
    };
};

export default useCars;
