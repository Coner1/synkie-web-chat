import React, { useState, useEffect } from 'react';
import { UserPlus, MessageCircle, X, Loader2, Clock } from 'lucide-react';
import type { User, UserBasic } from '~/types/user';
import clsx from 'clsx';
import type {ChatMeta, ChatUserBasic, PrivateChatMeta} from "~/types/chat";
import { usePrivateChatMeta } from "~/hooks/usePrivateChatMeta";
import { generatePrivateChatId } from "~/services/utils/sateIdUtil";
import { requestFriend, getBasicUser } from "~/services/ChatService";
import type { ThemeType } from "~/types/common";
import { Avatar } from "~/components/chat/MessageList";

interface UserProfileProps {
    user: UserBasic | ChatUserBasic;
    currentUser: User;
    theme: ThemeType;
    onStartChat: (chatMeta: ChatMeta) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
                                                            user: initialUser,
                                                            currentUser,
                                                            theme,
                                                            onStartChat
                                                        }) => {

    const [user, setUser] = useState<UserBasic>(initialUser as UserBasic);
    const [loadingFullProfile, setLoadingFullProfile] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isDark = theme === "dark";
    const isSelf = user.id === currentUser.id;

    useEffect(() => {
        const fetchFullUserData = async () => {
            if (!isSelf) {
                setLoadingFullProfile(true);
                try {
                    const fullUser = await getBasicUser(initialUser.id);
                    if (fullUser) setUser(fullUser);
                } finally {
                    setLoadingFullProfile(false);
                }
            } else {
                setUser(currentUser);
            }
        };
        fetchFullUserData();
    }, [initialUser.id, isSelf]);

    const chatId = !isSelf ? generatePrivateChatId(user.id, currentUser.id) : null;
    const { meta, loading: metaLoading } = usePrivateChatMeta(chatId);
    const privMeta = meta as unknown as PrivateChatMeta;

    const status = privMeta?.status;
    const isRequester = privMeta?.createdBy === currentUser.id;

    const handleAddFriend = async () => {
        setActionLoading(true);
        try {
            await requestFriend(user.id, "group");
        } finally {
            setActionLoading(false);
        }
    };


    const isLoading = loadingFullProfile || metaLoading;

    const chatUser = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
    } as ChatUserBasic;

    return (
        <div
            className={clsx(
                "flex flex-col h-full overflow-hidden",
                isDark ? "bg-[#1E1E1E] text-white" : "bg-white text-black"
            )}
        >
            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">

                {/* Header */}
                <div className="flex items-center gap-6">
                    <Avatar theme={theme} chatUser={chatUser} size={20} />

                    <div className="flex-1 space-y-1">
                        <h2 className="text-xl font-black tracking-tight">
                            {user.name}
                        </h2>

                        <p className="text-[10px] font-mono opacity-40 uppercase">
                            ID: {user.id.slice(0, 12)}
                        </p>

                        {user.gender && (
                            <div className="mt-1">
                                <span className={clsx(
                                    "px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                                    isDark ? "bg-zinc-700" : "bg-zinc-200"
                                )}>
                                    {user.gender === 'm' ? 'Male' : 'Female'}
                                </span>
                            </div>
                        )}

                        {status === 'accepted' && (
                            <div className="flex gap-2 mt-2">
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase">
                                    Friend
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ml-1">
                        Identity
                    </label>

                    <div className={clsx(
                        "p-4 rounded-xl",
                        isDark ? "bg-white/[0.03]" : "bg-zinc-50"
                    )}>
                        {loadingFullProfile ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="animate-spin opacity-30" size={20} />
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed opacity-70">
                                {user.bio || "No bio set yet."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Region */}
                {!loadingFullProfile && user.region && (
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 ml-1">
                            Region
                        </label>
                        <div className={clsx(
                            "p-4 rounded-xl",
                            isDark ? "bg-white/[0.03]" : "bg-zinc-50"
                        )}>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-50">Location</span>
                                <span className="font-medium">{user.region}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending */}
                {!isSelf && status === 'pending' && (
                    <div className="p-4 rounded-xl bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[var(--primary-color)]">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isRequester ? "Waiting for Response" : "Received Friend Request"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isSelf && (
                <div className={clsx(
                    "p-6 pt-2 border-t",
                    isDark ? "border-white/5" : "border-black/5"
                )}>
                    {isLoading || actionLoading ? (
                        <div className="h-12 flex items-center justify-center opacity-30">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            {status === 'accepted' ? (
                                <button
                                    onClick={() => onStartChat(privMeta)}
                                    className="flex-1 bg-[var(--primary-color)] text-black h-12 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} /> Chat Now
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddFriend}
                                    className={clsx(
                                        "flex-1 h-12 rounded-xl text-sm tracking-widest flex items-center justify-center gap-2",
                                            "bg-[var(--primary-color)] text-white"
                                    )}
                                >
                                    <UserPlus size={18} /> Add Friend
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Avatar Zoom */}
            {isZoomed && user.avatar && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative w-full max-w-sm aspect-square">
                        <img
                            src={user.avatar}
                            className="w-full h-full object-cover rounded-3xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
