import { buildServerEndpoints } from '../utils/server-config.ts';
import { fetchWithTimeout } from './request-timeout.ts';

export type TelemetryStatus = 'live' | 'stale' | 'offline' | 'unavailable' | 'not_exposed';
export type Vector3 = { x: number | null; y: number | null; z: number | null };

export interface RangeTelemetry { distanceM: number | null; status: TelemetryStatus; ageMs: number | null }
export interface ImuTelemetry {
    status: TelemetryStatus; ageMs: number | null; rollDeg: number | null; pitchDeg: number | null; yawDeg: number | null;
    orientation: (Vector3 & { w: number | null }) | null; angularVelocity: Vector3 | null;
    linearAcceleration: Vector3 | null; calibration: string | null;
}
export interface OdometryTelemetry {
    status: TelemetryStatus; ageMs: number | null; health: string | null; trackingQuality: string | null;
    xM: number | null; yM: number | null; zM: number | null; yawDeg: number | null;
    linearVelocityMps: number | null; angularVelocityRadps: number | null;
}
export interface WheelTelemetry { ticks: number | null; velocity: number | null }
export interface RobotTelemetry {
    ok: boolean; timestampUtc: string | null; connected: boolean; overallHealth: string | null;
    safety: { stop: boolean | null; slowdownFactor: number | null; state: string | null };
    ranges: { left: RangeTelemetry; right: RangeTelemetry; frontUltrasonic: RangeTelemetry; depthFront: RangeTelemetry };
    imu: ImuTelemetry;
    lidar: { status: TelemetryStatus; ageMs: number | null; scanRateHz: number | null; minimumRangeM: number | null; maximumRangeM: number | null; validPoints: number | null };
    realsense: { status: TelemetryStatus; depthStatus: TelemetryStatus; ageMs: number | null; minFrontM: number | null; pointcloudRateHz: number | null; depthFps: number | null; colorFps: number | null };
    visualOdometry: OdometryTelemetry;
    wheelOdometry: OdometryTelemetry & { wheels: Record<'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight', WheelTelemetry | null> };
    localization: OdometryTelemetry;
    headCamera: { status: TelemetryStatus; fps: number | null; ageMs: number | null; panDeg: number | null; tiltDeg: number | null };
    speech: { status: TelemetryStatus; microphoneHealthy: boolean | null; serviceHealthy: boolean | null; captureActive: boolean | null; playbackActive: boolean | null };
    power: { status: TelemetryStatus; ageMs: number | null; health: string | null; low: boolean | null; critical: boolean | null; baseVoltageV: number | null; basePercentage: number | null; coreUpsVoltageV: number | null; coreUpsPercentage: number | null; edgeUpsVoltageV: number | null; edgeUpsPercentage: number | null };
}

export class TelemetryUnavailableError extends Error {
    constructor() { super('Live telemetry is not available on this SavoMind server yet.'); this.name = 'TelemetryUnavailableError'; }
}

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const finite = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const text = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
const bool = (value: unknown): boolean | null => typeof value === 'boolean' ? value : null;
const status = (value: unknown): TelemetryStatus => {
    const normalized = text(value)?.toLowerCase();
    return normalized === 'live' || normalized === 'stale' || normalized === 'offline' || normalized === 'unavailable' || normalized === 'not_exposed'
        ? normalized : 'not_exposed';
};
const valueFrom = (source: JsonObject, ...keys: string[]) => keys.map(key => source[key]).find(value => value !== undefined);
const age = (source: JsonObject) => finite(valueFrom(source, 'age_ms', 'data_age_ms', 'frame_age_ms', 'scan_age_ms'));
const vector = (value: unknown): Vector3 | null => {
    const source = object(value);
    return Object.keys(source).length ? { x: finite(source.x), y: finite(source.y), z: finite(source.z) } : null;
};
const range = (value: unknown, fallback?: unknown): RangeTelemetry => {
    const source = object(value);
    const distanceM = finite(valueFrom(source, 'distance_m', 'value_m')) ?? finite(fallback);
    return { distanceM, status: source.status === undefined ? (distanceM === null ? 'not_exposed' : 'live') : status(source.status), ageMs: age(source) };
};
const odometry = (value: unknown): OdometryTelemetry => {
    const source = object(value);
    return { status: status(source.status), ageMs: age(source), health: text(source.health), trackingQuality: text(source.tracking_quality), xM: finite(source.x_m), yM: finite(source.y_m), zM: finite(source.z_m), yawDeg: finite(source.yaw_deg), linearVelocityMps: finite(valueFrom(source, 'linear_velocity_mps', 'linear_speed_mps')), angularVelocityRadps: finite(valueFrom(source, 'angular_velocity_radps', 'angular_speed_radps')) };
};
const wheel = (value: unknown): WheelTelemetry | null => {
    const source = object(value);
    if (!Object.keys(source).length) return null;
    return { ticks: finite(valueFrom(source, 'ticks', 'count')), velocity: finite(valueFrom(source, 'velocity', 'velocity_mps')) };
};

export function normalizeTelemetry(payload: unknown): RobotTelemetry {
    const root = object(payload); const safety = object(root.safety); const ranges = object(root.ranges);
    const imu = object(root.imu); const orientation = object(imu.orientation); const lidar = object(root.lidar);
    const realsense = object(root.realsense); const wheels = object(object(root.wheel_odometry).wheels);
    const camera = object(valueFrom(root, 'head_camera', 'pi_camera')); const speech = object(valueFrom(root, 'speech', 'respeaker'));
    const power = object(root.power); const timestampUtc = text(valueFrom(root, 'timestamp_utc', 'timestamp'));
    return {
        ok: root.ok === true, timestampUtc, connected: bool(root.connected) ?? root.ok === true, overallHealth: text(valueFrom(root, 'overall_health', 'health')),
        safety: { stop: bool(safety.stop), slowdownFactor: finite(safety.slowdown_factor), state: text(safety.state) },
        ranges: { left: range(ranges.left, ranges.left_m), right: range(ranges.right, ranges.right_m), frontUltrasonic: range(ranges.front_ultrasonic, ranges.front_ultrasonic_m), depthFront: range(ranges.depth_front, ranges.depth_min_front_m) },
        imu: { status: status(imu.status), ageMs: age(imu), rollDeg: finite(imu.roll_deg), pitchDeg: finite(imu.pitch_deg), yawDeg: finite(imu.yaw_deg), orientation: Object.keys(orientation).length ? { ...vector(orientation)!, w: finite(orientation.w) } : null, angularVelocity: vector(imu.angular_velocity), linearAcceleration: vector(imu.linear_acceleration), calibration: text(valueFrom(imu, 'calibration_status', 'calibration')) },
        lidar: { status: status(lidar.status), ageMs: age(lidar), scanRateHz: finite(lidar.scan_rate_hz), minimumRangeM: finite(valueFrom(lidar, 'minimum_range_m', 'min_range_m')), maximumRangeM: finite(valueFrom(lidar, 'maximum_range_m', 'max_range_m')), validPoints: finite(lidar.valid_points) },
        realsense: { status: status(realsense.status), depthStatus: status(realsense.depth_status), ageMs: age(realsense), minFrontM: finite(valueFrom(realsense, 'min_front_m', 'depth_min_front_m')), pointcloudRateHz: finite(realsense.pointcloud_rate_hz), depthFps: finite(realsense.depth_fps), colorFps: finite(realsense.color_fps) },
        visualOdometry: odometry(valueFrom(root, 'visual_odometry', 'vo')),
        wheelOdometry: { ...odometry(root.wheel_odometry), wheels: { frontLeft: wheel(valueFrom(wheels, 'front_left', 'frontLeft')), frontRight: wheel(valueFrom(wheels, 'front_right', 'frontRight')), rearLeft: wheel(valueFrom(wheels, 'rear_left', 'rearLeft')), rearRight: wheel(valueFrom(wheels, 'rear_right', 'rearRight')) } },
        localization: odometry(valueFrom(root, 'localization', 'filtered_odometry')),
        headCamera: { status: status(camera.status), fps: finite(camera.fps), ageMs: age(camera), panDeg: finite(camera.pan_deg), tiltDeg: finite(camera.tilt_deg) },
        speech: { status: status(speech.status), microphoneHealthy: bool(valueFrom(speech, 'microphone_healthy', 'audio_runtime_healthy')), serviceHealthy: bool(speech.service_healthy), captureActive: bool(speech.capture_active), playbackActive: bool(speech.playback_active) },
        power: { status: status(power.status), ageMs: age(power), health: text(power.health), low: bool(power.low), critical: bool(power.critical), baseVoltageV: finite(power.base_voltage_v), basePercentage: bool(valueFrom(power, 'base_percentage_valid', 'base_calibrated')) === false ? null : finite(power.base_percentage), coreUpsVoltageV: finite(power.core_ups_voltage_v), coreUpsPercentage: bool(power.core_ups_percentage_valid) === false ? null : finite(power.core_ups_percentage), edgeUpsVoltageV: finite(power.edge_ups_voltage_v), edgeUpsPercentage: bool(power.edge_ups_percentage_valid) === false ? null : finite(power.edge_ups_percentage) },
    };
}

export async function fetchRobotTelemetry(fetchImpl: typeof fetch = fetch): Promise<RobotTelemetry> {
    const { loadServerConfig } = await import('./savomind-api.ts');
    const config = await loadServerConfig();
    const url = `${buildServerEndpoints(config).savoMindUrl}/app/telemetry`;
    const response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, undefined, fetchImpl);
    if (response.status === 404) throw new TelemetryUnavailableError();
    if (!response.ok) throw new Error(`SavoMind telemetry request failed (${response.status}).`);
    return normalizeTelemetry(await response.json().catch(() => null));
}

export const TELEMETRY_POLL_INTERVAL_MS = 1_000;
export const TELEMETRY_STALE_AFTER_MS = 3_000;
export const TELEMETRY_OFFLINE_AFTER_MS = 10_000;
export function telemetryFreshness(timestampUtc: string | null, nowMs = Date.now()): 'live' | 'stale' | 'offline' {
    if (!timestampUtc) return 'stale';
    const timestamp = Date.parse(timestampUtc);
    if (!Number.isFinite(timestamp)) return 'stale';
    const ageMs = Math.max(0, nowMs - timestamp);
    return ageMs >= TELEMETRY_OFFLINE_AFTER_MS ? 'offline' : ageMs >= TELEMETRY_STALE_AFTER_MS ? 'stale' : 'live';
}

export function startTelemetryPolling(task: () => Promise<void>, intervalMs = TELEMETRY_POLL_INTERVAL_MS): () => void {
    let active = true; let running = false;
    const run = async () => { if (!active || running) return; running = true; try { await task(); } finally { running = false; } };
    void run();
    const timer = setInterval(() => void run(), intervalMs);
    return () => { active = false; clearInterval(timer); };
}
