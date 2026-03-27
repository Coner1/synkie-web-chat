
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

export class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    allowRequest(key: string): boolean {
        const now = Date.now();
        const entry = this.limits.get(key);

        if (!entry || now > entry.resetTime) {
            // Start new window
            this.limits.set(key, {
                count: 1,
                resetTime: now + this.windowMs
            });
            return true;
        }

        if (entry.count >= this.maxRequests) {
            return false;
        }

        entry.count++;
        return true;
    }

    getRemainingRequests(key: string): number {
        const entry = this.limits.get(key);
        if (!entry || Date.now() > entry.resetTime) {
            return this.maxRequests;
        }
        return Math.max(0, this.maxRequests - entry.count);
    }

    reset(key: string) {
        this.limits.delete(key);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.limits.entries()) {
            if (now > entry.resetTime) {
                this.limits.delete(key);
            }
        }
    }
}
