import { useState } from 'react';
import type { ChatMeta } from '~/types/chat';
import type { User } from '~/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteChatItem {
    chatMeta: ChatMeta;
    isJoined: boolean;
}

export interface UseSiteChatsReturn {
    items: SiteChatItem[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    refresh: () => void;
    loadMore: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// In local mode, there is no global site discovery — return empty list.
// A custom backend can replace this hook to provide real site chat discovery.

export function useSiteChats(
    _currentUser: User | undefined,
): UseSiteChatsReturn {
    return {
        items: [],
        loading: false,
        loadingMore: false,
        hasMore: false,
        error: null,
        refresh: () => {},
        loadMore: () => {},
    };
}
