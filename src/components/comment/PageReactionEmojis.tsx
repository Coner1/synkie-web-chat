import React, { useEffect, useRef, useState } from 'react'
import type { Comment } from '~/types/comment'
import { deleteReaction } from '~/services/CommentService'

interface Props {
    reactions: Comment[]
    newReactionIds: Set<string>
    currentUserId: string
    siteId: string
    pageId: string
}

interface ReactionState {
    id: string
    content: string
    posX: number
    posY: number
    isMine: boolean
    isNew: boolean
}

export const PageReactionEmojis: React.FC<Props> = ({
    reactions,
    newReactionIds,
    currentUserId,
    siteId,
    pageId,
}) => {
    const handleDelete = async (id: string) => {
        try {
            await deleteReaction(siteId, pageId, id)
        } catch (err) {
            console.error('[Synkie] Failed to delete reaction:', err)
        }
    }

    return (
        <>
            {reactions.map((r) => {
                const posX = (r as any).posX ?? 50
                const posY = (r as any).posY ?? 50
                const isMine = r.userId === currentUserId
                const isNew = newReactionIds.has(r.id)

                return (
                    <div
                        key={r.id}
                        style={{
                            position: 'fixed',
                            left: `${posX}%`,
                            top: `${posY}%`,
                            zIndex: 9990,
                            pointerEvents: isMine ? 'auto' : 'none',
                            animation: isNew ? 'synkie-comment-fade 0.4s ease-out' : undefined,
                            transform: 'translate(-50%, -50%)',
                        }}
                        title={r.userName}
                        onClick={isMine ? () => handleDelete(r.id) : undefined}
                        className={isMine ? 'cursor-pointer hover:scale-125 transition-transform' : ''}
                    >
                        <span
                            style={{
                                fontSize: '28px',
                                lineHeight: 1,
                                userSelect: 'none',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                            }}
                        >
                            {r.content}
                        </span>
                    </div>
                )
            })}
        </>
    )
}
