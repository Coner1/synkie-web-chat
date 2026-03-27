import type {ChatMessageType, ChatMetaLastMessage, ChatType} from "~/types/chat";
export type GenderType = 'm' | 'f'| ''
export interface UserBasic {
    id: string;
    name: string;
    avatar?: string;
    gender?: GenderType;
    bio?: string;
    region?: string;
}
export interface User extends UserBasic {
    email?: string;
    isAnonymous: boolean;
    isFTU: boolean;//第一次用户
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    transparency: number;
    pageReactions: boolean;
}


export interface UserChat {
    chatId: string; //if type is site,chatId={siteId}_{pageId}
    name: string;
    avatar: string;
    type: ChatType;
    joinedAt?:number;
    readCount: number;
    pinned?: boolean;
    muted?: boolean;
}
export interface Avatar {
    avatar?: string;
    avatar32?: string;
    avatar64?: string;
    avatar128?: string;
    avatar256?: string;
}
