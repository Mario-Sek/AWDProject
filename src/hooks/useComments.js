import {useCallback, useEffect, useState} from "react";
import commentsRepository from "../repository/subcollections/commentsRepository";


const initialState = {
    "comments": [],
    "loading": true
}

const useComments = (threadId) => {

    const [state, setState] = useState(initialState)

    const fetchComments = useCallback(() => {

        setState(initialState)

        const unsubscribe = commentsRepository.findAll(threadId, (comments) => {
            setState({comments, loading: false})
        })

        return unsubscribe
    }, [threadId])

    const onAdd = useCallback((data) => {
        commentsRepository.addComment(threadId, data)
            .then(() => {
                console.log("Added comment")
                fetchComments()
            })
            .catch((error) => {
                console.log(error)
            })
    }, [fetchComments, threadId])

    const onDelete = useCallback((commentId) => {
        commentsRepository.deleteComment(threadId, commentId)
            .then(() => {
                console.log(`Deleted comment id: ${commentId}`)
                fetchComments()
            })
            .catch((error) => {
                console.log(error)
            })
    }, [fetchComments, threadId])

    const onUpdate = useCallback((commentId, data) => {
        commentsRepository.updateComment(threadId, commentId, data)
            .then(() => {
                console.log(`Comment with ${commentId} updated`)
                fetchComments()
            })
            .catch((error) => {
                console.log(error)
            })
    }, [fetchComments, threadId])

    const findById = useCallback((commentId) => {
        return commentsRepository.findById(threadId,commentId)
            .then(()=>{
                console.log("Comment found")
                fetchComments()
            })
            .catch((error)=>{
                console.log(error)
            })
    }, [fetchComments, threadId])

    useEffect(() => {
        const unsubscribe = fetchComments();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchComments])

    return {...state, onAdd: onAdd, onUpdate: onUpdate, onDelete: onDelete, findById: findById}
}

export default useComments