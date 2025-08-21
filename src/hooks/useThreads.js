import {useCallback, useEffect, useState} from "react";
import threadsRepository from "../repository/threadsRepository";

const initialState = {
    "threads": [],
    "loading": true
}

const useThreads = () => {


    const [state,setState] = useState(initialState)

    const fetchThreads = useCallback(()=>{
        setState(initialState)

        threadsRepository.findAll()
            .then((response)=>{
                setState({
                    "threads":response,
                    "loading":false
                })
            })
            .catch((error)=>{
                console.log(error)
            })
    },[])

    const onAdd = useCallback((data)=>{
        threadsRepository.addThread(data)
            .then(()=>{
                console.log("Added Thread")
                fetchThreads()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchThreads])

    const onDelete = useCallback((id)=>{
        threadsRepository.deleteThread(id)
            .then(()=>{
                fetchThreads()
                console.log("Deleted Thread")
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchThreads])

    const onUpdate = useCallback((threadId,thread)=>{
        threadsRepository.updateThread(threadId,thread)
            .then(()=>{
                fetchThreads()
                console.log(`Updated thread with ID: ${threadId}`)
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchThreads])

    const findById = useCallback((id)=>{
        threadsRepository.findById(id)
            .then(()=>{
                fetchThreads()
                console.log("Thread found")
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchThreads])

    useEffect(() => {
        fetchThreads()
    }, [fetchThreads]);

    return {...state,onAdd:onAdd,onUpdate:onUpdate,onDelete:onDelete,findById:findById}
}

export default useThreads