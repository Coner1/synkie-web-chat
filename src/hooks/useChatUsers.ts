import { useState } from 'react';
import type { ChatMeta, ChatUserBasic } from '~/types/chat';
import type { User } from '~/types/user';

interface UseChatUsersOptions {
    enabled?: boolean;
    realtime?: boolean;
}

interface UseChatUsersResult {
    users: ChatUserBasic[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useChatUsers(
    chat: ChatMeta | null,
    options: UseChatUsersOptions = {}
): UseChatUsersResult {
    // In local mode there are no other users — return empty list
    return {
        users: [],
        loading: false,
        error: null,
        refetch: async () => {},
    }
}

export function useChatUserCount(chat: ChatMeta | null): number {
    return chat?.uCount ?? 0;
}

export function useIsUserInChat(
    chat: ChatMeta | null,
    userId: string | null
): boolean {
    return false;
}
