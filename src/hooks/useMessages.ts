import { useState, useEffect, useCallback } from 'react'
import {
    subscribeToMessages,
    sendChatMessage,
    fetchPageChatMessages,
    subscribeToNewMessages,
} from '~/services/ChatService'
import type { ChatMessage, ChatMeta } from '~/types/chat'

export const CHAT_MESSAGE_INIT_PAGE_SIZE = 30
export const CHAT_MESSAGE_LOAD_MORE_PAGE_SIZE = 20

export const useMessages = (chat: ChatMeta | null) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [lastUpdateType, setLastUpdateType] = useState<'init' | 'prepend' | 'append' | null>(null)

    useEffect(() => {
        if (!chat?.chatId) {
            setMessages([])
            setLoading(false)
            return
        }

        const [_siteId, pageId] = chat.chatId.split('_')
        setLoading(true)
        setMessages([])

        let unsubscribe: (() => void) | null = null

        const init = async () => {
            try {
                const res = await fetchPageChatMessages({
                    chat,
                    pageSize: CHAT_MESSAGE_INIT_PAGE_SIZE,
                    order: 'desc',
                })

                setMessages(res.messages)
                setHasMore(res.hasMore)
                setLastUpdateType('init')

                // Subscribe to new messages coming in
                unsubscribe = subscribeToNewMessages(chat, res.cursorHead, (addedMessages, _lastSnap) => {
                    setMessages(prev => {
                        const seen = new Set(prev.map(m => m.id))
                        const unique = addedMessages.filter(m => !seen.has(m.id))
                        if (!unique.length) return prev
                        setLastUpdateType('append')
                        return unique.length ? addedMessages : prev
                    })
                })
            } catch (err) {
                console.error('Failed to load messages:', err)
            } finally {
                setLoading(false)
            }
        }

        init()

        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [chat?.chatId, chat?.type])

    const loadMore = useCallback(async () => {
        // In local mode there's no pagination — all messages are loaded at once
        return 0
    }, [])

    return {
        messages,
        loading,
        loadingMore,
        hasMore,
        loadMore,
        lastUpdateType,
    }
}
