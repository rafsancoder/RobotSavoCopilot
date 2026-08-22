import assert from 'node:assert/strict';
import test from 'node:test';
import { buildServerEndpoints, DEFAULT_SERVER_CONFIG, validateServerConfig } from '../src/utils/server-config.ts';

test('uses the isolated SavoMind HTTP endpoint by default', () => {
    assert.equal(DEFAULT_SERVER_CONFIG.savoMindBaseUrl, 'http://10.149.45.61:8001');
});

test('builds one integrated SavoMind endpoint', () => {
    assert.deepEqual(
        buildServerEndpoints({ savoMindBaseUrl: 'https://robot.local:8000/' }),
        { savoMindUrl: 'https://robot.local:8000' },
    );
});

test('rejects malformed base URLs and URLs containing API paths', () => {
    assert.match(validateServerConfig({ savoMindBaseUrl: 'robot.local:8000' }) ?? '', /HTTP/);
    assert.match(validateServerConfig({ savoMindBaseUrl: 'ftp://robot.local' }) ?? '', /HTTP/);
    assert.match(validateServerConfig({ savoMindBaseUrl: 'https://robot.local/app' }) ?? '', /without a path/);
});

test('allows explicitly selected local HTTP endpoints', () => {
    assert.equal(
        buildServerEndpoints({ savoMindBaseUrl: 'http://192.168.1.100:8000' }).savoMindUrl,
        'http://192.168.1.100:8000',
    );
});
