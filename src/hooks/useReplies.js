import { useCallback, useState, useEffect } from "react";
import repliesRepository from "../repository/subcollections/repliesRepository";
import userRepository from "../repository/userRepository";

const useReplies = (threadId, commentId) => {
    const [state, setState] = useState({ replies: [], loading: true });

    const fetchReplies = useCallback(() => {
        return repliesRepository.findAll(threadId, commentId, (replies) => {
            setState({ replies, loading: false });
        });
    }, [threadId, commentId]);

    useEffect(() => {
        const unsubscribe = fetchReplies();
        return () => unsubscribe && unsubscribe();
    }, [fetchReplies]);

    const onAdd = useCallback(async (data) => {
        try {
            await repliesRepository.addReply(threadId, commentId, data);
            if (data.userId) await userRepository.incrementPointsByUid(data.userId, 1);
        } catch (error) {
            console.error(error);
        }
    }, [threadId, commentId]);

    const onUpdate = useCallback((replyId, data) => {
        repliesRepository.updateReply(threadId, commentId, replyId, data)
            .catch(console.log);
    }, [threadId, commentId]);

    const onDelete = useCallback((replyId) => {
        repliesRepository.deleteReply(threadId, commentId, replyId)
            .catch(console.log);
    }, [threadId, commentId]);

    return { ...state, onAdd, onUpdate, onDelete };
};

export default useReplies;
