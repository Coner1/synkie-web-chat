export interface SiteMeta {
    siteId: string;
    originalUrl: string;
    host: string;
    title: string;
}

export interface PageMeta {
    pageId: string;
    siteId: string;

    originalUrl: string;
    normalizedUrl: string;

    title: string;
}

