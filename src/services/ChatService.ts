import {
    getLocalMessages, saveMessage, editMessage, deleteLocalMessage,
    type LocalMessage
} from './LocalStorage'
import type { ChatMessage, ChatMeta, ChatUserBasic } from '~/types/chat'
import type { User, UserBasic } from '~/types/user'
import { getPageIdFromRawUrl, getSiteIdFromRawUrl } from './utils/sateIdUtil'

function localToChat(m: LocalMessage): ChatMessage {
    return {
        id: m.id,
        content: m.content,
        userId: m.userId,
        userName: m.userName,
        userAvatar: m.userAvatar,
        type: m.type as any,
        createdAt: { seconds: Math.floor(m.createdAt / 1000), nanoseconds: 0 } as any,
        edited: m.edited,
        editedAt: m.editedAt ? { seconds: Math.floor(m.editedAt / 1000), nanoseconds: 0 } as any : undefined,
        file: m.file as any,
        chatId: '',
    }
}

// ── Types matching original ChatService interface ──────────────────────────────

export interface ChatFilePayload {
    file: File
    type: 'image' | 'file' | 'audio' | 'video'
}

export interface SendMessageInput {
    chat: ChatMeta
    user: UserBasic
    content?: string
    type: string
    file?: ChatFilePayload
}

export interface JoinSiteChatInput {
    siteId: string
    pageId: string
    userId: string
    userName: string
    userAvatar?: string
    pageUrl: string
    pageTitle: string
    pageLogoUrl?: string
}

// ── Core API ──────────────────────────────────────────────────────────────────

export async function sendMessage(
    siteId: string,
    pageId: string,
    user: User,
    content: string,
    file?: any,
): Promise<void> {
    saveMessage(pageId, {
        content,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '',
        type: 'text',
        file,
    })
}

export async function sendChatMessage(
    input: SendMessageInput
): Promise<[boolean, string]> {
    try {
        const [siteId, pageId] = input.chat.chatId.split('_')
        const content = input.content ?? ''

        if (input.file) {
            // Convert file to base64 data URL for local storage
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(input.file!.file)
            })

            const msgType = input.type as any
            saveMessage(pageId, {
                content: dataUrl,
                userId: input.user.id,
                userName: input.user.name,
                userAvatar: input.user.avatar || '',
                type: msgType,
                file: {
                    url: dataUrl,
                    name: input.file.file.name,
                    type: input.file.file.type,
                    size: input.file.file.size,
                },
            })
        } else {
            saveMessage(pageId, {
                content,
                userId: input.user.id,
                userName: input.user.name,
                userAvatar: input.user.avatar || '',
                type: input.type as any,
            })
        }
        return [true, '']
    } catch (err: any) {
        return [false, err?.message ?? 'Failed to send message']
    }
}

export async function editChatMessage(
    siteId: string,
    pageId: string,
    messageId: string,
    newContent: string,
): Promise<void> {
    editMessage(pageId, messageId, newContent)
}

export async function deleteMessage(
    siteId: string,
    pageId: string,
    messageId: string,
): Promise<void> {
    deleteLocalMessage(pageId, messageId)
}

export function subscribeToMessages(
    pageId: string,
    onUpdate: (messages: ChatMessage[]) => void,
): () => void {
    // Initial load
    onUpdate(getLocalMessages(pageId).map(localToChat))

    const handler = (e: Event) => {
        const ev = e as CustomEvent
        if (ev.detail?.pageId === pageId) {
            onUpdate(ev.detail.messages.map(localToChat))
        }
    }
    window.addEventListener('synkie:messages', handler)
    return () => window.removeEventListener('synkie:messages', handler)
}

export function subscribeToNewMessages(
    chat: ChatMeta,
    _cursorHead: any,
    onUpdate: (messages: ChatMessage[], lastSnap: any) => void,
): () => void {
    const [_siteId, pageId] = chat.chatId.split('_')

    const handler = (e: Event) => {
        const ev = e as CustomEvent
        if (ev.detail?.pageId === pageId) {
            onUpdate(ev.detail.messages.map(localToChat), null)
        }
    }
    window.addEventListener('synkie:messages', handler)
    return () => window.removeEventListener('synkie:messages', handler)
}

export async function fetchPageChatMessages(input: {
    chat: ChatMeta
    pageSize: number
    order?: 'asc' | 'desc'
    startAfterDoc?: any
}): Promise<{
    messages: ChatMessage[]
    cursorHead: any
    cursorTail: any
    hasMore: boolean
}> {
    const [_siteId, pageId] = input.chat.chatId.split('_')
    const all = getLocalMessages(pageId).map(localToChat)

    return {
        messages: all,
        cursorHead: null,
        cursorTail: null,
        hasMore: false,
    }
}

export async function joinInSiteChat(_input: JoinSiteChatInput): Promise<{ success: boolean; chatId: string }> {
    // No-op in local mode
    return { success: true, chatId: `${_input.siteId}_${_input.pageId}` }
}

export async function joinSiteChat(_siteId: string, _pageId: string, _user: User): Promise<ChatMeta | null> {
    const pageId = getPageIdFromRawUrl(window.location.href)
    return {
        chatId: pageId,
        type: 'site',
        name: document.title,
        avatar: '',
        uCount: 1,
        mCount: getLocalMessages(pageId).length,
        lastMessage: null as any,
        createdAt: null as any,
    }
}

export async function fetchChatUsers(_chat: ChatMeta): Promise<ChatUserBasic[]> {
    return []
}

export function subscribeToChatUsers(
    _chat: ChatMeta,
    _onUpdate: (users: ChatUserBasic[]) => void,
): () => void {
    return () => {}
}

export async function requestFriend(_targetUid: string, _fromSource?: string): Promise<any> {
    // Not available in local mode
    return { success: false, message: 'Friend requests require a backend.' }
}

export async function respondToRequest(_chatId: string, _action: string): Promise<any> {
    return { success: false }
}

export async function fetchLatestSiteChats(_input: any): Promise<any> {
    return { chats: [], cursor: null, hasMore: false }
}

export async function getBasicUser(_userId: string) {
    return null
}
