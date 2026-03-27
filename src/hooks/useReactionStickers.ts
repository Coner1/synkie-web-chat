import { useState, useEffect, useRef } from 'react'
import type { Comment } from '~/types/comment'
import { subscribeToPageStickers } from '~/services/CommentService'

export function useReactionStickers(
    siteId: string,
    pageId: string,
    enabled: boolean,
) {
    const [reactions, setReactions] = useState<Comment[]>([])
    const [newReactionIds, setNewReactionIds] = useState<Set<string>>(new Set())
    const prevIdsRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!enabled || !pageId) return

        const unsubscribe = subscribeToPageStickers(pageId, (allComments) => {
            const reactionComments = allComments.filter(c => c.type === 'reaction' as any)
            setReactions(reactionComments)

            // Track new reaction IDs for animation
            const currentIds = new Set(reactionComments.map(c => c.id))
            const newIds = new Set<string>()
            currentIds.forEach(id => {
                if (!prevIdsRef.current.has(id)) {
                    newIds.add(id)
                }
            })
            if (newIds.size > 0) {
                setNewReactionIds(prev => {
                    const combined = new Set([...prev, ...newIds])
                    return combined
                })
                // Clear new reaction IDs after animation
                setTimeout(() => {
                    setNewReactionIds(prev => {
                        const next = new Set(prev)
                        newIds.forEach(id => next.delete(id))
                        return next
                    })
                }, 2000)
            }
            prevIdsRef.current = currentIds
        })

        return () => unsubscribe()
    }, [siteId, pageId, enabled])

    return { reactions, newReactionIds }
}
