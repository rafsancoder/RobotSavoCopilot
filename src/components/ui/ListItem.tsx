import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getRobotTheme, withAlpha } from '../../constants/theme';

type ListItemProps = {
    title: string;
    subtitle?: string;
    href: string;
    icon?: React.ReactNode;
};

export function ListItem({ title, subtitle, href, icon }: ListItemProps) {
    const { colors } = getRobotTheme();

    return (
        <Link href={href as never} asChild>
            <Pressable
                style={({ pressed }) => [
                    styles.item,
                    {
                        backgroundColor: pressed ? colors.surfaceSoft : colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={[styles.iconWrap, { backgroundColor: withAlpha(colors.primary, '20') }]}>
                    {icon ?? <MaterialIcons name="place" size={20} color={colors.primary} />}
                </View>
                <View style={styles.textWrap}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textDim} />
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    title: { fontSize: 15, fontWeight: '800' },
    subtitle: { fontSize: 12, marginTop: 2 },
});
