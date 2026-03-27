export function getCurrentWebsiteTitle(): string {
    if (typeof document === 'undefined') return ''

    const title =
        document.title ||
        document
            .querySelector<HTMLMetaElement>('meta[property="og:title"]')
            ?.content ||
        document
            .querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
            ?.content ||
        window.location.hostname

    return title.trim()
}

export function getCurrentWebsiteLogo(): string | null {
    if (typeof document === 'undefined') return null

    const links = Array.from(
        document.querySelectorAll<HTMLLinkElement>(
            `
                  link[rel="icon"],
                  link[rel="shortcut icon"],
                  link[rel="apple-touch-icon"],
                  link[rel="apple-touch-icon-precomposed"]
                  `
        )
    )

    if (links.length > 0) {
        const href = links[0].href
        if (href) return toAbsoluteUrl(href)
    }
    // Fallback: /favicon.ico
    return `${window.location.origin}/favicon.ico`
}

function toAbsoluteUrl(url: string): string {
    try {
        return new URL(url, window.location.href).href
    } catch {
        return url
    }
}
