// Cache simples em memória para desenvolvimento
// Em produção, usar Redis
class MemoryCache {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

    set(key: string, data: any, ttlSeconds: number = 300): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlSeconds * 1000
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Limpar cache expirado automaticamente
    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

export const apiCache = new MemoryCache();

// Cleanup automático a cada 5 minutos
setInterval(() => {
    apiCache.cleanup();
}, 5 * 60 * 1000);

export function getCacheKey(prefix: string, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
    return `${prefix}${paramString ? ':' + paramString : ''}`;
}
