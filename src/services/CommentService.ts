import {
    getLocalComments, saveComment, updateComment, deleteLocalComment,
    type LocalComment
} from './LocalStorage'
import type { Comment, UploadedFile } from '~/types/comment'
import type { User } from '~/types/user'

// Matches original CommentService interface
export interface CommentInput {
    siteId: string
    pageId: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    type: string
    parentId?: string
    replyToId?: string
    replyToName?: string
    images?: UploadedFile[]
    posX?: number
    posY?: number
}

export interface UploadProgress {
    fileId: string
    fileName: string
    progress: number
    status: 'uploading' | 'completed' | 'error'
    error?: string
    url?: string
}

function localToComment(c: LocalComment): Comment {
    return {
        id: c.id,
        content: c.content,
        userId: c.userId,
        userName: c.userName,
        userAvatar: c.userAvatar,
        type: c.type as any,
        parentId: c.parentId,
        posX: c.posX,
        posY: c.posY,
        likes: c.likes,
        likedBy: c.likedBy,
        createdAt: { seconds: Math.floor(c.createdAt / 1000), nanoseconds: 0 } as any,
        edited: c.edited,
        editedAt: c.editedAt ? { seconds: Math.floor(c.editedAt / 1000), nanoseconds: 0 } as any : undefined,
        images: [],
        siteId: '',
        pageId: '',
    }
}

export function subscribeToComments(
    _siteId: string,
    pageId: string,
    onUpdate: (comments: Comment[]) => void,
): () => void {
    onUpdate(getLocalComments(pageId).map(localToComment))

    const handler = (e: Event) => {
        const ev = e as CustomEvent
        if (ev.detail?.pageId === pageId) {
            onUpdate(ev.detail.comments.map(localToComment))
        }
    }
    window.addEventListener('synkie:comments', handler)
    return () => window.removeEventListener('synkie:comments', handler)
}

export function subscribeToPageStickers(
    pageId: string,
    onUpdate: (comments: Comment[]) => void,
): () => void {
    onUpdate(getLocalComments(pageId).map(localToComment))

    const handler = (e: Event) => {
        const ev = e as CustomEvent
        if (ev.detail?.pageId === pageId) {
            onUpdate(ev.detail.comments.map(localToComment))
        }
    }
    window.addEventListener('synkie:comments', handler)
    return () => window.removeEventListener('synkie:comments', handler)
}

export async function postComment(
    siteId: string,
    pageId: string,
    input: CommentInput,
): Promise<void> {
    saveComment(pageId, {
        content: input.content,
        userId: input.userId,
        userName: input.userName,
        userAvatar: input.userAvatar || '',
        type: input.type as any,
        parentId: input.parentId || '',
        posX: input.posX,
        posY: input.posY,
        deleted: false,
    })
}

export async function postReaction(
    siteId: string,
    pageId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    emoji: string,
): Promise<void> {
    saveComment(pageId, {
        content: emoji,
        userId,
        userName,
        userAvatar: userAvatar || '',
        type: 'reaction',
        parentId: '',
        posX: 20 + Math.random() * 60,
        posY: 20 + Math.random() * 60,
        deleted: false,
    })
}

export async function editComment(
    siteId: string,
    pageId: string,
    commentId: string,
    newContent: string,
): Promise<void> {
    updateComment(pageId, commentId, { content: newContent, edited: true, editedAt: Date.now() })
}

export async function toggleLikeComment(
    siteId: string,
    pageId: string,
    commentId: string,
    userId: string,
    isCancelLike: boolean,
): Promise<void> {
    const comments = getLocalComments(pageId)
    const c = comments.find(x => x.id === commentId)
    if (!c) return
    const newLikedBy = isCancelLike
        ? c.likedBy.filter(id => id !== userId)
        : [...c.likedBy.filter(id => id !== userId), userId]
    updateComment(pageId, commentId, { likes: newLikedBy.length, likedBy: newLikedBy })
}

export async function toggleLike(
    siteId: string,
    pageId: string,
    commentId: string,
    userId: string,
    isCancelLike: boolean,
): Promise<void> {
    return toggleLikeComment(siteId, pageId, commentId, userId, isCancelLike)
}

export async function deleteComment(
    siteId: string,
    pageId: string,
    commentId: string,
    userId: string,
    hasReplies: boolean,
): Promise<void> {
    deleteLocalComment(pageId, commentId, userId, hasReplies)
}

export async function deleteReaction(
    siteId: string,
    pageId: string,
    commentId: string,
): Promise<void> {
    const comments = getLocalComments(pageId)
    const c = comments.find(x => x.id === commentId)
    if (!c) return
    deleteLocalComment(pageId, commentId, c.userId, false)
}

export async function uploadCommentImage(
    _siteId: string,
    _pageId: string,
    file: File,
): Promise<UploadedFile> {
    const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
    return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name: file.name,
        url,
        size: file.size,
        mime: file.type,
        storagePath: '',
        uploadedAt: Date.now(),
    }
}

export async function uploadCommentImages(
    siteId: string,
    pageId: string,
    files: File[],
    onProgressUpdate?: (progressMap: Record<string, UploadProgress>) => void,
): Promise<UploadedFile[]> {
    const results: UploadedFile[] = []
    for (const file of files) {
        const fileId = Date.now().toString(36) + Math.random().toString(36).slice(2)
        onProgressUpdate?.({ [fileId]: { fileId, fileName: file.name, progress: 0, status: 'uploading' } })
        const uploaded = await uploadCommentImage(siteId, pageId, file)
        onProgressUpdate?.({ [fileId]: { fileId, fileName: file.name, progress: 100, status: 'completed', url: uploaded.url } })
        results.push(uploaded)
    }
    return results
}
