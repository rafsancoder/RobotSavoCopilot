export type ServerConfig = {
    savoMindBaseUrl: string;
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
    // Isolated SavoMind test API. Production will use the same host on port 8000.
    savoMindBaseUrl: 'http://10.149.45.61:8001',
};

export function validateServerConfig(config: ServerConfig): string | null {
    const value = config.savoMindBaseUrl.trim();
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
            return 'Enter a complete HTTP or HTTPS SavoMind base URL.';
        }
        if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
            return 'Enter only the SavoMind base URL, without a path, query, credentials, or fragment.';
        }
    } catch {
        return 'Enter a valid SavoMind base URL, for example http://10.149.45.61:8001.';
    }
    return null;
}

export function buildServerEndpoints(config: ServerConfig) {
    return {
        savoMindUrl: config.savoMindBaseUrl.trim().replace(/\/$/, ''),
    };
}
