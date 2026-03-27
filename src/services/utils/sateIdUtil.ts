

const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n;
const FNV_PRIME_64 = 0x100000001b3n;

/**
 * FNV-1a 64-bit hash
 * - deterministic
 * - non-cryptographic
 * - extremely low collision probability
 */
export function fnv1a64Hash(input: string): string {
    let hash = FNV_OFFSET_BASIS_64;

    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash = BigInt.asUintN(64, hash * FNV_PRIME_64);
    }

    // fixed-length 16 hex chars
    return hash.toString(16).padStart(16, "0");
}


/**
 * Normalize URL for page identity
 * - remove hash
 * - remove query params
 * - remove trailing slash
 */
export function normalizeUrlForPageId(rawUrl: string): string {
    const url = new URL(rawUrl)
    url.hash = ''
    const keepParams = 1;
    const params = Array.from(url.searchParams.entries())
        .slice(0, keepParams)
        .map(([k, v]) => `${k.toLowerCase()}=${v.toLowerCase()}`)
        .join('&')

    const base = (
        getHostnameForSiteId(rawUrl) + url.pathname
    )
        .replace(/\/$/, '')
        .toLowerCase()

    return params ? `${base}?${params}` : base
}


/**
 * Extract site hostname
 */
export function getHostnameForSiteId(rawUrl: string): string {
    const host = new URL(rawUrl).hostname.toLowerCase()
    return host.startsWith('www.') ? host.slice(4) : host

}
export function getSiteIdFromRawUrl(rawUrl: string): string {
    const url = getHostnameForSiteId(rawUrl)
    return fnv1a64Hash(url);
}
export function getPageIdFromRawUrl(rawUrl: string): string {
    const url = normalizeUrlForPageId(rawUrl)
    return fnv1a64Hash(url);
}
export function getChatIdFromRawUrl(rawUrl: string): string {
    const siteId = getSiteIdFromRawUrl(rawUrl)
    const pageId = getPageIdFromRawUrl(rawUrl)
    return `${siteId}_${pageId}`
}


// Helper to generate deterministic ID
export function generatePrivateChatId(uid1: string, uid2: string): string {
    const sorted = [uid1, uid2].sort().join("");
    return fnv1a64Hash(sorted);
}
