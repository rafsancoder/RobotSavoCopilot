import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';

type InfoCardProps = {
    icon: string;
    iconLib?: 'material' | 'community';
    title: string;
    accent: string;
    children: React.ReactNode;
};

function InfoCard({ icon, iconLib = 'material', title, accent, children }: InfoCardProps) {
    const { colors } = getRobotTheme();
    const Icon = iconLib === 'community' ? MaterialCommunityIcons : MaterialIcons;
    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: withAlpha(accent, '22') }]}>
                    <Icon name={icon as any} size={18} color={accent} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
            <View style={styles.cardBody}>{children}</View>
        </View>
    );
}

function BulletRow({ text, color }: { text: string; color: string }) {
    const { colors } = getRobotTheme();
    return (
        <View style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: color }]} />
            <Text style={[styles.bulletText, { color: colors.textMuted }]}>{text}</Text>
        </View>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    const { colors } = getRobotTheme();
    return (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textDim }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

export default function RobotDescriptionScreen() {
    const { colors } = getRobotTheme();

    return (
        <AppScreen>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Robot Savo 2.0</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Technical specifications and system overview</Text>
                </View>
                <StatusPill label="MOCK DATA" tone="info" />
            </View>

            {/* ── Overview ── */}
            <InfoCard icon="info" title="Overview" accent={colors.primary}>
                <InfoRow label="Name" value="Savo Robot 2.0" />
                <InfoRow label="Type" value="Autonomous Indoor Guide Robot" />
                <InfoRow label="Middleware" value="ROS 2 (Humble)" />
                <InfoRow label="Compute" value="NVIDIA Jetson + Intel NUC" />
                <InfoRow label="Height" value="~120 cm" />
                <InfoRow label="Weight" value="~45 kg" />
            </InfoCard>

            {/* ── Purpose ── */}
            <InfoCard icon="flag" title="Purpose" accent={colors.robotBlue}>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    Robot Savo is designed for autonomous indoor guidance — navigating corridors, assisting visitors, and serving as an intelligent building companion in educational and public facilities.
                </Text>
                <BulletRow text="Indoor autonomous navigation" color={colors.robotBlue} />
                <BulletRow text="Human-robot interaction via voice and display" color={colors.robotBlue} />
                <BulletRow text="Smart building integration" color={colors.robotBlue} />
                <BulletRow text="Emergency guidance support" color={colors.robotBlue} />
            </InfoCard>

            {/* ── Hardware ── */}
            <InfoCard icon="memory" title="Hardware" accent={colors.success}>
                <InfoRow label="Drive system" value="Differential drive" />
                <InfoRow label="Motors" value="Brushless DC × 2" />
                <InfoRow label="Battery" value="24V Li-ion, ~4h runtime" />
                <InfoRow label="Display" value={'10" touchscreen'} />
                <InfoRow label="Speaker" value="Stereo 2×10W" />
                <InfoRow label="Connectivity" value="Wi-Fi 5 + Ethernet" />
            </InfoCard>

            {/* ── Sensors ── */}
            <InfoCard icon="sensors" title="Sensors" accent={colors.warning}>
                <BulletRow text="2D LiDAR — SLAM mapping & obstacle detection" color={colors.warning} />
                <BulletRow text="RGB-D Camera — depth & object recognition" color={colors.warning} />
                <BulletRow text="Ultrasonic × 4 — close-range collision avoidance" color={colors.warning} />
                <BulletRow text="IMU (6-DOF) — orientation & movement" color={colors.warning} />
                <BulletRow text="Wheel encoders — odometry" color={colors.warning} />
                <BulletRow text="Microphone array — voice command input" color={colors.warning} />
            </InfoCard>

            {/* ── Software ── */}
            <InfoCard icon="code" title="Software Stack" accent={colors.primary}>
                <InfoRow label="OS" value="Ubuntu 22.04 LTS" />
                <InfoRow label="Robot middleware" value="ROS 2 Humble" />
                <InfoRow label="Simulation" value="Gazebo + RViz 2" />
                <InfoRow label="Backend API" value="FastAPI (Python)" />
                <InfoRow label="App framework" value="React Native + Expo" />
                <InfoRow label="AI / NLP" value="LLM via HTTP API" />
            </InfoCard>

            {/* ── Navigation ── */}
            <InfoCard icon="navigation" iconLib="material" title="Navigation" accent={colors.robotBlue}>
                <BulletRow text="ROS 2 Nav2 — navigation stack" color={colors.robotBlue} />
                <BulletRow text="SLAM Toolbox — simultaneous localization and mapping" color={colors.robotBlue} />
                <BulletRow text="A* — global path planning" color={colors.robotBlue} />
                <BulletRow text="DWA — dynamic window approach (local planner)" color={colors.robotBlue} />
                <BulletRow text="Costmap 2D — obstacle inflation layers" color={colors.robotBlue} />
                <BulletRow text="AMCL — adaptive Monte Carlo localization" color={colors.robotBlue} />
            </InfoCard>

            {/* ── AI System ── */}
            <InfoCard icon="brain" iconLib="community" title="AI System" accent={colors.success}>
                <Text style={[styles.paragraph, { color: colors.textMuted }]}>
                    Savo uses a multi-layer AI pipeline for natural language understanding, task planning, and safe command execution.
                </Text>
                <BulletRow text="STT (Speech-to-Text) — voice command recognition" color={colors.success} />
                <BulletRow text="LLM — intent parsing and response generation" color={colors.success} />
                <BulletRow text="TTS — robot voice output" color={colors.success} />
                <BulletRow text="Behavior tree — task sequencing in ROS 2" color={colors.success} />
            </InfoCard>

            {/* ── Safety ── */}
            <InfoCard icon="shield" iconLib="community" title="Safety System" accent={colors.danger}>
                <BulletRow text="Hardware emergency stop button — physical cutoff" color={colors.danger} />
                <BulletRow text="Software safety stop — ROS 2 topic trigger" color={colors.danger} />
                <BulletRow text="Collision detection safety zones (LiDAR zones)" color={colors.danger} />
                <BulletRow text="Velocity limits enforced by backend — not the app" color={colors.danger} />
                <BulletRow text="Watchdog node — detects communication loss" color={colors.danger} />
                <Text style={[styles.safetyNote, { color: colors.textDim, borderColor: withAlpha(colors.danger, '30') }]}>
                    This app sends command requests only. ROS 2 core is the single authority over motor control and safety enforcement.
                </Text>
            </InfoCard>

            {/* ── Future ── */}
            <InfoCard icon="rocket-launch" iconLib="community" title="Future Development" accent={colors.primary}>
                <BulletRow text="3D LiDAR integration" color={colors.primary} />
                <BulletRow text="Elevator and door control via IoT" color={colors.primary} />
                <BulletRow text="Multi-robot fleet coordination" color={colors.primary} />
                <BulletRow text="On-device LLM for offline AI" color={colors.primary} />
                <BulletRow text="Facial recognition for personalized guidance" color={colors.primary} />
                <BulletRow text="Real-time map sharing with building dashboard" color={colors.primary} />
            </InfoCard>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13, marginTop: 2 },
    card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    cardIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '800' },
    cardDivider: { height: 1 },
    cardBody: { padding: 14, gap: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    infoLabel: { fontSize: 13 },
    infoValue: { fontSize: 13, fontWeight: '700' },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
    bulletText: { flex: 1, fontSize: 13, lineHeight: 20 },
    paragraph: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
    safetyNote: { fontSize: 12, lineHeight: 18, borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 4 },
});
