import React, {useCallback, useEffect, useState} from 'react'
import {MessageInput, type MessageInputFileWrapModel} from './MessageInput'
import { UploadPreviewCard } from './UploadPreviewCard'
import {Avatar, MessageList} from '~/components/chat/MessageList'
import type {ChatMessage, ChatMessageType, ChatMeta, ChatUserBasic} from '~/types/chat'
import type { UserChat, User ,UserBasic} from '~/types/user'
import {type ChatFilePayload, joinInSiteChat, sendChatMessage} from "~/services/ChatService"
import type { ThemeType } from "~/types/common";
import {detectChatMessageType} from "~/services/utils/fileUtils";
import { useChatUsers } from "~/hooks/useChatUsers";
import { Users , Loader2} from 'lucide-react';
import clsx from "clsx";

interface Props {
    chatMeta: ChatMeta
    currentUser: User
    theme: ThemeType
    lastReadTs?: number
    onViewProfile: (user:ChatUserBasic) => void;
}

export const ChatRoom: React.FC<Props> = ({
                                              chatMeta,
                                              currentUser,
                                              theme,
                                              lastReadTs,
                                              onViewProfile
                                          }) => {
    const [initialized, setInitialized] = useState(false)
    const [initError, setInitError] = useState<string | null>(null)
    const [dragging, setDragging] = useState(false)
    const [pendingFile, setPendingFile] = useState<MessageInputFileWrapModel | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [showUserList, setShowUserList] = useState(false)
    // console.log("chatroom32323")
    useEffect(() => {
        let cancelled = false
        const init = async () => {
            try {
                if (chatMeta.type === "site") {
                    const [siteId, pageId] = chatMeta.chatId.split("_")
                    await joinInSiteChat({
                        siteId,
                        pageId,
                        userId: currentUser.id,
                        userName: currentUser.name,
                        userAvatar: currentUser.avatar,
                        pageUrl: window.location.href,
                        pageTitle: document.title,
                        pageLogoUrl: chatMeta.avatar
                    })
                    console.log("joined chat")
                }
                if (!cancelled) {
                    setInitialized(true)
                }
            } catch (e) {
                console.error("Chat init error", e)
                if (!cancelled) {
                    setInitError("Failed to join chat")
                }
            }
        }
        // console.log("chatMeta.isLocal",chatMeta.isLocal)
        init()
        return () => {
            cancelled = true
        }

    }, [chatMeta.chatId])
    // Fetch chat users with real-time updates
    const { users: chatUsers, loading: usersLoading } = useChatUsers(chatMeta, {
        realtime: true,
        enabled: true
    });

    /**
     * Payload builder with stable references
     */
    const getServicePayload = useCallback((type:ChatMessageType, content?: string, file?: File) => {
        const chatUser: UserBasic = {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
        }

        return {
            chat: chatMeta,
            user: chatUser,
            content,
            type: type,
            file: file ? {
                file,
                type: file.type.startsWith('image/') ? 'image' : 'file'
            } as ChatFilePayload : undefined
        }
    }, [chatMeta, currentUser])

    const handleSendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isSending) return

        setIsSending(true)
        try {
            const [success, errorOrId] = await sendChatMessage(getServicePayload("text", content))
            if (!success) {
                console.error("Failed to send message:", errorOrId)
            }
        } catch (err) {
            console.error("Message error:", err)
        } finally {
            setIsSending(false)
        }
    }, [getServicePayload, isSending])

    const handleFileUpload = useCallback(async (fileWrap: MessageInputFileWrapModel) => {
        if (isSending) return

        setIsSending(true)
        try {
            const [success, errorOrId] = await sendChatMessage(getServicePayload(fileWrap.chatMessageType,undefined, fileWrap.file))
            if (!success) alert(errorOrId)
        } catch (err) {
            console.error("Upload error:", err)
        } finally {
            setIsSending(false)
            setPendingFile(null)
        }
    }, [getServicePayload, isSending])

    const isDark = theme === 'dark';
    if (!initialized) {
        return (
            <div className="flex items-center justify-center h-full text-sm opacity-60">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400"/> Loading...
            </div>
        )
    }
    if (initError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 text-sm">
                {initError}
            </div>
        )
    }
    return (
        <div
            className="relative flex flex-col flex-1 overflow-hidden h-full"
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
                e.preventDefault()
                setDragging(false)
                const file = e.dataTransfer.files?.[0]
                if (file) {
                    let chatMessageType = detectChatMessageType(file);
                    setPendingFile({chatMessageType, file})
                }
            }}
        >
            {/* Drag and Drop Visual Feedback */}
            {dragging && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-lg font-medium transition-all">
                    <span className="text-3xl">📂</span>
                    <span>Drop to share in this chat</span>
                </div>
            )}

            {/* User List Sidebar */}
            {showUserList && (
                <div className ={clsx("absolute top-0 right-0 bottom-0 w-64 shadow-lg z-40 overflow-y-auto border-l ",
                    isDark?"bg-gray-900 border-gray-700 ":" bg-white border-gray-200 ")}>
                    <div className={clsx("p-4 border-b flex items-center justify-between",
                        isDark?"border-gray-700 ":"border-gray-200 ")}>
                        <h3 className="font-bold text-sm">
                            Users ({chatUsers.length})
                        </h3>
                        <button
                            onClick={() => setShowUserList(false)}
                            className={clsx(isDark?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-700 ")}
                        >
                            ✕
                        </button>
                    </div>
                    <div className={clsx("divide-y ", isDark?"divide-gray-800":"divide-gray-100 ")}>
                        {chatUsers.map(user => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onViewProfile(user);
                                    setShowUserList(false);
                                }}
                                className={clsx("w-full px-4 py-3 flex items-center gap-3  transition-colors", isDark?"hover:bg-gray-800":"hover:bg-gray-50")}
                            >
                                <div className={clsx("w-10 h-10 rounded-full overflow-hidden flex items-center justify-center", isDark?" bg-gray-700":"bg-gray-200 ")}>
                                    <Avatar theme={theme} chatUser={user} onViewProfile={onViewProfile}/>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className={clsx("font-medium text-sm",isDark?"text-gray-100":" text-gray-900 ")}>
                                        {user.name}
                                    </p>
                                    {user.type === 'system' && (
                                        <p className={clsx("text-xs ", isDark?"text-gray-400":"text-gray-500")}>System</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* User Count Button */}
            {
                chatUsers.length > 2 && (
                    <div className="absolute top-4 right-4 z-30">
                        <button
                            onClick={() => setShowUserList(!showUserList)}
                            className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg
                        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                        border ${isDark ? 'border-gray-700' : 'border-gray-200'}
                        shadow-sm hover:shadow-md transition-all
                    `}
                        >
                            <Users size={16} />
                            <span className="text-sm font-medium">
                        {usersLoading ? '...' : chatUsers.length}
                    </span>
                        </button>
                    </div>
                )
            }


            {/* Main Content Area */}
            <MessageList
                chatMeta={chatMeta}
                currentUser={currentUser}
                chatUsers={chatUsers}
                theme={theme}
                lastReadTs={lastReadTs}
                onViewProfile={onViewProfile}
            />
            <div
                className={clsx('w-full', isDark ? 'bg-white/5' : 'bg-gray-200')}
                style={{ height: 1 }}
            />
            {/* File Upload Stage */}
            {pendingFile && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 dark:bg-gray-900/50">
                    <UploadPreviewCard
                        fileWrap={pendingFile}
                        onCancel={() => setPendingFile(null)}
                        onSend={() => handleFileUpload(pendingFile)}
                    />
                </div>
            )}

            {/* Message Input Bar */}
            <MessageInput
                theme={theme}
                onSendText={handleSendMessage}
                onSendFile={fileWrap => setPendingFile(fileWrap)}
            />
        </div>
    )
}
