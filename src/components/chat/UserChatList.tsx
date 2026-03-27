import React, { useState, useMemo, useRef, useCallback } from "react";
import { VList, type VListHandle } from "virtua";
import {Search, X, BellOff, UserIcon, GlobeIcon, Users, Shield} from "lucide-react";
import clsx from "clsx";

import type {User, UserChat} from "~/types/user";
import type { ThemeType } from "~/types/common";
import {type UserChatWithMetaViewModel, useUserChatList} from "~/hooks/useUserChatList";
import { formatRelativeTime, type FirestoreTimestamp } from "~/services/utils/datetimeUtils";
import type {ChatMeta} from "~/types/chat";
import {userIdToAvatarColor} from "~/services/utils/avatarUtils";

interface ChatRoomListProps {
    currentUser: User;
    onSelectChat: (chat: ChatMeta) => void;
    theme: ThemeType;
}

type Row =
    | { kind: "item"; data: UserChatWithMetaViewModel }
    | { kind: "divider"; key: string };

export const UserChatList: React.FC<ChatRoomListProps> = ({currentUser,
                                                              onSelectChat,
                                                              theme,

                                                          }) => {

    const {userChatsWithMeta, loading : userChatsLoading, error: userChatsLoadingError}= useUserChatList(currentUser?.id);
    const isDark = theme === "dark";
    const vListRef = useRef<VListHandle>(null);

    const [searchQuery, setSearchQuery] = useState("");

    const query = searchQuery.toLowerCase().trim();

    // ───────────────────────── Filter Chats
    const filteredRooms = useMemo(() => {

        if (!query) return userChatsWithMeta;

        return userChatsWithMeta.filter((room) => {
            if(!room) return false;
            const name =
                room.chatMeta.name && room.chatMeta.name.length > 0
                    ? room.chatMeta.name
                    : room.userChat.name;

            return name?.toLowerCase().includes(query);
        });

    }, [userChatsWithMeta, query]);

    // ───────────────────────── Rows (for VList)
    const rows = useMemo((): Row[] => {

        const r: Row[] = [];

        filteredRooms.forEach((item, i) => {
            if(!item) return;
            r.push({ kind: "item", data: item });

            if (i < filteredRooms.length - 1) {
                r.push({
                    kind: "divider",
                    key: `div-${item.userChat.chatId}`,
                });
            }
        });

        return r;

    }, [filteredRooms]);

    const colors = {
        bg: isDark ? "bg-[#1E1E1E]" : "bg-white",
        text: isDark ? "text-[#CCCCCC]" : "text-[#333333]",
        border: isDark ? "border-[#2D2D2D]" : "border-[#EEEEEE]",
        input: isDark ? "bg-[#2A2A2A]" : "bg-gray-100",
        subtext: isDark ? 'text-white/40' : 'text-black/40',
    };

    // ───────────────────────── Render
    return (
        <div className={clsx("flex flex-col h-full overflow-hidden mt-2", colors.bg, colors.text)}>
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className={clsx('flex-shrink-0 border-b', colors.border)}>
                {/* Search */}
                <div className="px-3 pb-2">
                    <div className={clsx('flex items-center gap-2 rounded-xl px-3 py-2', colors.input)}>
                        <Search size={13} className={clsx('flex-shrink-0', colors.subtext)} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats…"
                            className="bg-transparent border-none focus:ring-0 text-[12px] w-full outline-none placeholder:opacity-40"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className={clsx(colors.subtext, 'hover:opacity-80')}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">

                {/* Loading */}
                {userChatsLoading && (
                    <div className="p-4 text-center opacity-40 text-sm">
                        Loading chats...
                    </div>
                )}

                {/* Empty */}
                {!userChatsLoading && filteredRooms.length === 0 && (
                    <div className="flex items-center justify-center h-full text-xs opacity-40">
                        No chats found
                    </div>
                )}

                {/* Chat List */}
                {!userChatsLoading && rows.length > 0 && (
                    <VList
                        ref={vListRef}
                        style={{ height: "100%" }}
                    >

                        {rows.map((row) => {

                            if (row.kind === "divider") {
                                return (
                                    <div
                                        key={row.key}
                                        className={clsx("mx-3", isDark ? "bg-white/5" : "bg-black/5")}
                                        style={{ height: 1 }}
                                    />
                                );
                            }

                            return (
                                <ChatItem
                                    key={row.data.userChat.chatId}
                                    room={row.data}
                                    theme={theme}
                                    onSelect={onSelectChat}
                                />
                            );

                        })}

                    </VList>
                )}
            </div>
        </div>
    );
};

// ───────────────────────── Chat Item

const ChatItem = React.memo(function ChatItem({
                                                  room,
                                                  theme,
                                                  onSelect,
                                              }: {
    room: UserChatWithMetaViewModel;
    theme: ThemeType;
    onSelect: (chat: ChatMeta) => void;
}) {

    const isDark = theme === "dark";

    const name =
        room.chatMeta.name && room.chatMeta.name.length > 0
            ? room.chatMeta.name
            : room.userChat.name;

    return (
        <div
            onClick={() => onSelect(room.chatMeta)}
            className={clsx(
                "flex items-center gap-3 px-3 cursor-pointer transition-colors",
                isDark ? "hover:bg-white/5" : "hover:bg-black/5"
            )}
            style={{height: 72}}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div
                    className={clsx(
                        "w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden border",
                        isDark ? "border-white/5 bg-[#333]" : "border-black/5 bg-[#F0F0F0]"
                    )}
                >
                    {resolveChatAvatar(room.chatMeta, room.userChat, theme)}
                </div>

                {room.unreadCount > 0 && room.chatMeta.type !== "site" && (
                    <div
                        className="absolute -top-1.5 -right-1.5 bg-[var(--primary-color)] text-black text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                        {room.unreadCount}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
                <div className="flex items-center gap-1.5">
                    <span
                        className={clsx(
                            "text-[13.5px] font-bold truncate",
                            isDark ? "text-white" : "text-gray-900"
                        )}
                    >
                      {name}
                    </span>
                    {room.chatMeta.type === "site" && (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-[1px] rounded-full shadow-sm">
                                                LIVE
                                            </span>
                    )}
                </div>
                <span className="text-[11px] truncate opacity-50">
                    {room.chatMeta.lastMessage?.userName && (
                  <span className="font-semibold">
                  {room.chatMeta.lastMessage.userName}:{" "}
                </span>
                    )}
                    {room.chatMeta.lastMessage?.content}
                </span>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-1 min-w-[45px]">

        <span className="text-[10px] opacity-40 tabular-nums">
          {formatRelativeTime(
              room.chatMeta.lastMessage?.createdAt as
                  | FirestoreTimestamp
                  | undefined
          )}
        </span>

                {room.userChat.muted && (
                    <BellOff size={14} className="opacity-30"/>
                )}
            </div>
        </div>
    );
});

export function resolveChatAvatar(
    chatMeta: ChatMeta,
    userChat: UserChat,
    theme: ThemeType
) {
    const iconClass = clsx(
        "w-full h-full stroke-current opacity-60",
        theme == "dark" ? "text-white/15" : "text-black/20"
    )

    switch (chatMeta.type) {
        case 'private':
            return chatMeta.avatar ? (
                <img
                    src={chatMeta.avatar}
                    alt={chatMeta.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
            ) : (
                <UserIcon className={iconClass} style={{color: userIdToAvatarColor(chatMeta.chatId, theme)}}/>
            )

        case 'site':
            return (chatMeta.avatar || userChat.avatar) ? (
                <img
                    src={chatMeta.avatar}
                    alt={chatMeta.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
            ) : (
                <GlobeIcon className={iconClass} style={{color: userIdToAvatarColor(chatMeta.chatId, theme)}}/>
            )

        case 'group':
            return <Users className={iconClass} style={{color: userIdToAvatarColor(chatMeta.chatId, theme)}}/>

        case 'system':
            return <Shield className={iconClass} style={{color: userIdToAvatarColor(chatMeta.chatId, theme)}}/>

        default:
            return <UserIcon className={iconClass} style={{color: userIdToAvatarColor(chatMeta.chatId, theme)}}/>
    }
}
