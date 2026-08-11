import { StyleSheet, Text, View } from 'react-native';
import { getRobotTheme } from '../../constants/theme';
import { AppScreen } from './AppScreen';

type PlaceholderScreenProps = {
    title: string;
    subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
    const theme = getRobotTheme();

    return (
        <AppScreen>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border
                    }
                ]}
            >
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {title}
                </Text>

                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                    {subtitle}
                </Text>
            </View>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        minHeight: 160,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24
    }
});