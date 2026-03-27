import { useMemo } from 'react';
import { getChatIdFromRawUrl } from '~/services/utils/sateIdUtil'
import { getCurrentWebsiteTitle, getCurrentWebsiteLogo } from '~/services/utils/websiteUtils'
import { getFirestoreTimestampNow } from '~/services/utils/datetimeUtils'
import type { UserChat } from '~/types/user'
import type { ChatMeta } from '~/types/chat'

export interface UserChatWithMetaViewModel {
    userChat: UserChat
    chatMeta: ChatMeta
    unreadCount: number
}

export const useUserChatList = (_userId: string | undefined) => {
    const chatId = getChatIdFromRawUrl(window.location.href)
    const title = getCurrentWebsiteTitle()
    const logo = getCurrentWebsiteLogo()

    const userChatsWithMeta = useMemo((): UserChatWithMetaViewModel[] => {
        const siteMeta: ChatMeta = {
            chatId,
            type: 'site',
            name: title,
            avatar: logo ?? undefined,
            uCount: 1,
            mCount: 0,
            isLocal: true,
            lastMessage: {
                userName: '',
                content: 'Welcome!',
                type: 'system',
                createdAt: getFirestoreTimestampNow(),
            },
            createdAt: getFirestoreTimestampNow(),
        }
        return [{
            userChat: { chatId, name: title, avatar: logo ?? '', type: 'site', readCount: 0 } as UserChat,
            chatMeta: siteMeta,
            unreadCount: 0,
        }]
    }, [chatId, title, logo])

    return { userChatsWithMeta, loading: false, error: null }
}
