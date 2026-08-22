import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchWithTimeout } from '../src/services/request-timeout.ts';

test('returns successful API responses', async () => {
    const response = await fetchWithTimeout('http://example.test', {}, 50, async () => new Response('{"ok":true}', { status: 200 }));
    assert.equal(response.status, 200);
});

test('preserves API errors for response validation', async () => {
    const response = await fetchWithTimeout('http://example.test', {}, 50, async () => new Response('offline', { status: 503 }));
    assert.equal(response.status, 503);
});

test('rejects requests that exceed the timeout', async () => {
    const neverFinishes: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    });
    await assert.rejects(fetchWithTimeout('http://example.test', {}, 5, neverFinishes), /timed out/);
});
