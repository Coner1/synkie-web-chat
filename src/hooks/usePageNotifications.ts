import type { FloatingBubbleEvent } from './useFloatingNotifications'

interface UsePageNotificationsProps {
    currentUserId: string
    enabled: boolean
    onEvent: (event: FloatingBubbleEvent) => void
}

// Stub — no real-time backend in local mode
// In a custom backend, this would subscribe to push notifications or WebSocket events
export function usePageNotifications({
    currentUserId,
    enabled,
    onEvent,
}: UsePageNotificationsProps): void {
    // No-op in local mode
}
