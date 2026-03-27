import type {ChatMessageType} from "~/types/chat";

export function getFileExtension(file: File): string {
    if (file.type) {
        const map: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
            'audio/ogg': 'ogg',
            'video/mp4': 'mp4',
            'application/pdf': 'pdf',
        };

        if (map[file.type]) {
            return map[file.type];
        }
    }

    const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
}


export function detectChatMessageType(file: File): ChatMessageType {
    const mime = file.type;
    const name = file.name.toLowerCase();
    if (mime.startsWith('image/')) {
        // Check for GIF specifically if you want to distinguish it from static images
        return (mime === 'image/gif' || name.endsWith('.gif')) ? 'gif' : 'image';
    }
    else if (mime.startsWith('video/')) {
        return 'video';
    }
    else if (mime.startsWith('audio/')) {
        return 'audio';
    }
    else {
        return 'file';
    }

}
