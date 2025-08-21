import {useCallback, useEffect, useState} from "react";
import repliesRepository from "../repository/subcollections/repliesRepository";

const initialState = {
    "replies":[],
    "loading":true
}

const useReplies=(threadId,commentId)=>{
    const [state,setState] = useState(initialState)

    const fetchReplies = useCallback(()=>{

        const unsubscribe = repliesRepository.findAll(threadId, commentId, (replies) => {
            setState({ replies, loading: false });
        });

        return unsubscribe;

    },[threadId,commentId])

    const onAdd = useCallback((data)=>{
        repliesRepository.addReply(threadId,commentId,data)
            .then(()=>{
                console.log("Added reply")
                fetchReplies()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchReplies,threadId,commentId])

    const onUpdate = useCallback((replyId,data)=>{
        repliesRepository.updateReply(threadId,commentId,replyId,data)
            .then(()=>{
                console.log("Updated reply")
                fetchReplies()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchReplies,threadId,commentId])

    const onDelete = useCallback((replyId)=>{
        repliesRepository.deleteReply(threadId,commentId,replyId)
            .then(()=>{
                console.log("Deleted reply")
                fetchReplies()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchReplies,threadId,commentId])

    const findById = useCallback((replyId)=>{
        return repliesRepository.findById(threadId,commentId,replyId)
            .then(()=>{
                console.log("Reply found")
                fetchReplies()
            })
            .catch((error)=>{
                console.log(error)
            })
    },[fetchReplies,threadId,commentId])

    useEffect(() => {
        const unsubscribe = fetchReplies();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchReplies]);

    return {...state, onAdd: onAdd, onUpdate: onUpdate, onDelete: onDelete, findById: findById}
}

export default useReplies