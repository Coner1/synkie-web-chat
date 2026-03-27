import type {ChatMeta, FriendReqChatMessage, PrivateChatMeta} from "~/types/chat";
import type {ThemeType} from "~/types/common";
import clsx from "clsx";
import {parseFST2date} from "~/services/utils/datetimeUtils";
import {respondToRequest} from "~/services/ChatService";
import React from "react";

interface FriendReqProps {
    message: FriendReqChatMessage;
    currentUserId: string;
    theme: ThemeType;
    chatMeta: ChatMeta;
}
export const FriendRequestCard: React.FC<FriendReqProps> = ({ message, currentUserId, theme, chatMeta }) => {
    const isDark = theme === 'dark';
    const isReceiver = message.reqTo === currentUserId;
    const isRequester = message.reqFrom === currentUserId;
    const isPending = chatMeta.type === 'private' && (chatMeta as PrivateChatMeta).status === 'pending';
    // console.log(isPending, message, currentUserId);
    return (
        <div className="flex flex-col items-center my-4 w-full px-4">
            <div className={clsx(
                "w-full p-3 rounded-xl border transition-all",
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)]">
                        Friend Request
                    </span>
                    <span className="text-[9px] font-bold opacity-30">
                        {parseFST2date(message.createdAt)}
                    </span>
                </div>

                <div className={clsx(
                    "p-2.5 rounded-xl mb-3 text-[13px] leading-snug",
                    isDark ? "bg-white/5 text-zinc-300" : "bg-zinc-50 text-zinc-600"
                )}>
                    {message.content}
                </div>

                {isReceiver && isPending && (
                    <div className="space-y-2">
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => respondToRequest(chatMeta.chatId, 'accepted')}
                                className="flex-1 bg-[var(--primary-color)] text-black h-8 rounded-lg font-black text-[10px] uppercase tracking-wider active:scale-95"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => respondToRequest(chatMeta.chatId, 'declined')}
                                className="px-3 bg-zinc-100 dark:bg-zinc-800 h-8 rounded-lg font-bold text-[10px] uppercase active:scale-95"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                )}

                {isRequester && !isPending && (
                    <div className="text-center py-1">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">
                            Waiting for response
                        </span>
                    </div>
                )}

            </div>
        </div>
    );
};
