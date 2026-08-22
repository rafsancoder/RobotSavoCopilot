import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

import { buildServerEndpoints, DEFAULT_SERVER_CONFIG, ServerConfig, validateServerConfig } from '../utils/server-config';
import { ConversationTurn, normalizeTurnResponse } from './conversation';
import { DEFAULT_REQUEST_TIMEOUT_MS, fetchWithTimeout } from './request-timeout';

export const SERVER_CONFIG_STORAGE_KEY = '@robot-savo/server-config';
export const PLAYBACK_TARGET_STORAGE_KEY = '@robot-savo/playback-target';
export type PlaybackTarget = 'phone' | 'robot';

function connectionError(baseUrl: string, error: unknown): Error {
    const detail = error instanceof Error ? error.message : 'Network request failed';
    return new Error(`Could not connect to SavoMind at ${baseUrl}. ${detail}`);
}

export async function loadServerConfig(): Promise<ServerConfig> {
    const stored = await AsyncStorage.getItem(SERVER_CONFIG_STORAGE_KEY);
    if (!stored) return DEFAULT_SERVER_CONFIG;
    const parsed = JSON.parse(stored) as Partial<ServerConfig>;
    const candidate = parsed.savoMindBaseUrl ? { savoMindBaseUrl: parsed.savoMindBaseUrl } : DEFAULT_SERVER_CONFIG;
    return validateServerConfig(candidate) ? DEFAULT_SERVER_CONFIG : candidate;
}

export async function loadPlaybackTarget(): Promise<PlaybackTarget> {
    return await AsyncStorage.getItem(PLAYBACK_TARGET_STORAGE_KEY) === 'robot' ? 'robot' : 'phone';
}

export async function savePlaybackTarget(target: PlaybackTarget): Promise<void> {
    await AsyncStorage.setItem(PLAYBACK_TARGET_STORAGE_KEY, target);
}

export async function saveServerConfig(config: ServerConfig): Promise<void> {
    await AsyncStorage.setItem(SERVER_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

async function checkedJson<T>(response: Response): Promise<T> {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        const detail = payload && typeof payload === 'object'
            ? ('detail' in payload
                ? JSON.stringify(payload.detail)
                : 'error' in payload
                    ? JSON.stringify(payload.error)
                    : '')
            : response.statusText;
        throw new Error(`SavoMind returned ${response.status}: ${detail || 'request failed'}`);
    }
    return payload as T;
}

export async function checkSavoMind(config?: ServerConfig): Promise<boolean> {
    const active = config ?? await loadServerConfig();
    const baseUrl = buildServerEndpoints(active).savoMindUrl;
    try {
        const response = await fetchWithTimeout(`${baseUrl}/health`);
        const payload = await checkedJson<{ ok: boolean }>(response);
        return payload.ok === true;
    } catch (error) {
        throw connectionError(baseUrl, error);
    }
}

export async function sendTextTurn(message: string, sessionId: string): Promise<ConversationTurn> {
    const [config, playbackTarget] = await Promise.all([loadServerConfig(), loadPlaybackTarget()]);
    const baseUrl = buildServerEndpoints(config).savoMindUrl;
    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            language: 'en',
            session_id: sessionId,
            client_id: 'robot-savo-copilot',
            playback_target: playbackTarget,
        }),
    };
    let response: Response;
    try {
        response = await fetchWithTimeout(`${baseUrl}/app/chat`, request);
    } catch (error) {
        throw connectionError(baseUrl, error);
    }
    if (response.status === 404) {
        throw new Error(`No SavoMind chat route was found at ${baseUrl}. Check the host and port in Settings, then update or restart the SavoMind server.`);
    }
    return normalizeTurnResponse(await checkedJson<unknown>(response), 'text', sessionId);
}

export async function sendVoiceTurn(audioUri: string, sessionId: string): Promise<ConversationTurn> {
    const [config, playbackTarget] = await Promise.all([loadServerConfig(), loadPlaybackTarget()]);
    const baseUrl = buildServerEndpoints(config).savoMindUrl;
    const recording = new File(audioUri);
    if (!recording.exists || recording.size === 0) throw new Error('The recording is empty. Please record again.');

    try {
        const form = new FormData();
        // Upload the recorder's actual file. Never relabel AAC/M4A bytes as WAV.
        form.append('audio', recording);
        form.append('session_id', sessionId);
        form.append('client_id', 'robot-savo-copilot');
        form.append('device_id', 'expo-mobile');
        form.append('language', 'en');
        form.append('playback_target', playbackTarget);

        let response;
        try {
            response = await fetchWithTimeout(`${baseUrl}/app/voice/turn`, {
                method: 'POST',
                body: form,
            }, DEFAULT_REQUEST_TIMEOUT_MS, expoFetch as unknown as typeof fetch);
        } catch (error) {
            throw connectionError(baseUrl, error);
        }
        if (response.status === 404) {
            throw new Error('This SavoMind server does not provide /app/voice/turn. Update or restart SavoMind to enable uploaded voice commands.');
        }
        return normalizeTurnResponse(await checkedJson<unknown>(response as unknown as Response), 'voice', sessionId);
    } finally {
        if (recording.exists) recording.delete();
    }
}

export async function acknowledgePlayback(response: ConversationTurn): Promise<void> {
    if (!response.playbackAckRequired || !response.playbackToken) return;
    const config = await loadServerConfig();
    const acknowledgement = await fetchWithTimeout(`${buildServerEndpoints(config).savoMindUrl}/navigation/playback-finished`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: response.sessionId,
            request_id: response.requestId,
            client_id: 'robot-savo-copilot',
            playback_token: response.playbackToken,
            playback_ok: true,
        }),
    });
    await checkedJson(acknowledgement);
}

/** Compatibility alias for existing callers. */
export const sendChatMessage = sendTextTurn;
