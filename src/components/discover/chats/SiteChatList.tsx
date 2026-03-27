import React, { useCallback, useMemo, useRef } from 'react';
import { VList, type VListHandle } from 'virtua';
import {
    Search, X, Globe, Users, TrendingUp, Loader2, WifiOff,
} from 'lucide-react';
import clsx from 'clsx';
import type { ThemeType } from '~/types/common';
import type { ChatMeta } from '~/types/chat';
import type { User } from '~/types/user';
import { type FirestoreTimestamp, formatRelativeTime } from '~/services/utils/datetimeUtils';
import { userIdToAvatarColor } from '~/services/utils/avatarUtils';
import { useSiteChats, type SiteChatItem } from '~/hooks/useSiteChats';

interface SiteChatListProps {
    currentUser: User;
    theme: ThemeType;
    onOpenChat?: (chatMeta: ChatMeta) => void;
}

export const SiteChatList: React.FC<SiteChatListProps> = ({ currentUser, theme, onOpenChat }) => {
    const isDark = theme === 'dark';

    const { items, loading, loadingMore, hasMore, error, refresh, loadMore } =
        useSiteChats(currentUser);
    // console.log("items",items)
    const [searchQuery, setSearchQuery] = React.useState('');
    const vListRef = useRef<VListHandle>(null);

    // ── Search filter ─────────────────────────────────────────────────────────
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter(
            (i) =>
                (i.chatMeta.name || '').toLowerCase().includes(q) ||
                i.chatMeta.chatId.toLowerCase().includes(q) ||
                (i.chatMeta.lastMessage?.content || '').toLowerCase().includes(q),
        );
    }, [items, searchQuery]);

    // Flat row array for VList
    const rows = useMemo((): Row[] => {
        const result: Row[] = [];
        filteredItems.forEach((item, i) => {
            result.push({ kind: 'item', data: item });
            if (i < filteredItems.length - 1) {
                result.push({ kind: 'divider', key: `div-${item.chatMeta.chatId}` });
            }
        });
        if (!searchQuery) result.push({ kind: 'footer' });
        return result;
    }, [filteredItems, searchQuery]);

    // ── Scroll → load more ────────────────────────────────────────────────────
    const handleScroll = useCallback((offset: number) => {
        if (!vListRef.current || searchQuery) return;
        const { scrollSize, viewportSize } = vListRef.current;
        if (
            scrollSize - (offset + viewportSize) < 300 &&
            !loadingMore &&
            hasMore
        ) {
            loadMore()
        }
    }, [loadMore, searchQuery]);

    const handleOpen = useCallback((chatMeta: ChatMeta) => {
        onOpenChat?.(chatMeta);
    }, [onOpenChat]);

    // ── Colors ────────────────────────────────────────────────────────────────
    const colors = {
        bg: isDark ? 'bg-[#1E1E1E]' : 'bg-white',
        text: isDark ? 'text-[#CCCCCC]' : 'text-[#333333]',
        border: isDark ? 'border-[#2D2D2D]' : 'border-[#EEEEEE]',
        input: isDark ? 'bg-[#2A2A2A]' : 'bg-gray-100',
        subtext: isDark ? 'text-white/40' : 'text-black/40',
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={clsx('flex flex-col h-full overflow-hidden mt-2', colors.bg, colors.text)}>

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className={clsx('flex-shrink-0 border-b', colors.border)}>


                {/* Search */}
                <div className="px-3 pb-2">
                    <div className={clsx('flex items-center gap-2 rounded-xl px-3 py-2', colors.input)}>
                        <Search size={13} className={clsx('flex-shrink-0', colors.subtext)} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search site rooms…"
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

            {/* ── Error Banner ─────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border-b border-red-500/20 flex-shrink-0">
                    <WifiOff size={12} className="text-red-400 flex-shrink-0" />
                    <span className="text-[11px] text-red-400 flex-1">{error}</span>
                    <button onClick={refresh} className="text-[10px] text-red-400 font-bold underline">
                        Retry
                    </button>
                </div>
            )}

            {/* ── Body ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden">

                {/* Skeleton */}
                {loading && items.length === 0 && (
                    <div>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonItem key={i} theme={theme} />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 px-6">
                        {searchQuery ? (
                            <>
                                <Search size={32} className="opacity-20" />
                                <p className={clsx('text-[12px] text-center', colors.subtext)}>
                                    No rooms found matching <span className="font-bold">"{searchQuery}"</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <Globe size={32} className="opacity-20" />
                                <p className={clsx('text-[12px] text-center', colors.subtext)}>
                                    No site rooms yet — be the first to explore!
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* VList */}
                {!loading && rows.length > 0 && (
                    <VList
                        ref={vListRef}
                        style={{ height: '100%' }}
                        onScroll={handleScroll}
                    >
                        {rows.map((row) => {
                            if (row.kind === 'item') {
                                return (
                                    <ChatItem
                                        key={row.data.chatMeta.chatId}
                                        item={row.data}
                                        theme={theme}
                                        onOpen={handleOpen}
                                    />
                                );
                            }
                            if (row.kind === 'divider') {
                                return (
                                    <div
                                        key={row.key}
                                        className={clsx('mx-3', isDark ? 'bg-white/5' : 'bg-black/5')}
                                        style={{ height: 1 }}
                                    />
                                );
                            }
                            // footer
                            return (
                                <div key="vlist-footer" className="flex items-center justify-center py-4">
                                    {loadingMore ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin opacity-40" />
                                            <span className={clsx('text-[11px]', colors.subtext)}>Loading more…</span>
                                        </div>
                                    ) : !hasMore && items.length > 0 ? (
                                        <span className={clsx('text-[10px]', colors.subtext)}>
                                            All {items.length} rooms loaded
                                        </span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </VList>
                )}
            </div>
        </div>
    );
};

// ─── Flat row union for VList ─────────────────────────────────────────────────

type Row =
    | { kind: 'item'; data: SiteChatItem }
    | { kind: 'divider'; key: string }
    | { kind: 'footer' };

// ─── Site Avatar ─────────────────────────────────────────────────────────────

function SiteAvatar({ chatMeta, theme }: { chatMeta: ChatMeta; theme: ThemeType }) {
    const color = userIdToAvatarColor(chatMeta.chatId, theme);
    const isDark = theme === 'dark';

    if (chatMeta.avatar) {
        return (
            <img
                src={chatMeta.avatar}
                alt={chatMeta.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
        );
    }
    return (
        <div className={clsx('w-full h-full flex items-center justify-center', isDark ? 'bg-white/5' : 'bg-black/5')}>
            <Globe size={20} style={{ color }} className="opacity-70" />
        </div>
    );
}

// ─── Discover Item ────────────────────────────────────────────────────────────

const ChatItem = (function ChatItem({
                                                          item, theme, onOpen,
                                                      }: {
    item: SiteChatItem;
    theme: ThemeType;
    onOpen: (chatMeta: ChatMeta) => void;
}) {
    const isDark = theme === 'dark';
    const { chatMeta, isJoined } = item;

    const lastMsgPreview = chatMeta.lastMessage?.content
        ? chatMeta.lastMessage.content.length > 44
            ? chatMeta.lastMessage.content.slice(0, 44) + '…'
            : chatMeta.lastMessage.content
        : 'No messages yet';

    const memberCount = chatMeta.uCount ?? 0;
    const msgCount = chatMeta.mCount ?? 0;

    return (
        <div
            className={clsx(
                'flex items-center gap-3 px-3 cursor-pointer select-none transition-colors duration-150',
                isDark
                    ? 'hover:bg-white/[0.04] active:bg-white/[0.07]'
                    : 'hover:bg-black/[0.03] active:bg-black/[0.06]',
            )}
            style={{ height: 72, boxSizing: 'border-box' }}
            onClick={() => onOpen(chatMeta)}
        >
            {/* Avatar */}
            <div
                className={clsx(
                    'relative flex-shrink-0 rounded-xl overflow-hidden border',
                    isDark ? 'border-white/5' : 'border-black/5',
                )}
                style={{ width: 44, height: 44 }}
            >
                <SiteAvatar chatMeta={chatMeta} theme={theme} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                <span className={clsx(
                    'text-[13.5px] font-bold truncate leading-tight',
                    isDark ? 'text-white' : 'text-gray-900',
                )}>
                    {chatMeta.name || chatMeta.chatId}
                </span>

                <span className={clsx(
                    'text-[11px] truncate',
                    isDark ? 'text-white/40' : 'text-black/40',
                )}>
                    {lastMsgPreview}
                </span>

                <div className="flex items-center gap-2.5 mt-[1px]">
                    <span className={clsx('flex items-center gap-0.5 text-[10px]', isDark ? 'text-white/25' : 'text-black/30')}>
                        <Users size={9} />
                        <span>{memberCount > 999 ? `${(memberCount / 1000).toFixed(1)}k` : memberCount}</span>
                    </span>
                    <span className={clsx('flex items-center gap-0.5 text-[10px]', isDark ? 'text-white/25' : 'text-black/30')}>
                        <TrendingUp size={9} />
                        <span>{msgCount > 999 ? `${(msgCount / 1000).toFixed(1)}k` : msgCount} msgs</span>
                    </span>
                    <span className={clsx('text-[10px] ml-auto tabular-nums', isDark ? 'text-white/20' : 'text-black/25')}>
                        {formatRelativeTime(chatMeta.lastMessage?.createdAt as FirestoreTimestamp | undefined)}
                    </span>
                </div>
            </div>
        </div>
    );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonItem({ theme }: { theme: ThemeType }) {
    const pulse = theme === 'dark' ? 'bg-white/8 animate-pulse' : 'bg-black/6 animate-pulse';
    return (
        <div className="flex items-center gap-3 px-3" style={{ height: 72 }}>
            <div className={clsx('w-11 h-11 rounded-xl flex-shrink-0', pulse)} />
            <div className="flex-1 flex flex-col gap-2">
                <div className={clsx('h-3 rounded-full w-2/3', pulse)} />
                <div className={clsx('h-2.5 rounded-full w-full', pulse)} />
                <div className={clsx('h-2 rounded-full w-1/2', pulse)} />
            </div>
            <div className={clsx('w-8 h-8 rounded-full flex-shrink-0', pulse)} />
        </div>
    );
}

export default SiteChatList;
