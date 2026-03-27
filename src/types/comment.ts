import type {FirestoreTimestamp} from "~/services/utils/datetimeUtils";

export type CommentType = 'normal' | 'complain' | 'reaction';
export interface UploadedFile {
    id: string;
    name: string;
    url: string;
    size: number;
    mime: string;
    storagePath: string;
    uploadedAt: number;
}
export interface Comment {
    id: string;
    siteId: string;
    pageId: string;

    // Threading Strategy:
    // If parentId is null -> It is a top-level comment.
    // If parentId has a value -> It is a reply to that root comment.
    parentId?: string;

    // replyToId/Name: Specific user being replied to (for the "@User" label)
    replyToId?: string;
    replyToName?: string;

    userId: string;
    userName: string;
    userAvatar?: string;

    content: string;
    type: CommentType;

    posX?: number;
    posY?: number;

    // Use createdAt consistently
    createdAt: FirestoreTimestamp;
    edited?: boolean;
    editedAt?: FirestoreTimestamp;

    likes: number;
    likedBy: string[]; // IDs of users who liked this

    labels?: string[];

    images?: UploadedFile[]; // Optional array of images

    deleted?: boolean;
    deletedAt?: FirestoreTimestamp;
    deletedBy?: string;

}
