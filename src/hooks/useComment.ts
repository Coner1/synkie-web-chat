import { useState, useEffect, useMemo } from 'react';
import type { Comment } from '~/types/comment';
import { subscribeToComments } from "~/services/CommentService";

export const useComments = (siteId: string | null, pageId: string | null) => {
    const [rawComments, setRawComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!siteId || !pageId) return;

        const unsubscribe = subscribeToComments(siteId, pageId, (comments) => {
            setRawComments(comments);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [siteId, pageId]);

    const threadedComments = useMemo(() => {
        if (!rawComments.length) return [];
        const commentMap: Record<string, Comment & { replies: Comment[] }> = {};
        const roots: (Comment & { replies: Comment[] })[] = [];

        // Single Pass: Initialize the Map
        rawComments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        // Second Pass: Build the tree
        rawComments.forEach(comment => {
            const mappedComment = commentMap[comment.id];
            if (comment.parentId && commentMap[comment.parentId]) {
                // It's a reply, push to parent's replies array
                commentMap[comment.parentId].replies.push(mappedComment);
            } else if (comment.parentId === "") {
                // It's a root comment
                roots.push(mappedComment);
            }
        });

        // Final Step: Sort only the root level (Newest first)
        return roots.sort((a, b) => b.createdAt?.seconds || 0 - a.createdAt?.seconds || 0);

    }, [rawComments]);

    return { comments: threadedComments, loading };
};
