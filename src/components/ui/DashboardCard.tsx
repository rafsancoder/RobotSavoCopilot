import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getRobotTheme } from '../../constants/theme';

type DashboardCardProps = {
    title: string;
    subtitle: string;
    href: string;
};

export function DashboardCard({ title, subtitle, href }: DashboardCardProps) {
    const theme = getRobotTheme();

    return (
        <Link href={href as never} asChild>
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.75 : 1
                    }
                ]}
            >
                <View style={styles.cardInner}>
                    <View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
                    </View>

                    <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>{'›'}</Text>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
        minHeight: 96,
        justifyContent: 'center',
        flexBasis: '48%',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    cardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 6
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18
    },
    chevron: {
        fontSize: 20,
        fontWeight: '800'
    }
});