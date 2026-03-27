import { getLocalUser, saveLocalUser, initLocalUser, type LocalUser } from './LocalStorage'
import type { User, UserPreferences } from '~/types/user'
import type { ThemeType } from '~/types/common'

function localToUser(u: LocalUser): User {
    return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        bio: u.bio,
        gender: u.gender as any,
        region: u.region,
        isFTU: u.isFTU,
        isAnonymous: false,
        preferences: {
            theme: u.preferences.theme as ThemeType,
            transparency: u.preferences.transparency,
            pageReactions: u.preferences.pageReactions,
        },
    }
}

export function getCurrentUser(): User | null {
    const u = getLocalUser()
    return u ? localToUser(u) : null
}

export function initAuth(): Promise<void> {
    initLocalUser()
    return Promise.resolve()
}

export async function updateUserProfile(updates: Partial<User>): Promise<void> {
    const u = getLocalUser()
    if (!u) return
    const merged: LocalUser = {
        ...u,
        name: updates.name ?? u.name,
        avatar: updates.avatar ?? u.avatar,
        bio: updates.bio ?? u.bio,
        gender: (updates.gender as string) ?? u.gender,
        region: updates.region ?? u.region,
        isFTU: updates.isFTU ?? u.isFTU,
        preferences: updates.preferences
            ? {
                theme: (updates.preferences.theme as any) ?? u.preferences.theme,
                transparency: updates.preferences.transparency ?? u.preferences.transparency,
                pageReactions: updates.preferences.pageReactions ?? u.preferences.pageReactions,
            }
            : u.preferences,
    }
    saveLocalUser(merged)
}

export async function uploadAvatar(uid: string, imageDataUrl: string): Promise<string> {
    // In local mode, store the base64 data URL directly
    const u = getLocalUser()
    if (u) saveLocalUser({ ...u, avatar: imageDataUrl })
    return imageDataUrl
}

export async function updateProfileItem(uid: string, updates: Partial<User>): Promise<void> {
    const u = getLocalUser()
    if (!u) return
    const merged: LocalUser = {
        ...u,
        name: updates.name ?? u.name,
        avatar: updates.avatar ?? u.avatar,
        bio: updates.bio ?? u.bio,
        gender: (updates.gender as string) ?? u.gender,
        region: updates.region ?? u.region,
        isFTU: updates.isFTU ?? u.isFTU,
        preferences: updates.preferences
            ? {
                theme: (updates.preferences.theme as any) ?? u.preferences.theme,
                transparency: updates.preferences.transparency ?? u.preferences.transparency,
                pageReactions: updates.preferences.pageReactions ?? u.preferences.pageReactions,
            }
            : u.preferences,
    }
    saveLocalUser(merged)
}

export async function createUserAndCache(userData: Partial<User> & { id: string }): Promise<User> {
    const existing = getLocalUser()
    const u: LocalUser = {
        id: userData.id,
        name: userData.name ?? existing?.name ?? '',
        avatar: userData.avatar ?? existing?.avatar ?? '',
        bio: userData.bio ?? existing?.bio ?? '',
        gender: (userData.gender as string) ?? existing?.gender ?? '',
        region: userData.region ?? existing?.region ?? '',
        isFTU: userData.isFTU ?? existing?.isFTU ?? false,
        preferences: existing?.preferences ?? { theme: 'light', transparency: 100, pageReactions: true },
    }
    saveLocalUser(u)
    return localToUser(u)
}

export function listenUser(_userId: string, cb: (user: User) => void): () => void {
    // Listen to synkie:user events for real-time local updates
    const handler = (e: Event) => {
        const ev = e as CustomEvent
        if (ev.detail) cb(localToUser(ev.detail as LocalUser))
    }
    window.addEventListener('synkie:user', handler)
    // Fire immediately with current user
    const current = getLocalUser()
    if (current) cb(localToUser(current))
    return () => window.removeEventListener('synkie:user', handler)
}

export function stopListening(): void {
    // No-op in local mode
}

export async function updateUserChatReadCount(
    _userId: string,
    _chatId: string,
    _count: number
): Promise<void> {
    // No-op in local mode
}

export const defaultUserPreferences: UserPreferences = {
    theme: 'light',
    transparency: 100,
    pageReactions: true,
}

export const getUserChatsRef = (_uid: string) => null

export async function getBasicUser(_userId: string) {
    return null
}
