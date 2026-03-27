import { useState, useCallback } from 'react'
import type { TabType } from '~/types/common'

export interface FloatingBubbleEvent {
    id: string
    type: 'message' | 'reaction' | 'comment'
    content: string
    userName: string
    userAvatar?: string
    roomId?: string
    timestamp: number
}

interface UseFloatingNotificationsProps {
    isTabVisible: boolean
    isSynkieOpen: boolean
    activeTab: TabType
    selectedRoomId?: string
}

export function useFloatingNotifications({
    isTabVisible,
    isSynkieOpen,
    activeTab,
    selectedRoomId,
}: UseFloatingNotificationsProps) {
    const [visible, setVisible] = useState<FloatingBubbleEvent[]>([])

    const addEvent = useCallback((event: FloatingBubbleEvent) => {
        // Only show floating bubbles when the chat panel is closed
        if (isSynkieOpen) return

        setVisible(prev => {
            const next = [...prev, event]
            // Keep max 5 floating bubbles
            return next.slice(-5)
        })

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setVisible(prev => prev.filter(b => b.id !== event.id))
        }, 4000)
    }, [isSynkieOpen])

    const dismiss = useCallback((id: string) => {
        setVisible(prev => prev.filter(b => b.id !== id))
    }, [])

    return { visible, addEvent, dismiss }
}
