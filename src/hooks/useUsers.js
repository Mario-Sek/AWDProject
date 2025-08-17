import {useCallback, useState, useEffect} from "react";

import userRepository from "../repository/userRepository";

const initialState = {
    "users": [],
    "loading": true // za da ispratam na ui
}

const useUsers = () => {

    const [state, setState] = useState(initialState)

    const fetchUsers = useCallback(() => {
        setState(initialState) //ako preth bilo popolneto

        userRepository.findAll()
            .then((response)=>{
                setState({
                    "users":response,
                    "loading":false
                })
                //console.log(response.data)
            })
            .catch((error)=>{
                console.log(error)
            })
    },[])

    // const findUserById = useCallback((id)=>{
    //     userRepository.findById(id)
    //         .then((data)=>{
    //             console.log(data)
    //             fetchUsers()
    //             return data
    //         })
    //         .catch((error)=>{
    //             console.log(error)
    //         })
    // },[fetchUsers])
    const findUserById = useCallback((id) => {
        return state.users.find(user => user.id === id) || null;
    }, [state.users]);

    const onDelete = useCallback((id)=>{
        userRepository.deleteUser(id)
            .then(()=>{
                console.log(`User deleted with ID: ${id}`)
                fetchUsers()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchUsers])

    const onUpdate = useCallback((id,data)=>{
        userRepository.updateUser(id,data)
            .then(()=>{
                console.log(`User with ID: ${id} updated`)
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchUsers])

    const onAdd = useCallback((data)=>{
        userRepository.addUser(data)
            .then(()=>{
                console.log("User Added")
                fetchUsers()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchUsers])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers]);


    return {...state,onAdd:onAdd,onDelete:onDelete,onUpdate:onUpdate,findUserById:findUserById};
}


export default useUsers
