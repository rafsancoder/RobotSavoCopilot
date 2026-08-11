import { StyleSheet, Text, View } from 'react-native';
import { getRobotTheme, withAlpha } from '../../constants/theme';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type StatusPillProps = {
    label: string;
    tone?: StatusTone;
    icon?: React.ReactNode;
    dot?: boolean;
};

export function StatusPill({ label, tone = 'neutral', icon, dot }: StatusPillProps) {
    const { colors } = getRobotTheme();

    const color =
        tone === 'success' ? colors.success :
        tone === 'warning' ? colors.warning :
        tone === 'danger'  ? colors.danger  :
        tone === 'info'    ? colors.primary  :
                             colors.textMuted;

    return (
        <View style={[styles.pill, { backgroundColor: withAlpha(color, '18'), borderColor: withAlpha(color, '50') }]}>
            {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
        gap: 5,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 999,
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
