import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import { MOCK_POSE } from '../data/mock';

export default function MapScreen() {
    const { colors } = getRobotTheme();
    const pose = MOCK_POSE;

    return (
        <AppScreen>
            {/* ── Header ── */}
            <View style={styles.headerRow}>
                <View style={styles.headerText}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Indoor Map</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Floor plan — Building A</Text>
                </View>
                <StatusPill label="MOCK DATA" tone="warning" />
            </View>

            {/* ── Map canvas ── */}
            <View style={[styles.mapCanvas, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Grid overlay */}
                <GridLines color={withAlpha(colors.border, '80')} />

                {/* Rooms */}
                <Room label="A201" style={{ top: '12%', left: '8%', width: '36%', height: '30%' }} colors={colors} />
                <Room label="A202" style={{ top: '12%', right: '8%', width: '36%', height: '30%' }} colors={colors} />
                <Room label="A203" style={{ bottom: '12%', left: '8%', width: '36%', height: '28%' }} colors={colors} />
                <Room label="A204" style={{ bottom: '12%', right: '8%', width: '36%', height: '28%' }} colors={colors} />

                {/* Corridor label */}
                <View style={styles.corridorLabel}>
                    <Text style={[styles.corridorText, { color: colors.textDim }]}>CORRIDOR</Text>
                </View>

                {/* Robot marker */}
                <View style={styles.robotMarker}>
                    <View style={[styles.robotCircle, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                        <MaterialCommunityIcons name="robot" size={14} color="#fff" />
                    </View>
                    {/* Direction arrow */}
                    <View style={[styles.dirArrow, { borderBottomColor: colors.primary, transform: [{ rotate: `${pose.yaw}deg` }] }]} />
                    {/* Pulse ring */}
                    <View style={[styles.pulseRing, { borderColor: withAlpha(colors.primary, '40') }]} />
                </View>

                {/* Goal marker placeholder */}
                <View style={[styles.goalMarker, { borderColor: colors.warning }]}>
                    <MaterialIcons name="flag" size={12} color={colors.warning} />
                </View>

                {/* Path placeholder */}
                <View style={[styles.pathLine, { backgroundColor: withAlpha(colors.primary, '40') }]} />
            </View>

            {/* ── Legend ── */}
            <View style={[styles.legend, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <LegendItem color={colors.primary} label="Robot (Savo)" icon="robot" />
                <LegendItem color={colors.warning} label="Goal marker" icon="flag" />
                <LegendItem color={withAlpha(colors.primary, '60')} label="Planned path" icon="timeline" />
            </View>

            {/* ── Pose quick-view ── */}
            <View style={[styles.poseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <PoseStat label="X" value={`${pose.x}m`} color={colors.primary} />
                <View style={[styles.poseDivider, { backgroundColor: colors.border }]} />
                <PoseStat label="Y" value={`${pose.y}m`} color={colors.primary} />
                <View style={[styles.poseDivider, { backgroundColor: colors.border }]} />
                <PoseStat label="Yaw" value={`${pose.yaw}°`} color={colors.primary} />
                <View style={[styles.poseDivider, { backgroundColor: colors.border }]} />
                <PoseStat label="Frame" value={pose.frame} color={colors.textMuted} />
            </View>

            {/* ── Backend note ── */}
            <View style={[styles.note, { backgroundColor: withAlpha(colors.warning, '12'), borderColor: withAlpha(colors.warning, '40') }]}>
                <MaterialIcons name="info-outline" size={16} color={colors.warning} />
                <Text style={[styles.noteText, { color: colors.textMuted }]}>
                    Real map will stream from ROS 2 via WebSocket when backend is connected. All data shown is mock.
                </Text>
            </View>
        </AppScreen>
    );
}

// ── Sub-components ──────────────────────────────────────────

function GridLines({ color }: { color: string }) {
    const hLines = [25, 50, 75];
    const vLines = [25, 50, 75];
    return (
        <>
            {hLines.map(p => (
                <View key={`h${p}`} style={[styles.gridH, { top: `${p}%` as any, backgroundColor: color }]} />
            ))}
            {vLines.map(p => (
                <View key={`v${p}`} style={[styles.gridV, { left: `${p}%` as any, backgroundColor: color }]} />
            ))}
        </>
    );
}

function Room({ label, style, colors }: { label: string; style: any; colors: any }) {
    return (
        <View style={[styles.room, style, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}>
            <Text style={[styles.roomLabel, { color: colors.textDim }]}>{label}</Text>
        </View>
    );
}

function LegendItem({ color, label, icon }: { color: string; label: string; icon: any }) {
    const { colors } = getRobotTheme();
    return (
        <View style={styles.legendItem}>
            <MaterialIcons name={icon} size={14} color={color} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

function PoseStat({ label, value, color }: { label: string; value: string; color: string }) {
    const { colors } = getRobotTheme();
    return (
        <View style={styles.poseStat}>
            <Text style={[styles.poseLabel, { color: colors.textDim }]}>{label}</Text>
            <Text style={[styles.poseValue, { color }]}>{value}</Text>
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    headerText: { gap: 2 },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13 },
    mapCanvas: {
        height: 320,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    gridH: { position: 'absolute', left: 0, right: 0, height: 1 },
    gridV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
    room: {
        position: 'absolute',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roomLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    corridorLabel: {
        position: 'absolute',
        top: '45%',
        alignSelf: 'center',
    },
    corridorText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
    robotMarker: {
        position: 'absolute',
        top: '47%',
        left: '46%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    robotCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    dirArrow: {
        position: 'absolute',
        top: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    pulseRing: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
    },
    goalMarker: {
        position: 'absolute',
        bottom: '25%',
        right: '20%',
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pathLine: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 60,
        height: 2,
        borderRadius: 2,
        transform: [{ rotate: '-30deg' }],
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        flexWrap: 'wrap',
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendText: { fontSize: 12 },
    poseRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    poseStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    poseDivider: { width: 1 },
    poseLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    poseValue: { fontSize: 15, fontWeight: '900', marginTop: 2 },
    note: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
