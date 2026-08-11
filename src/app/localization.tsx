import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import { MOCK_POSE } from '../data/mock';

export default function LocalizationScreen() {
    const { colors } = getRobotTheme();
    const pose = MOCK_POSE;

    const confidencePct = Math.round(pose.confidence * 100);

    return (
        <AppScreen>
            {/* ── Header ── */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Localization</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Robot pose in world frame</Text>
                </View>
                <View style={styles.headerPills}>
                    <StatusPill label={pose.status} tone={pose.status === 'LOCALIZED' ? 'success' : 'danger'} dot />
                    <StatusPill label="MOCK" tone="warning" />
                </View>
            </View>

            {/* ── Pose values ── */}
            <View style={[styles.poseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.poseCardTitle, { color: colors.textDim }]}>POSITION (meters)</Text>
                <View style={styles.poseGrid}>
                    <PoseValue axis="X" value={pose.x} unit="m" color={colors.danger} colors={colors} />
                    <View style={[styles.poseSep, { backgroundColor: colors.border }]} />
                    <PoseValue axis="Y" value={pose.y} unit="m" color={colors.success} colors={colors} />
                    <View style={[styles.poseSep, { backgroundColor: colors.border }]} />
                    <PoseValue axis="Z" value={0} unit="m" color={colors.primary} colors={colors} fixed={1} />
                </View>
            </View>

            <View style={[styles.poseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.poseCardTitle, { color: colors.textDim }]}>ORIENTATION (degrees)</Text>
                <View style={styles.poseGrid}>
                    <PoseValue axis="Roll" value={0} unit="°" color={colors.warning} colors={colors} fixed={1} />
                    <View style={[styles.poseSep, { backgroundColor: colors.border }]} />
                    <PoseValue axis="Pitch" value={0} unit="°" color={colors.warning} colors={colors} fixed={1} />
                    <View style={[styles.poseSep, { backgroundColor: colors.border }]} />
                    <PoseValue axis="Yaw" value={pose.yaw} unit="°" color={colors.primary} colors={colors} />
                </View>
            </View>

            {/* ── Meta info ── */}
            <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MetaRow icon="layers" label="Reference Frame" value={pose.frame} colors={colors} />
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <MetaRow icon="gps-fixed" label="Localization" value={pose.status} colors={colors} />
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <MetaRow icon="access-time" label="Last Update" value={new Date(pose.lastUpdate).toLocaleTimeString()} colors={colors} />
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <View style={styles.metaRow}>
                    <View style={styles.metaLeft}>
                        <MaterialIcons name="bar-chart" size={15} color={colors.textDim} />
                        <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Confidence</Text>
                    </View>
                    <View style={styles.confidenceRight}>
                        <Text style={[styles.metaValue, { color: colors.text }]}>{confidencePct}%</Text>
                        <View style={[styles.confBar, { backgroundColor: withAlpha(colors.success, '25') }]}>
                            <View style={[styles.confFill, { width: `${confidencePct}%` as any, backgroundColor: colors.success }]} />
                        </View>
                    </View>
                </View>
            </View>

            {/* ── Mini-map ── */}
            <View style={[styles.miniMapWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.miniMapTitle, { color: colors.textDim }]}>MINI MAP — ROBOT POSITION</Text>
                <View style={[styles.miniMap, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
                    {/* Grid */}
                    {[25, 50, 75].map(p => (
                        <View key={`h${p}`} style={[styles.gridH, { top: `${p}%` as any, backgroundColor: withAlpha(colors.border, 'AA') }]} />
                    ))}
                    {[25, 50, 75].map(p => (
                        <View key={`v${p}`} style={[styles.gridV, { left: `${p}%` as any, backgroundColor: withAlpha(colors.border, 'AA') }]} />
                    ))}
                    {/* Robot marker at approx center */}
                    <View style={[styles.robotDot, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                        <MaterialCommunityIcons name="robot" size={10} color="#fff" />
                    </View>
                    {/* Pulse */}
                    <View style={[styles.robotPulse, { borderColor: withAlpha(colors.primary, '40') }]} />
                    {/* Yaw indicator */}
                    <View style={[styles.yawArrow, {
                        borderBottomColor: colors.primary,
                        transform: [{ rotate: `${pose.yaw}deg` }],
                    }]} />
                    {/* Axes labels */}
                    <Text style={[styles.axisX, { color: colors.textDim }]}>X+</Text>
                    <Text style={[styles.axisY, { color: colors.textDim }]}>Y+</Text>
                </View>
            </View>

            {/* ── Coordinate info ── */}
            <View style={[styles.coordNote, { backgroundColor: withAlpha(colors.primary, '10'), borderColor: withAlpha(colors.primary, '30') }]}>
                <MaterialIcons name="info-outline" size={15} color={colors.primary} />
                <Text style={[styles.coordNoteText, { color: colors.textMuted }]}>
                    Pose published on /robot_pose (ROS 2). Frame: {pose.frame}. Real data streams via GET /robot/pose when backend is connected. All values shown are mock.
                </Text>
            </View>
        </AppScreen>
    );
}

// ── Sub-components ──────────────────────────────────────────

function PoseValue({ axis, value, unit, color, colors, fixed = 2 }: {
    axis: string; value: number; unit: string; color: string; colors: any; fixed?: number;
}) {
    return (
        <View style={styles.poseValue}>
            <Text style={[styles.poseAxis, { color }]}>{axis}</Text>
            <Text style={[styles.poseNum, { color: colors.text }]}>{value >= 0 ? '+' : ''}{value.toFixed(fixed)}</Text>
            <Text style={[styles.poseUnit, { color: colors.textDim }]}>{unit}</Text>
        </View>
    );
}

function MetaRow({ icon, label, value, colors }: { icon: any; label: string; value: string; colors: any }) {
    return (
        <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
                <MaterialIcons name={icon} size={15} color={colors.textDim} />
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{label}</Text>
            </View>
            <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerPills: { gap: 6, alignItems: 'flex-end' },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13, marginTop: 2 },
    poseCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
    poseCardTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    poseGrid: { flexDirection: 'row', alignItems: 'stretch' },
    poseSep: { width: 1 },
    poseValue: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
    poseAxis: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    poseNum: { fontSize: 22, fontWeight: '900' },
    poseUnit: { fontSize: 11 },
    metaCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13 },
    metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaLabel: { fontSize: 13 },
    metaValue: { fontSize: 13, fontWeight: '700' },
    metaDivider: { height: 1 },
    confidenceRight: { alignItems: 'flex-end', gap: 4 },
    confBar: { width: 80, height: 4, borderRadius: 4, overflow: 'hidden' },
    confFill: { height: 4, borderRadius: 4 },
    miniMapWrap: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
    miniMapTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    miniMap: { height: 180, borderWidth: 1, borderRadius: 10, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
    gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
    gridV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
    robotDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    robotPulse: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1.5 },
    yawArrow: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        top: '30%',
        zIndex: 3,
    },
    axisX: { position: 'absolute', right: 8, bottom: 8, fontSize: 10, fontWeight: '700' },
    axisY: { position: 'absolute', left: 8, top: 8, fontSize: 10, fontWeight: '700' },
    coordNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
    coordNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
