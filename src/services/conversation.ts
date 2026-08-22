export type TurnSource = 'text' | 'voice';

export type TurnTts = {
    available: boolean;
    audioFormat: string | null;
    audioBase64: string | null;
    audioSizeBytes: number;
};

export type RobotPlayback = 'unknown' | 'queued' | 'playing' | 'failed';

export type ConversationTurn = {
    ok: boolean;
    sessionId: string;
    requestId: string | null;
    source: TurnSource;
    transcript: string | null;
    replyText: string;
    intent: string | null;
    blocked: boolean;
    blockReason: string | null;
    allowTts: boolean;
    tts: TurnTts;
    robotPlayback: RobotPlayback;
    reason: string | null;
    playbackAckRequired: boolean;
    playbackToken: string | null;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
    return value !== null && typeof value === 'object' ? value as UnknownRecord : {};
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function bool(value: unknown, fallback = false): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function number(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function normalizeTurnResponse(payload: unknown, source: TurnSource, requestedSessionId: string): ConversationTurn {
    const value = record(payload);
    const tts = record(value.tts);
    const replyText = text(value.reply_text) ?? text(value.block_reason) ?? '';
    const audioBase64 = text(tts.audio_base64);

    const rawRobotPlayback = text(value.robot_playback);

    return {
        ok: bool(value.ok),
        sessionId: text(value.session_id) ?? requestedSessionId,
        requestId: text(value.request_id),
        source,
        transcript: source === 'voice' ? text(value.transcript) : null,
        replyText,
        intent: text(value.intent),
        blocked: bool(value.blocked),
        blockReason: text(value.block_reason),
        allowTts: bool(value.allow_tts, audioBase64 !== null),
        tts: {
            available: bool(tts.available, audioBase64 !== null),
            audioFormat: text(tts.audio_format),
            audioBase64,
            audioSizeBytes: number(tts.audio_size_bytes),
        },
        robotPlayback: rawRobotPlayback === 'queued' || rawRobotPlayback === 'playing' || rawRobotPlayback === 'failed' ? rawRobotPlayback : 'unknown',
        reason: text(value.reason),
        playbackAckRequired: bool(value.playback_ack_required),
        playbackToken: text(value.playback_token),
    };
}

let applicationSessionId: string | null = null;

export function getConversationSessionId(): string {
    if (!applicationSessionId) {
        applicationSessionId = `mobile-app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    return applicationSessionId;
}

export function resetConversationSessionForTests(): void {
    applicationSessionId = null;
}
