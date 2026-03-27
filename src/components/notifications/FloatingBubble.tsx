import React, { useEffect, useRef } from 'react'
import type { FloatingBubbleEvent } from '~/hooks/useFloatingNotifications'

interface Props {
    bubble: FloatingBubbleEvent
    originX: number
    originY: number
    onClick: () => void
}

export const FloatingBubble: React.FC<Props> = ({ bubble, originX, originY, onClick }) => {
    const offsetY = -80 - Math.random() * 60
    const offsetX = (Math.random() - 0.5) * 80

    return (
        <div
            onClick={onClick}
            style={{
                position: 'fixed',
                left: originX + offsetX,
                top: originY + offsetY,
                zIndex: 9997,
                pointerEvents: 'auto',
                cursor: 'pointer',
                animation: 'synkie-comment-fade 0.3s ease-out',
            }}
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg px-3 py-2 max-w-[200px] border border-gray-100 dark:border-zinc-700 hover:scale-105 transition-transform"
        >
            {bubble.userAvatar ? (
                <img
                    src={bubble.userAvatar}
                    alt={bubble.userName}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
            ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">
                    {bubble.userName}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                    {bubble.content}
                </p>
            </div>
        </div>
    )
}
