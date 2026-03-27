import type {ThemeType} from "~/types/common";

export function getAvatarBySize(
    url: string,
    size: 32 | 64 | 128 | 256
): string {
    if (!url) return url

    return url.replace(
        /\/(\d+)\.(jpg|png|webp)/,
        `/${size}.$2`
    )
}
function hashStringToNumber(str: string): number {
    let hash = 2166136261
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i)
        hash +=
            (hash << 1) +
            (hash << 4) +
            (hash << 7) +
            (hash << 8) +
            (hash << 24)
    }
    return hash >>> 0
}

export function userIdToAvatarColor(
    userId: string,
    mode: ThemeType,
    options?: {
        saturation?: number
        lightnessLight?: number
        lightnessDark?: number
    }
): string {
    const hash = hashStringToNumber(userId)
    const hue = hash % 360

    const saturation = options?.saturation ?? 65

    const lightness =
        mode === 'dark'
            ? options?.lightnessDark ?? 70
            : options?.lightnessLight ?? 45

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
