import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeTelemetry, startTelemetryPolling, telemetryFreshness, TelemetryUnavailableError } from '../src/services/robot-telemetry.ts';

test('normalizes valid telemetry and rejects malformed numeric values', () => {
    const result = normalizeTelemetry({ ok: true, timestamp_utc: '2026-09-03T10:00:00Z', ranges: { left_m: 0.54, right_m: 'bad' }, imu: { status: 'live', yaw_deg: 92.5, angular_velocity: { x: 0, y: Number.NaN, z: 0.02 } }, power: { base_percentage: 80, base_percentage_valid: false } });
    assert.equal(result.connected, true);
    assert.equal(result.ranges.left.distanceM, 0.54);
    assert.equal(result.ranges.right.distanceM, null);
    assert.equal(result.imu.angularVelocity?.y, null);
    assert.equal(result.power.basePercentage, null);
});

test('missing optional sensor fields normalize to safe not-exposed values', () => {
    const result = normalizeTelemetry({ ok: true });
    assert.equal(result.lidar.status, 'not_exposed');
    assert.equal(result.wheelOdometry.wheels.frontLeft, null);
    assert.equal(result.headCamera.fps, null);
});

test('calculates live, stale, and offline freshness', () => {
    const now = Date.parse('2026-09-03T10:00:10Z');
    assert.equal(telemetryFreshness('2026-09-03T10:00:09Z', now), 'live');
    assert.equal(telemetryFreshness('2026-09-03T10:00:05Z', now), 'stale');
    assert.equal(telemetryFreshness('2026-09-03T10:00:00Z', now), 'offline');
    assert.equal(telemetryFreshness('invalid', now), 'stale');
});

test('404 error has the required unavailable message', () => {
    assert.equal(new TelemetryUnavailableError().message, 'Live telemetry is not available on this SavoMind server yet.');
});

test('polling runs immediately, prevents overlap, and cleans up', async () => {
    let calls = 0; let release: (() => void) | undefined;
    const stop = startTelemetryPolling(async () => { calls += 1; await new Promise<void>(resolve => { release = resolve; }); }, 5);
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(calls, 1);
    release?.(); await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(calls, 2);
    stop(); release?.(); const stoppedAt = calls;
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(calls, stoppedAt);
});
