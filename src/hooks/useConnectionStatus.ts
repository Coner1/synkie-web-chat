import type { ConnectionStatus } from '~/types/common'

export function useConnectionStatus(): { connectionStatus: ConnectionStatus } {
    return { connectionStatus: 'connected' }
}
