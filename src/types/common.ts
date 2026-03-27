
export type TabType = 'chat' | 'comments'| 'discover'  | 'settings';
export type ThemeType = 'light' | 'dark';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'


export interface Notification {
    id: string;
    type: 'message' | 'mention' | 'private_chat_request' | 'system';
    title: string;
    body: string;
    roomId?: string;
    userId?: string;
    timestamp: number;
    read: boolean;
}
