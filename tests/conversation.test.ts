import assert from 'node:assert/strict';
import test from 'node:test';

import { getConversationSessionId, normalizeTurnResponse, resetConversationSessionForTests } from '../src/services/conversation.ts';

test('normalizes a text response into the common turn model', () => {
    const turn = normalizeTurnResponse({
        ok: true,
        session_id: 'server-session',
        request_id: 'request-1',
        reply_text: 'Hello from Savo',
        intent: 'chat',
        blocked: false,
    }, 'text', 'requested-session');

    assert.equal(turn.source, 'text');
    assert.equal(turn.sessionId, 'server-session');
    assert.equal(turn.replyText, 'Hello from Savo');
    assert.equal(turn.transcript, null);
    assert.equal(turn.robotPlayback, 'unknown');
});

test('normalizes voice transcript and TTS without changing the audio format', () => {
    const turn = normalizeTurnResponse({
        ok: true,
        transcript: 'Hello Savo',
        reply_text: 'Hello!',
        allow_tts: true,
        tts: { available: true, audio_format: 'wav', audio_base64: 'UklGRg==', audio_size_bytes: 5 },
    }, 'voice', 'shared-session');

    assert.equal(turn.sessionId, 'shared-session');
    assert.equal(turn.transcript, 'Hello Savo');
    assert.deepEqual(turn.tts, { available: true, audioFormat: 'wav', audioBase64: 'UklGRg==', audioSizeBytes: 5 });
});

test('uses one session across screens during the app process', () => {
    resetConversationSessionForTests();
    const chatSession = getConversationSessionId();
    const voiceSession = getConversationSessionId();
    assert.equal(chatSession, voiceSession);
    assert.match(chatSession, /^mobile-app-/);
});
