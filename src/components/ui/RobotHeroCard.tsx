import { Image, StyleSheet, Text, View } from 'react-native';
import { getRobotTheme, withAlpha } from '../../constants/theme';

export function RobotHeroCard() {
    const { colors } = getRobotTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.glowRing,  { borderColor: withAlpha(colors.primary, '22') }]} />
            <View style={[styles.glowBlob1, { backgroundColor: withAlpha(colors.primary, '18') }]} />
            <View style={[styles.glowBlob2, { backgroundColor: withAlpha(colors.robotBlue, '28') }]} />
            <View style={styles.row}>
                <View style={styles.left}>
                    <View style={[styles.kickerBadge, { backgroundColor: withAlpha(colors.primary, '18'), borderColor: withAlpha(colors.primary, '45') }]}>
                        <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.kickerText, { color: colors.primary }]}>SAVO ROBOT 2.0</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>{'Robot Savo\nCopilot'}</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Autonomous indoor guide robot monitoring and communication dashboard.</Text>
                    <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
                </View>
                <View style={styles.right}>
                    {/* Glow behind the robot */}
                    <View style={[styles.glowCenter, { backgroundColor: withAlpha(colors.primary, '30') }]} />
                    <View style={[styles.glowOuter,  { backgroundColor: withAlpha(colors.primary, '12') }]} />
                    <Image
                        source={require('../../../assets/images/robot-savo-real.jpg')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden', height: 220 },
    glowRing:  { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, right: -30, top: -30 },
    glowBlob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, right: -10, top: 0 },
    glowBlob2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, right: 20, bottom: -20 },
    row: { flexDirection: 'row', flex: 1 },
    left: { flex: 1, padding: 18, paddingRight: 10, justifyContent: 'center', gap: 8 },
    kickerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    kickerDot: { width: 5, height: 5, borderRadius: 3 },
    kickerText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
    title:    { fontSize: 24, fontWeight: '900', lineHeight: 29 },
    subtitle: { fontSize: 11, lineHeight: 17 },
    accentLine: { width: 34, height: 3, borderRadius: 4, marginTop: 2 },
    // Right: robot photo — fixed width, image anchored to bottom
    right: { width: '44%', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
    glowCenter: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
    glowOuter:  { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
    image: { width: 170, height: 200, marginBottom: -8 },
});
