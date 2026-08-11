import assert from 'node:assert/strict';
import test from 'node:test';
import { buildServerEndpoints, validateServerConfig } from '../src/utils/server-config.ts';

test('builds secure endpoints by default', () => {
    assert.deepEqual(
        buildServerEndpoints({ host: 'robot.local', llmPort: '8000', sttPort: '9000', protocol: 'https' }),
        {
            llmUrl: 'https://robot.local:8000',
            sttUrl: 'https://robot.local:9000',
            wsUrl: 'wss://robot.local:8000/ws/robot',
        },
    );
});

test('rejects malformed hosts and ports', () => {
    assert.match(validateServerConfig({ host: 'http://robot.local', llmPort: '8000', sttPort: '9000', protocol: 'https' }) ?? '', /hostname/);
    assert.match(validateServerConfig({ host: 'robot.local', llmPort: '0', sttPort: '9000', protocol: 'https' }) ?? '', /between/);
    assert.match(validateServerConfig({ host: 'robot.local', llmPort: 'abc', sttPort: '9000', protocol: 'https' }) ?? '', /numbers/);
});

test('allows explicitly selected local HTTP endpoints', () => {
    assert.equal(
        buildServerEndpoints({ host: '192.168.1.100', llmPort: '8000', sttPort: '9000', protocol: 'http' }).wsUrl,
        'ws://192.168.1.100:8000/ws/robot',
    );
});
