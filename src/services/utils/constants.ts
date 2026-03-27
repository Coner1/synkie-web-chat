
export const APP_CONFIG = {
    MAX_MESSAGE_LENGTH: 2000,
    MAX_USERNAME_LENGTH: 20,
    MIN_USERNAME_LENGTH: 2,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MESSAGE_LOAD_LIMIT: 50,
    RATE_LIMIT_MESSAGES: 10,
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    CACHE_EXPIRY: 300000, // 5 minutes
    NOTIFICATION_DURATION: 5000,
    PRESENCE_UPDATE_INTERVAL: 30000 // 30 seconds
};

export const ALLOWED_FILE_TYPES = [
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

export const NOTIFICATION_SOUNDS = {
    MESSAGE: '/sounds/message.mp3',
    NOTIFICATION: '/sounds/notification.mp3'
};
