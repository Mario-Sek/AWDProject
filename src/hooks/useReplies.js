import { useCallback, useEffect, useState } from "react";
import repliesRepository from "../repository/subcollections/repliesRepository";

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

    const onAdd = useCallback(
        (data) => repliesRepository.addReply(threadId, commentId, data),
        [threadId, commentId]
    );

    const onUpdate = useCallback(
        (replyId, data) => repliesRepository.updateReply(threadId, commentId, replyId, data),
        [threadId, commentId]
    );

    const onDelete = useCallback(
        (replyId) => repliesRepository.deleteReply(threadId, commentId, replyId),
        [threadId, commentId]
    );

    return { ...state, onAdd, onUpdate, onDelete };
};

export default useReplies;
