import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { RobotHeroCard } from '../components/ui/RobotHeroCard';
import { ListItem } from '../components/ui/ListItem';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import { MOCK_ROBOT_STATUS, mockEmergencyStop } from '../data/mock';

export default function HomeScreen() {
    const { colors } = getRobotTheme();
    const status = MOCK_ROBOT_STATUS;

    function handleEmergencyStop() {
        Alert.alert(
            'Emergency Stop',
            '[MOCK] This will send a safe stop command to the backend when connected. The ROS 2 core handles motor control — this app never directly controls motors.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'STOP',
                    style: 'destructive',
                    onPress: () => {
                        mockEmergencyStop();
                        Alert.alert('Emergency Stop Queued', '[MOCK] Command logged. Backend will execute when connected.');
                    },
                },
            ],
        );
    }

    return (
        <AppScreen>
            {/* ── Hero ── */}
            <RobotHeroCard />

            {/* ── Status pills ── */}
            <View style={styles.pillRow}>
                <StatusPill label="ONLINE" tone="success" dot />
                <StatusPill label="MOCK MODE" tone="info" />
                <StatusPill label="SAFE" tone="success" icon={<MaterialIcons name="security" size={10} color={colors.success} />} />
            </View>

            {/* ── Robot Status panel ── */}
            <SectionLabel label="ROBOT STATUS" color={colors.textDim} />
            <View style={[styles.metricsGrid, { gap: 10 }]}>
                <MetricCard
                    label="Battery"
                    value={`${status.battery}%`}
                    sub={`${status.batteryVoltage}V`}
                    icon={<MaterialIcons name="battery-charging-full" size={20} color={colors.success} />}
                    accent={colors.success}
                    progress={status.battery / 100}
                />
                <MetricCard
                    label="Mode"
                    value={status.mode}
                    sub="Robot state"
                    icon={<MaterialCommunityIcons name="robot" size={20} color={colors.primary} />}
                    accent={colors.primary}
                />
                <MetricCard
                    label="Safety Stop"
                    value={status.safetyStop ? 'ACTIVE' : 'OFF'}
                    sub={status.safetyStop ? 'Robot halted' : 'All clear'}
                    icon={<MaterialIcons name="security" size={20} color={status.safetyStop ? colors.danger : colors.success} />}
                    accent={status.safetyStop ? colors.danger : colors.success}
                />
                <MetricCard
                    label="Backend"
                    value={status.backendMode}
                    sub={`Uptime ${status.uptime}`}
                    icon={<MaterialCommunityIcons name="server" size={20} color={colors.warning} />}
                    accent={colors.warning}
                />
            </View>

            {/* ── Emergency Stop ── */}
            <SectionLabel label="SAFETY CONTROL" color={colors.textDim} />
            <Pressable
                onPress={handleEmergencyStop}
                accessibilityRole="button"
                accessibilityLabel="Emergency stop"
                accessibilityHint="Opens a confirmation before queuing a safe stop command"
                style={({ pressed }) => [
                    styles.eStop,
                    {
                        backgroundColor: withAlpha(colors.danger, '18'),
                        borderColor: withAlpha(colors.danger, '70'),
                        opacity: pressed ? 0.85 : 1,
                    },
                ]}
            >
                <MaterialCommunityIcons name="stop-circle" size={28} color={colors.danger} />
                <View style={styles.eStopText}>
                    <Text style={[styles.eStopTitle, { color: colors.danger }]}>EMERGENCY STOP</Text>
                    <Text style={[styles.eStopSub, { color: colors.textDim }]}>
                        MOCK — Sends safe command via backend · App never controls motors directly
                    </Text>
                </View>
            </Pressable>

            {/* ── Navigate ── */}
            <SectionLabel label="NAVIGATE" color={colors.textDim} />
            <View style={styles.navList}>
                <ListItem
                    title="Map View"
                    subtitle="Indoor map · robot marker"
                    href="/map"
                    icon={<MaterialIcons name="map" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="Voice Command"
                    subtitle="Text-based mock commands"
                    href="/voice"
                    icon={<MaterialIcons name="mic" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="AI Chatbot"
                    subtitle="Ask about Robot Savo"
                    href="/chat"
                    icon={<MaterialIcons name="chat-bubble" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="Robot Description"
                    subtitle="Hardware · sensors · safety"
                    href="/robot"
                    icon={<MaterialCommunityIcons name="robot-industrial" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="Localization"
                    subtitle="Mock pose · X · Y · Yaw"
                    href="/localization"
                    icon={<MaterialIcons name="my-location" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="Live Sensors"
                    subtitle="Real-time Robot Savo telemetry"
                    href="/sensors"
                    icon={<MaterialCommunityIcons name="radar" size={20} color={colors.primary} />}
                />
                <ListItem
                    title="Settings"
                    subtitle="Server connection setup"
                    href="/settings"
                    icon={<MaterialIcons name="settings" size={20} color={colors.primary} />}
                />
            </View>
        </AppScreen>
    );
}

// ── Sub-components ──────────────────────────────────────────

function SectionLabel({ label, color }: { label: string; color: string }) {
    return <Text style={[styles.sectionLabel, { color }]}>{label}</Text>;
}

function MetricCard({
    label, value, sub, icon, accent, progress,
}: {
    label: string; value: string; sub?: string; icon: React.ReactNode; accent: string; progress?: number;
}) {
    const { colors } = getRobotTheme();
    return (
        <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.metricIcon, { backgroundColor: withAlpha(accent, '20') }]}>
                {icon}
            </View>
            <Text style={[styles.metricLabel, { color: colors.textDim }]}>{label}</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            {sub && <Text style={[styles.metricSub, { color: colors.textMuted }]}>{sub}</Text>}
            {progress !== undefined && (
                <View style={[styles.bar, { backgroundColor: withAlpha(accent, '25') }]}>
                    <View style={[styles.barFill, { width: `${progress * 100}%` as any, backgroundColor: accent }]} />
                </View>
            )}
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: -6 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    metric: {
        width: '47.5%',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 4,
    },
    metricIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    metricLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
    metricValue: { fontSize: 20, fontWeight: '900' },
    metricSub: { fontSize: 11 },
    bar: { height: 4, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
    barFill: { height: 4, borderRadius: 4 },
    eStop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
    },
    eStopText: { flex: 1, gap: 3 },
    eStopTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    eStopSub: { fontSize: 11, lineHeight: 16 },
    navList: { gap: 0 },
});
