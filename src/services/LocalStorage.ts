import { v4 as uuidv4 } from 'uuid'

// ── Keys ─────────────────────────────────────────────────────────────────────
const USER_KEY = 'synkie_user'
const msgs = (pageId: string) => `synkie_msgs_${pageId}`
const comments = (pageId: string) => `synkie_comments_${pageId}`

// ── User ─────────────────────────────────────────────────────────────────────
export interface LocalUser {
    id: string
    name: string
    avatar: string
    bio: string
    gender: string
    region: string
    isFTU: boolean
    preferences: {
        theme: 'light' | 'dark'
        transparency: number
        pageReactions: boolean
    }
}

const DEFAULT_USER: LocalUser = {
    id: uuidv4(),
    name: '',
    avatar: '',
    bio: '',
    gender: '',
    region: '',
    isFTU: true,
    preferences: { theme: 'light', transparency: 100, pageReactions: true },
}

export function getLocalUser(): LocalUser | null {
    try {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}

export function saveLocalUser(user: LocalUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new CustomEvent('synkie:user', { detail: user }))
}

export function initLocalUser(): LocalUser {
    const existing = getLocalUser()
    if (existing) return existing
    const user = { ...DEFAULT_USER, id: uuidv4() }
    saveLocalUser(user)
    return user
}

// ── Messages ──────────────────────────────────────────────────────────────────
export interface LocalMessage {
    id: string
    content: string
    userId: string
    userName: string
    userAvatar: string
    type: 'text' | 'image' | 'audio' | 'system' | 'friendReq'
    createdAt: number
    edited?: boolean
    editedAt?: number
    file?: { url: string; name: string; type: string; size: number }
}

export function getLocalMessages(pageId: string): LocalMessage[] {
    try {
        const raw = localStorage.getItem(msgs(pageId))
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

export function saveMessage(pageId: string, msg: Omit<LocalMessage, 'id' | 'createdAt'>): LocalMessage {
    const messages = getLocalMessages(pageId)
    const newMsg: LocalMessage = { ...msg, id: uuidv4(), createdAt: Date.now() }
    messages.push(newMsg)
    // Keep last 500 messages
    if (messages.length > 500) messages.splice(0, messages.length - 500)
    localStorage.setItem(msgs(pageId), JSON.stringify(messages))
    window.dispatchEvent(new CustomEvent('synkie:messages', { detail: { pageId, messages } }))
    return newMsg
}

export function editMessage(pageId: string, msgId: string, newContent: string): void {
    const messages = getLocalMessages(pageId)
    const idx = messages.findIndex(m => m.id === msgId)
    if (idx === -1) return
    messages[idx] = { ...messages[idx], content: newContent, edited: true, editedAt: Date.now() }
    localStorage.setItem(msgs(pageId), JSON.stringify(messages))
    window.dispatchEvent(new CustomEvent('synkie:messages', { detail: { pageId, messages } }))
}

export function deleteLocalMessage(pageId: string, msgId: string): void {
    const messages = getLocalMessages(pageId)
    const filtered = messages.filter(m => m.id !== msgId)
    localStorage.setItem(msgs(pageId), JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('synkie:messages', { detail: { pageId, messages: filtered } }))
}

// ── Comments ──────────────────────────────────────────────────────────────────
export interface LocalComment {
    id: string
    content: string
    userId: string
    userName: string
    userAvatar: string
    type: 'comment' | 'complain' | 'reaction'
    parentId: string
    posX?: number
    posY?: number
    likes: number
    likedBy: string[]
    createdAt: number
    edited?: boolean
    editedAt?: number
    deleted?: boolean
}

export function getLocalComments(pageId: string): LocalComment[] {
    try {
        const raw = localStorage.getItem(comments(pageId))
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

export function saveComment(pageId: string, c: Omit<LocalComment, 'id' | 'createdAt' | 'likes' | 'likedBy'>): LocalComment {
    const list = getLocalComments(pageId)
    const newC: LocalComment = { ...c, id: uuidv4(), createdAt: Date.now(), likes: 0, likedBy: [] }
    list.push(newC)
    localStorage.setItem(comments(pageId), JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('synkie:comments', { detail: { pageId, comments: list } }))
    return newC
}

export function updateComment(pageId: string, commentId: string, updates: Partial<LocalComment>): void {
    const list = getLocalComments(pageId)
    const idx = list.findIndex(c => c.id === commentId)
    if (idx === -1) return
    list[idx] = { ...list[idx], ...updates }
    localStorage.setItem(comments(pageId), JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('synkie:comments', { detail: { pageId, comments: list } }))
}

export function deleteLocalComment(pageId: string, commentId: string, userId: string, hasReplies: boolean): void {
    const list = getLocalComments(pageId)
    const idx = list.findIndex(c => c.id === commentId)
    if (idx === -1) return
    if (list[idx].userId !== userId) return
    if (hasReplies) {
        list[idx] = { ...list[idx], content: '[Comment deleted]', deleted: true }
    } else {
        list.splice(idx, 1)
    }
    localStorage.setItem(comments(pageId), JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('synkie:comments', { detail: { pageId, comments: list } }))
}
