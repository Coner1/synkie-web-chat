import React, {useEffect, useMemo, useRef} from 'react'
import {VList, type VListHandle} from "virtua";
import clsx from 'clsx'
import type {ChatMessage, ChatMeta, ChatUserBasic, FriendReqChatMessage} from '~/types/chat'
import type {ThemeType} from "~/types/common";
import type {User, UserBasic} from "~/types/user";
import {type FirestoreTimestamp, parseFST2date, parseFST2hm} from "~/services/utils/datetimeUtils";
import {Loader2, UserIcon} from "lucide-react";
import {useMessages} from "~/hooks/useMessages";
import {FriendRequestCard} from "~/components/chat/messageList/FriendReqCard";
import {updateUserChatReadCount} from "~/services/UserService";
import {MsgAudio} from "~/components/chat/messageList/MsgAudio";
import {userIdToAvatarColor} from "~/services/utils/avatarUtils";

interface Props {
    chatMeta: ChatMeta
    chatUsers?: ChatUserBasic[]
    messages?: ChatMessage[],
    currentUser: User,
    theme: ThemeType,
    hasMore?: boolean,
    loadMore?: () => void,
    lastReadTs?: number,
    onViewProfile: (user: ChatUserBasic) => void;
}


export const MessageList: React.FC<Props> = ({
                                                 chatMeta,
                                                 currentUser,
                                                 chatUsers,
                                                 theme,
                                                 lastReadTs,
                                                 onViewProfile
                                             }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const vListRef = useRef<VListHandle>(null)
    const didInitialScrollRef = useRef(false)
    const loadMoreTimeoutRef = useRef<number | null>(null)
    const isAtTopRef = useRef(false)
    const isAtBottomRef = useRef(true); // Default true so initial messages show at bottom
    const {
        loading,
        loadingMore,
        messages,
        hasMore,
        loadMore,
        lastUpdateType
    } = useMessages(chatMeta)
    const isDark = theme === 'dark'
    const TOP_THRESHOLD = 20
    const BOTTOM_THRESHOLD = 150; // Pixels from bottom to consider "at bottom"

    const chatUserMap = useMemo(() => {
        const map = new Map<string, ChatUserBasic>()
        chatUsers?.forEach(u => map.set(u.id, u))
        return map
    }, [chatUsers])

    // Watch for message changes
    useEffect(() => {
        if (!messages.length || !lastUpdateType) return;
        // console.log("lastUpdateType",lastUpdateType)
        if (lastUpdateType === 'init') {
            if (didInitialScrollRef.current) return
            requestAnimationFrame(() => {
                vListRef.current?.scrollToIndex(messages.length - 1, {
                    align: 'end'
                })
                didInitialScrollRef.current = true
            })
        } else if (lastUpdateType === 'prepend') {
            /* When prepending, most VLists (like virtua) maintain
               scroll position by default.
               If your VList jumps, you may need to call a specific
               method to keep the offset.
            */
        } else if (lastUpdateType === 'append') {
            /* If it's a new message and the user is near the bottom,
               scroll them down. If they are reading history, stay put.
            */
            if (isAtBottomRef.current) {
                vListRef.current?.scrollToIndex(messages.length - 1, {align: 'end'});
            }
        }
    }, [messages.length, lastUpdateType]);
    /* ----------------------------------------
     * Cleanup
     * -------------------------------------- */
    useEffect(() => {
        // console.log("in")
        // console.log("chatMeta.mCount",chatMeta)
        if(chatMeta.type !== "site"){
            updateUserChatReadCount(currentUser.id, chatMeta.chatId, chatMeta.mCount).then().catch(console.error)
        }


        return () => {
            // console.log("out")
            if (loadMoreTimeoutRef.current) {
                clearTimeout(loadMoreTimeoutRef.current)
            }
            if(chatMeta.type !== "site") {
                // console.log("chatMeta.mCount",chatMeta.mCount)
                updateUserChatReadCount(currentUser.id, chatMeta.chatId, chatMeta.mCount).then().catch(console.error)
            }
        }
    }, [])

    const handleScroll = (offset: number) => {
        if (offset <= TOP_THRESHOLD) {
            if (isAtTopRef.current) return

            isAtTopRef.current = true

            loadMoreTimeoutRef.current = window.setTimeout(() => {

                if (!loadingMore && hasMore) {
                    // console.log("loadMore")
                    loadMore().then().catch(console.error)
                }
            }, 200)
        } else {
            isAtTopRef.current = false

            if (loadMoreTimeoutRef.current) {
                clearTimeout(loadMoreTimeoutRef.current)
                loadMoreTimeoutRef.current = null
            }
        }
        const viewportSize = vListRef.current?.viewportSize || 0
        const scrollSize = vListRef.current?.scrollSize || 0
        // // If (scrolled distance + view area) is close to (total height), we are at bottom
        const distanceToBottom = scrollSize - (offset + viewportSize);
        isAtBottomRef.current = distanceToBottom < BOTTOM_THRESHOLD;
        // console.log("distanceToBottom", distanceToBottom, isAtBottomRef.current)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400"/>
            </div>
        )
    }

    return (
        <div ref={parentRef}
             className={clsx(
                 'flex-1 flex flex-col overflow-hidden',
                 isDark ? 'bg-[#191919]' : 'bg-[#F7F7F7]'
             )}
        >
            {/* Floating top loader */}
            {loadingMore && hasMore && (
                <div className="absolute top-2 left-0 right-0 z-10 flex justify-center pointer-events-none">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400"/>
                </div>
            )}
            <VList
                ref={vListRef}
                shift={lastUpdateType === 'prepend'}
                style={{flex: 1}}
                onScroll={handleScroll}
            >
                {messages.map((msg, index) => {
                    const prev = messages[index - 1]
                    const isMine = msg.userId === currentUser.id
                    const isNewDay =
                        !prev ||
                        new Date(prev.createdAt.seconds * 1000).toDateString() !==
                        new Date(msg.createdAt.seconds * 1000).toDateString()

                    const isUnread =
                        lastReadTs &&
                        prev &&
                        prev.createdAt.seconds * 1000 <= lastReadTs &&
                        msg.createdAt.seconds * 1000 > lastReadTs
                    // console.log(lastReadTs, prev?.createdAt?.seconds, msg?.createdAt?.seconds,isUnread)
                    const chatUser = chatUserMap.get(msg.userId) || {
                        id: msg.userId
                    } as ChatUserBasic;
                    return (
                        <div
                            key={msg.id}
                            className="px-4 py-1"
                        >
                            {isNewDay && <DaySeparator fst={msg.createdAt}/>}
                            {isUnread && <UnreadMarker/>}
                            <MessageRow
                                currentUser={currentUser}
                                chatMeta={chatMeta}
                                chatUser={chatUser}
                                message={msg}
                                isMine={isMine}
                                theme={theme}
                                onViewProfile={onViewProfile}
                            />
                        </div>
                    )
                })}
            </VList>
        </div>
    )
}


/* -------- Sub-Components -------- */
interface MessageRowProps {
    currentUser: User,
    message: ChatMessage,
    isMine: boolean,
    chatMeta: ChatMeta,
    theme: ThemeType,
    onViewProfile: (user: ChatUserBasic) => void,
    chatUser: ChatUserBasic
}

const MessageRow = (messageRowProps: MessageRowProps) => {
    const {message, isMine, chatMeta,chatUser, theme, onViewProfile} = messageRowProps
    // console.log("MessageRow1", isMine, chatMeta, chatUser, theme)
    // Handle Friend Request Specialized UI
    if (message.type === 'friendReq') {
        return (
            <FriendRequestCard
                message={message as unknown as FriendReqChatMessage}
                currentUserId={messageRowProps.currentUser.id}
                theme={theme}
                chatMeta={chatMeta}
            />
        );
    }

    // Handle standard System messages (centered, no bubble)
    if (message.userId === 'system' || message.type === 'system') {
        return (
            <div className="flex justify-center my-4 px-10">
                <span
                    className="text-sm text-gray-500 text-center bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }
    // console.log("message", message)
    return (
        <div className={clsx('flex gap-2 items-start', isMine ? 'flex-row-reverse' : 'flex-row')}>
            <Avatar theme={theme} chatUser={chatUser} onViewProfile={onViewProfile}/>

            <div className={clsx('flex flex-col max-w-[75%]', isMine ? 'items-end' : 'items-start')}>
                {chatMeta.type !== "private" && !isMine && (
                    <span className="text-[11px] font-medium text-gray-500 ml-1 mb-1">
                        {chatUser.name || message.userId.slice(0,12)}
                    </span>
                )}

                <div
                    className={clsx(
                        'px-3 py-2 rounded-xl text-base shadow-sm relative group',
                        isMine
                            ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                            : theme === 'dark'
                                ? 'bg-[#2A2A2A] text-gray-100 rounded-tl-none border border-gray-800'
                                : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                    )}
                >
                    <MessageContent message={message}/>

                    <div className={clsx("text-xs text-right opacity-70")}>
                        {parseFST2hm(message.createdAt)}
                    </div>
                </div>
            </div>
        </div>
    )
}

const MessageContent = ({message}: { message: ChatMessage }) => {
    const {content, type, file} = message;
    const mediaUrl = file?.url || content;
    // console.log("MessageContent111",content, type, file);
    switch (type) {
        case 'image':
        case 'gif':
            return (
                <div className="mt-1">
                    <img
                        src={mediaUrl}
                        alt="Media"
                        className="rounded-xl max-w-full max-h-72 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(mediaUrl, '_blank')}
                    />
                </div>
            );

        case 'audio':
            return (
                <MsgAudio message={message}></MsgAudio>
            );

        case 'file':
            return (
                <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-black/5 dark:bg-white/5 rounded-xl no-underline hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <div className="text-[10px] font-black uppercase bg-black/10 dark:bg-white/10 px-1.5 py-1 rounded">
                        {file?.name?.split('.').pop() || 'FILE'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold truncate text-[12px]">{file?.name || 'Attachment'}</span>
                        <span className="text-[9px] opacity-50 uppercase font-bold">
                            {(file?.size ? (file.size / 1024).toFixed(1) : 0)} KB
                        </span>
                    </div>
                </a>
            );

        case 'emoji':
            return <span className="text-3xl leading-none">{content}</span>;
        default: // 'text'
            return <span className="whitespace-pre-wrap break-words leading-relaxed">{content}</span>;
    }
};

export const Avatar = ({
                           theme,
                           chatUser,
                           size = 11,
                           onViewProfile
                       }: {theme:ThemeType, chatUser: ChatUserBasic, size?:number, onViewProfile?: (user: ChatUserBasic) => void; }) => {

    return (
        <div
            className={clsx(" text-base cursor-pointer",`w-${size} h-${size}`,
                "rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border transition-all active:scale-95 ",
                "bg-zinc-100 dark:bg-zinc-800 "
            )}
            onClick={() => onViewProfile && onViewProfile(chatUser)}
        >
            {chatUser.avatar ? (
                <img
                    src={chatUser.avatar}
                    alt={chatUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <UserIcon
                    strokeWidth={2}
                    style={{color: userIdToAvatarColor(chatUser.id, theme)}}
                    className={clsx("w-full h-full object-cover opacity-60")} />
            )}
        </div>
    );
};

const DaySeparator = ({fst}: { fst: FirestoreTimestamp }) => (
    <div className="flex items-center gap-4 my-6">
        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800"/>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {parseFST2date(fst)}
        </span>
        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800"/>
    </div>
)

const UnreadMarker = () => (
    <div className="flex items-center gap-2 my-4">
        <div className="h-[1px] flex-1 bg-red-200"/>
        <span
            className="text-[10px] font-bold text-red-500 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded border border-red-100">
            New Messages
        </span>
        <div className="h-[1px] flex-1 bg-red-200"/>
    </div>
)
