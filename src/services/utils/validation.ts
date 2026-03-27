
export const validateUsername = (username: string): boolean => {
    if (!username || username.length < 2 || username.length > 20) {
        return false;
    }
    // Allow letters, numbers, spaces, and common characters
    const regex = /^[a-zA-Z0-9\s._-]+$/;
    return regex.test(username);
};

export const validateMessage = (message: string): boolean => {
    if (!message || message.trim().length === 0) {
        return false;
    }
    if (message.length > 2000) {
        return false;
    }
    return true;
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
};
export const clampPosition = (x: number, y: number) => {
    const PADDING = 12

    return {
        x: Math.max(
            PADDING,
            Math.min(x, window.innerWidth - PADDING)
        ),
        y: Math.max(
            PADDING,
            Math.min(y, window.innerHeight - PADDING)
        )
    }
}
