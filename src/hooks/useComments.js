import { useCallback, useEffect, useState } from "react";
import commentsRepository from "../repository/subcollections/commentsRepository";
import userRepository from "../repository/userRepository";

const initialState = { comments: [], loading: true };

const useComments = (threadId) => {
    const [state, setState] = useState(initialState);

    const fetchComments = useCallback(() => {
        setState(initialState);
        const unsubscribe = commentsRepository.findAll(threadId, (comments) => {
            setState({ comments, loading: false });
        });
        return unsubscribe;
    }, [threadId]);

    const onAdd = useCallback(async (data) => {
        try {
            await commentsRepository.addComment(threadId, data);
            if (data.userId) await userRepository.incrementPointsByUid(data.userId, 1);
            fetchComments();
        } catch (error) {
            console.error(error);
        }
    }, [fetchComments, threadId]);

    const onDelete = useCallback((commentId) => {
        commentsRepository.deleteComment(threadId, commentId)
            .then(fetchComments)
            .catch(console.log);
    }, [fetchComments, threadId]);

    const onUpdate = useCallback((commentId, data) => {
        commentsRepository.updateComment(threadId, commentId, data)
            .then(fetchComments)
            .catch(console.log);
    }, [fetchComments, threadId]);

    useEffect(() => {
        const unsubscribe = fetchComments();
        return () => unsubscribe && unsubscribe();
    }, [fetchComments]);

    return { ...state, onAdd, onUpdate, onDelete };
};

export default useComments;
