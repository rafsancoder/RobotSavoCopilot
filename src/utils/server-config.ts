export type ServerProtocol = 'https' | 'http';

export type ServerConfig = {
    host: string;
    llmPort: string;
    sttPort: string;
    protocol: ServerProtocol;
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
    host: '192.168.1.100',
    llmPort: '8000',
    sttPort: '9000',
    protocol: 'https',
};

export function validateServerConfig(config: ServerConfig): string | null {
    const host = config.host.trim();
    if (!host || /[\s/:?#\[\]@]/.test(host)) {
        return 'Enter a hostname or IP address without a protocol, port, or path.';
    }

    for (const [label, value] of [['LLM', config.llmPort], ['STT', config.sttPort]] as const) {
        if (!/^\d+$/.test(value)) return `${label} port must contain only numbers.`;
        const port = Number(value);
        if (port < 1 || port > 65535) return `${label} port must be between 1 and 65535.`;
    }

    return null;
}

export function buildServerEndpoints(config: ServerConfig) {
    const host = config.host.trim();
    const webSocketProtocol = config.protocol === 'https' ? 'wss' : 'ws';
    return {
        llmUrl: `${config.protocol}://${host}:${config.llmPort}`,
        sttUrl: `${config.protocol}://${host}:${config.sttPort}`,
        wsUrl: `${webSocketProtocol}://${host}:${config.llmPort}/ws/robot`,
    };
}
