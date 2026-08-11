import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { getRobotTheme, radius, withAlpha } from '../../constants/theme';

type HeroCardProps = {
    title?: string;
    subtitle?: string;
    online?: boolean;
};

export function HeroCard({
    title = 'Robot Savo Copilot',
    subtitle = 'Autonomous indoor guide robot — monitoring and control dashboard.',
    online = true,
}: HeroCardProps) {
    const { colors } = getRobotTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.left}>
                <Text style={[styles.kicker, { color: colors.primary }]}>SAVO ROBOT 2.0</Text>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
                <View style={[styles.accent, { backgroundColor: colors.primary }]} />
            </View>

            <View style={styles.right}>
                <View style={[styles.iconCircle, { backgroundColor: withAlpha(colors.primary, '18'), borderColor: withAlpha(colors.primary, '40') }]}>
                    <MaterialCommunityIcons name="robot" size={38} color={colors.primary} />
                </View>
                <View style={[styles.onlineBadge, { backgroundColor: online ? colors.success : colors.danger }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radius.xl,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
    },
    left: { flex: 1, gap: 6 },
    kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    title: { fontSize: 26, fontWeight: '900', lineHeight: 32 },
    subtitle: { fontSize: 13, lineHeight: 19, marginTop: 2 },
    accent: { width: 28, height: 3, borderRadius: 4, marginTop: 8 },
    right: { alignItems: 'center', gap: 6 },
    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
