import {useCallback, useState, useEffect} from "react";
import carsRepository from "../repository/carsRepository";


const initialState = {
    "cars":[],
    "loading":true
}

const useCars = () => {

    const [state,setState] = useState(initialState)

    const fetchCars = useCallback(()=>{
        setState(initialState)

        carsRepository.findAll()
            .then((response)=>{
                setState({
                        "cars": response,
                        "loading":false
                    }
                )
            })
            .catch((error)=>{
                console.log(error)
            })
    },[])

    const onAdd = useCallback((data)=>{
        carsRepository.addCar(data)
            .then(()=>{
                console.log("Car successfully added")
                fetchCars()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchCars])

    const onDelete = useCallback((id)=>{
        carsRepository.deleteCar(id)
            .then(()=>{
                console.log(`Car with ${id} has been removed`)
                fetchCars()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchCars])


    const onUpdate = useCallback((data,id)=>{
        carsRepository.updateCar(data,id)
            .then(()=>{
                console.log("Car updated")
                fetchCars()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchCars])

    const findById = useCallback((id)=>{
        return state.cars.find(car => car.id === id);
    },[fetchCars])

    useEffect(() => {
        fetchCars()
    }, [fetchCars]);

    return{...state,onAdd:onAdd,onDelete:onDelete,onUpdate:onUpdate,findById:findById}
}

export default useCars