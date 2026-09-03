import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { normalizeTurnResponse } from '../src/services/conversation.ts';

const apiSource = readFileSync('src/services/savomind-api.ts', 'utf8');

test('sends the persisted playback target in text and voice requests', () => {
    assert.match(apiSource, /playback_target:\s*playbackTarget/);
    assert.match(apiSource, /form\.append\('playback_target',\s*playbackTarget\)/);
    assert.match(apiSource, /loadPlaybackTarget\(\)/);
});

test('uses the dedicated timeout only for the voice turn', () => {
    assert.match(apiSource, /fetchWithTimeout\(`\$\{baseUrl\}\/health`\)/);
    assert.match(apiSource, /fetchWithTimeout\(`\$\{baseUrl\}\/app\/chat`, request\)/);
    assert.match(
        apiSource,
        /fetchWithTimeout\(`\$\{baseUrl\}\/app\/voice\/turn`,[\s\S]*?VOICE_REQUEST_TIMEOUT_MS/,
    );
});

test('normalizes explicit robot playback state from backend', () => {
    const turn = normalizeTurnResponse({
        ok: true,
        session_id: 'server-session',
        request_id: 'request-1',
        reply_text: 'Hello from Savo',
        intent: 'chat',
        blocked: false,
        robot_playback: 'queued',
        playback_ack_required: true,
        playback_token: 'abc123',
    }, 'text', 'requested-session');

    assert.equal(turn.robotPlayback, 'queued');
    assert.equal(turn.playbackAckRequired, true);
    assert.equal(turn.playbackToken, 'abc123');
});

test('keeps unknown robot playback when backend does not report it', () => {
    const turn = normalizeTurnResponse({
        ok: true,
        session_id: 'server-session',
        request_id: 'request-1',
        reply_text: 'No robot state yet',
        intent: 'chat',
        blocked: false,
    }, 'text', 'requested-session');

    assert.equal(turn.robotPlayback, 'unknown');
});
