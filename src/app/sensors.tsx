import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill, StatusTone } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import {
    fetchRobotTelemetry, RobotTelemetry, startTelemetryPolling, TelemetryUnavailableError,
    telemetryFreshness, TelemetryStatus, Vector3,
} from '../services/robot-telemetry';

const dash = '--';
const number = (value: number | null, decimals = 2) => value === null ? dash : value.toFixed(decimals);
const distance = (value: number | null) => value === null ? dash : `${value.toFixed(2)} m  ·  ${(value * 100).toFixed(0)} cm`;
const age = (value: number | null) => value === null ? dash : value < 1_000 ? `${Math.round(value)} ms` : `${(value / 1_000).toFixed(1)} s`;
const yesNo = (value: boolean | null, yes = 'Healthy', no = 'Fault') => value === null ? dash : value ? yes : no;
const vector = (value: Vector3 | null, unit: string) => value ? `X ${number(value.x)}  Y ${number(value.y)}  Z ${number(value.z)} ${unit}` : dash;
const readable = (value: string | null) => value ? value.replaceAll('_', ' ').toUpperCase() : dash;
const tone = (value: TelemetryStatus | string | null): StatusTone => {
    const normalized = value?.toLowerCase();
    if (normalized === 'live' || normalized === 'clear' || normalized === 'healthy' || normalized === 'online') return 'success';
    if (normalized === 'offline' || normalized === 'fault' || normalized === 'critical' || normalized === 'stop active') return 'danger';
    if (normalized === 'stale' || normalized === 'degraded' || normalized === 'low') return 'warning';
    return 'neutral';
};

export default function SensorsScreen() {
    const { colors } = getRobotTheme();
    const [telemetry, setTelemetry] = useState<RobotTelemetry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [unavailable, setUnavailable] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const lastSuccess = useRef<number | null>(null);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const next = await fetchRobotTelemetry();
            setTelemetry(next); lastSuccess.current = Date.now(); setError(null); setUnavailable(false);
        } catch (caught) {
            setUnavailable(caught instanceof TelemetryUnavailableError);
            setError(caught instanceof Error ? caught.message : 'Live telemetry could not be reached.');
        } finally { setRefreshing(false); }
    }, []);

    useFocusEffect(useCallback(() => startTelemetryPolling(refresh), [refresh]));

    const timestampState = telemetryFreshness(telemetry?.timestampUtc ?? null);
    const connectionState = unavailable ? 'offline' : error && (!lastSuccess.current || Date.now() - lastSuccess.current >= 10_000) ? 'offline' : error ? 'stale' : timestampState;
    const safetyLabel = telemetry?.safety.stop === true ? 'STOP ACTIVE' : telemetry?.safety.stop === false ? 'CLEAR' : 'UNKNOWN';

    return (
        <AppScreen>
            <View style={styles.headingRow}>
                <View style={styles.flex}>
                    <Text style={[styles.eyebrow, { color: colors.primary }]}>LIVE SENSORS</Text>
                    <Text style={[styles.heading, { color: colors.text }]}>Robot telemetry</Text>
                    <Text style={[styles.description, { color: colors.textMuted }]}>Read-only data from the configured SavoMind server</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Refresh telemetry" disabled={refreshing} onPress={() => void refresh()}
                    style={({ pressed }) => [styles.refresh, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed || refreshing ? 0.55 : 1 }]}>
                    <MaterialIcons name="refresh" size={21} color={colors.primary} />
                </Pressable>
            </View>

            <View style={styles.pills}>
                <StatusPill label={connectionState} tone={tone(connectionState)} dot />
                <StatusPill label={safetyLabel} tone={telemetry?.safety.stop ? 'danger' : telemetry?.safety.stop === false ? 'success' : 'neutral'} icon={<MaterialIcons name="security" size={11} color={telemetry?.safety.stop ? colors.danger : colors.success} />} />
            </View>
            <Text style={[styles.updated, { color: colors.textDim }]}>Last update: {telemetry?.timestampUtc ? new Date(telemetry.timestampUtc).toLocaleString() : dash} · Overall health: {readable(telemetry?.overallHealth ?? null)}</Text>

            {error && <View style={[styles.notice, { borderColor: withAlpha(unavailable ? colors.warning : colors.danger, '70'), backgroundColor: withAlpha(unavailable ? colors.warning : colors.danger, '12') }]}>
                <MaterialIcons name={unavailable ? 'info-outline' : 'cloud-off'} size={20} color={unavailable ? colors.warning : colors.danger} />
                <Text style={[styles.noticeText, { color: colors.text }]}>{error}{telemetry ? ' Showing the last successful readings.' : ''}</Text>
            </View>}

            <Section title="SAFETY DISTANCES">
                <Grid>
                    <Card title="Left ToF" status={telemetry?.ranges.left.status} rows={[["Distance", distance(telemetry?.ranges.left.distanceM ?? null)], ["Age", age(telemetry?.ranges.left.ageMs ?? null)]]} />
                    <Card title="Front Ultrasonic" status={telemetry?.ranges.frontUltrasonic.status} rows={[["Distance", distance(telemetry?.ranges.frontUltrasonic.distanceM ?? null)], ["Age", age(telemetry?.ranges.frontUltrasonic.ageMs ?? null)]]} />
                    <Card title="Right ToF" status={telemetry?.ranges.right.status} rows={[["Distance", distance(telemetry?.ranges.right.distanceM ?? null)], ["Age", age(telemetry?.ranges.right.ageMs ?? null)]]} />
                    <Card title="D435 Front Depth" status={telemetry?.ranges.depthFront.status} rows={[["Distance", distance(telemetry?.ranges.depthFront.distanceM ?? null)], ["Age", age(telemetry?.ranges.depthFront.ageMs ?? null)]]} />
                </Grid>
                <Card title="Safety" status={telemetry?.safety.stop ? 'offline' : telemetry?.safety.stop === false ? 'live' : 'not_exposed'} rows={[["State", safetyLabel], ["Slowdown", number(telemetry?.safety.slowdownFactor ?? null)], ["Backend state", readable(telemetry?.safety.state ?? null)]]} />
            </Section>

            <Section title="MOTION & LOCALIZATION">
                <Card title="BNO055 IMU" status={telemetry?.imu.status} rows={[["Roll / Pitch / Yaw", `${number(telemetry?.imu.rollDeg ?? null)}° / ${number(telemetry?.imu.pitchDeg ?? null)}° / ${number(telemetry?.imu.yawDeg ?? null)}°`], ["Quaternion", telemetry?.imu.orientation ? `X ${number(telemetry.imu.orientation.x)} Y ${number(telemetry.imu.orientation.y)} Z ${number(telemetry.imu.orientation.z)} W ${number(telemetry.imu.orientation.w)}` : dash], ["Angular velocity", vector(telemetry?.imu.angularVelocity ?? null, 'rad/s')], ["Linear acceleration", vector(telemetry?.imu.linearAcceleration ?? null, 'm/s²')], ["Calibration", telemetry?.imu.calibration ?? dash], ["Age", age(telemetry?.imu.ageMs ?? null)]]} />
                <OdometryCard title="Wheel Odometry" value={telemetry?.wheelOdometry} wheels />
                <OdometryCard title="Filtered Odometry" value={telemetry?.localization} />
                <OdometryCard title="Visual Odometry" value={telemetry?.visualOdometry} visual />
            </Section>

            <Section title="ENVIRONMENT">
                <Grid>
                    <Card title="RPLIDAR A1" status={telemetry?.lidar.status} rows={[["Scan rate", `${number(telemetry?.lidar.scanRateHz ?? null)} Hz`], ["Range min / max", `${number(telemetry?.lidar.minimumRangeM ?? null)} / ${number(telemetry?.lidar.maximumRangeM ?? null)} m`], ["Valid points", number(telemetry?.lidar.validPoints ?? null, 0)], ["Age", age(telemetry?.lidar.ageMs ?? null)]]} />
                    <Card title="RealSense D435" status={telemetry?.realsense.status} rows={[["Depth status", readable(telemetry?.realsense.depthStatus ?? null)], ["Min front", `${number(telemetry?.realsense.minFrontM ?? null)} m`], ["Point cloud", `${number(telemetry?.realsense.pointcloudRateHz ?? null)} Hz`], ["Depth / Color", `${number(telemetry?.realsense.depthFps ?? null)} / ${number(telemetry?.realsense.colorFps ?? null)} FPS`], ["Age", age(telemetry?.realsense.ageMs ?? null)]]} />
                    <Card title="Head Camera" status={telemetry?.headCamera.status} rows={[["FPS", number(telemetry?.headCamera.fps ?? null)], ["Frame age", age(telemetry?.headCamera.ageMs ?? null)], ["Pan / Tilt", `${number(telemetry?.headCamera.panDeg ?? null)}° / ${number(telemetry?.headCamera.tiltDeg ?? null)}°`]]} />
                </Grid>
            </Section>

            <Section title="ROBOT SYSTEM">
                <Grid>
                    <Card title="Base Battery" status={telemetry?.power.status} rows={[["Voltage", `${number(telemetry?.power.baseVoltageV ?? null)} V`], ["Charge", telemetry?.power.basePercentage === null || telemetry?.power.basePercentage === undefined ? 'Not exposed' : `${number(telemetry.power.basePercentage, 0)}%`], ["Health", readable(telemetry?.power.health ?? null)], ["Age", age(telemetry?.power.ageMs ?? null)]]} />
                    <Card title="Core UPS" status={telemetry?.power.status} rows={[["Voltage", `${number(telemetry?.power.coreUpsVoltageV ?? null)} V`], ["Charge", telemetry?.power.coreUpsPercentage === null || telemetry?.power.coreUpsPercentage === undefined ? 'Not exposed' : `${number(telemetry.power.coreUpsPercentage, 0)}%`]]} />
                    <Card title="Edge UPS" status={telemetry?.power.status} rows={[["Voltage", `${number(telemetry?.power.edgeUpsVoltageV ?? null)} V`], ["Charge", telemetry?.power.edgeUpsPercentage === null || telemetry?.power.edgeUpsPercentage === undefined ? 'Not exposed' : `${number(telemetry.power.edgeUpsPercentage, 0)}%`], ["Alert", telemetry?.power.critical ? 'CRITICAL' : telemetry?.power.low ? 'LOW' : dash]]} />
                    <Card title="Speech / ReSpeaker" status={telemetry?.speech.status} rows={[["Audio runtime", yesNo(telemetry?.speech.microphoneHealthy ?? null)], ["Speech service", yesNo(telemetry?.speech.serviceHealthy ?? null)], ["Capture", yesNo(telemetry?.speech.captureActive ?? null, 'Active', 'Idle')], ["Playback", yesNo(telemetry?.speech.playbackActive ?? null, 'Active', 'Idle')]]} />
                </Grid>
            </Section>
            <View style={[styles.readOnly, { borderColor: colors.border }]}><MaterialCommunityIcons name="shield-lock-outline" size={16} color={colors.textDim} /><Text style={[styles.readOnlyText, { color: colors.textDim }]}>Display only · This screen never sends motor or safety commands</Text></View>
        </AppScreen>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { const { colors } = getRobotTheme(); return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.textDim }]}>{title}</Text>{children}</View>; }
function Grid({ children }: { children: React.ReactNode }) { return <View style={styles.grid}>{children}</View>; }
function Card({ title, status: state = 'not_exposed', rows }: { title: string; status?: TelemetryStatus; rows: [string, string][] }) {
    const { colors } = getRobotTheme(); return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.cardHeader}><Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text><StatusPill label={readable(state)} tone={tone(state)} dot={state === 'live'} /></View>{rows.map(([label, value]) => <View key={label} style={styles.row}><Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text><Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text></View>)}</View>;
}
function OdometryCard({ title, value, visual, wheels }: { title: string; value?: RobotTelemetry['wheelOdometry'] | RobotTelemetry['localization']; visual?: boolean; wheels?: boolean }) {
    const rows: [string, string][] = [["Position", `X ${number(value?.xM ?? null)}  Y ${number(value?.yM ?? null)}  Z ${number(value?.zM ?? null)} m`], ["Yaw", `${number(value?.yawDeg ?? null)}°`], ["Linear velocity", `${number(value?.linearVelocityMps ?? null)} m/s`], ["Angular velocity", `${number(value?.angularVelocityRadps ?? null)} rad/s`]];
    if (visual) rows.push(["Health / Tracking", `${readable(value?.health ?? null)} / ${readable(value?.trackingQuality ?? null)}`]);
    if (wheels && value && 'wheels' in value) Object.entries(value.wheels).forEach(([name, wheel]) => rows.push([name.replace(/([A-Z])/g, ' $1'), wheel ? `${number(wheel.ticks, 0)} ticks · ${number(wheel.velocity)} velocity` : 'Not exposed']));
    rows.push(["Age", age(value?.ageMs ?? null)]); return <Card title={title} status={value?.status} rows={rows} />;
}

const styles = StyleSheet.create({
    flex: { flex: 1 }, headingRow: { flexDirection: 'row', gap: 12, alignItems: 'center' }, eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.6 }, heading: { fontSize: 28, fontWeight: '900', marginTop: 3 }, description: { fontSize: 12, lineHeight: 18, marginTop: 3 }, refresh: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, updated: { fontSize: 11, marginTop: -8 }, notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 13 }, noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
    section: { gap: 10 }, sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { flexGrow: 1, flexBasis: 310, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 }, cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }, cardTitle: { fontSize: 15, fontWeight: '900', flex: 1 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }, rowLabel: { fontSize: 11, flexShrink: 0 }, rowValue: { fontSize: 11, fontWeight: '700', textAlign: 'right', flex: 1 },
    readOnly: { borderTopWidth: 1, paddingTop: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, readOnlyText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
});
