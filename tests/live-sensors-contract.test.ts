import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const service = readFileSync(resolve(root, 'src/services/robot-telemetry.ts'), 'utf8');
const layout = readFileSync(resolve(root, 'src/app/_layout.tsx'), 'utf8');
const home = readFileSync(resolve(root, 'src/app/index.tsx'), 'utf8');
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8');

test('telemetry URL derives from the saved SavoMind base URL', () => {
    assert.match(service, /loadServerConfig\(\)/);
    assert.match(service, /buildServerEndpoints\(config\)\.savoMindUrl/);
    assert.match(service, /\/app\/telemetry/);
    assert.doesNotMatch(service, /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/);
});

test('registers one sensors route while retaining existing routes', () => {
    for (const route of ['index', 'map', 'voice', 'chat', 'robot', 'localization', 'settings', 'sensors']) assert.match(layout, new RegExp(`name="${route}"`));
    assert.match(home, /title="Live Sensors"[\s\S]*?href="\/sensors"/);
});

test('introduces no direct ROS networking dependency', () => {
    assert.doesNotMatch(packageJson, /rosbridge|roslib|rclnode|websocket/i);
    assert.doesNotMatch(service, /rosbridge|roslib|rclnode|WebSocket|ssh|unix socket/i);
});

test('existing voice, chat, and playback service is not coupled to telemetry', () => {
    const api = readFileSync(resolve(root, 'src/services/savomind-api.ts'), 'utf8');
    assert.doesNotMatch(api, /telemetry|sensors/i);
});
