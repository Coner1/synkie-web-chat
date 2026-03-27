import type {FirestoreTimestamp} from "~/services/utils/datetimeUtils";

export type ChatType = 'private' | 'site' | 'group'| 'system'
export const CHAT_TYPE_META_PREFIX_MAP = {
    private: "p",
    site: "s",
    group: "g",
    system: "m"
};
export type ChatMessageStatus = 'sending' | 'sent' | 'failed'
export type ChatMessageType = 'text' | 'image' | 'file' | 'emoji' | 'system'| 'gif' | 'audio' | 'video' |'friendReq'

export interface ChatMessageBasic {
    id: string;                // Firestore doc id
    userId: string;
    content: string;
    type: ChatMessageType;
    /**
     * createdAt: server timestamp (Firestore)
     * clientTimestamp: local optimistic ordering ONLY
     */
    createdAt: FirestoreTimestamp;         // serverTimestamp (ms)
}

export interface FriendReqChatMessage extends ChatMessageBasic {
    reqFrom: string,
    reqTo: string,
}

export interface ChatMessage extends ChatMessageBasic {

    chatId: string;
    userName?: string;
    userAvatar?: string;
    status?: ChatMessageStatus;    // client-only

    clientTimestamp?: number;  // optimistic ordering

    edited?: boolean;
    editedAt?: number;

    file?: {
        name: string;
        size: number;
        mime: string;
        url: string;
    };

    reactions?: Reaction[];
}


export interface Reaction {
    emoji: string;
    userId: string;
    createdAt?: number;
}
export interface ChatMeta {

    chatId: string;      // `${siteId}_${pageId}` or privateId
    type: ChatType;

    name: string;        // page title / user name / group name
    avatar?: string;

    createdAt: FirestoreTimestamp;
    lastMessage?: ChatMetaLastMessage
    mCount:number; //message count
    uCount:number; //user count
    isLocal?: boolean;
}


export interface ChatMetaLastMessage {
    userName: string
    content: string;
    type: ChatMessageType;
    createdAt: FirestoreTimestamp;
}



export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface PrivateChatMeta extends ChatMeta{
    participants: ChatUserBasic[];
    // Track the status of the relationship
    status: FriendRequestStatus;
    createdBy: string;
    friReq: FriendRequest;
}

export interface FriendRequest {
    intro: string;
    timestamp: string;
    from: string; //how to get u, from group , from qrcode
    userId0:string;
    userName0:string;
    userId1:string;
    userName1:string;
}


export type ChatUserBasicType = 'system' | 'owner' | 'user'
export interface ChatUserBasic {
    id: string;
    name: string;
    avatar?: string;
    type: ChatUserBasicType;
    joinAt: FirestoreTimestamp;
}
