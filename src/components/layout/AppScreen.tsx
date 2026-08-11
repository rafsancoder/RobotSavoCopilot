import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { getRobotTheme } from '../../constants/theme';

type AppScreenProps = PropsWithChildren<{
    scroll?: boolean;
    padded?: boolean;
}>;

export function AppScreen({ children, scroll = true, padded = true }: AppScreenProps) {
    const { colors } = getRobotTheme();

    const inner = (
        <View style={[styles.content, !padded && styles.noPad]}>
            {children}
        </View>
    );

    if (!scroll) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
                {inner}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[styles.scroll, !padded && styles.noPad]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {inner}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 32 },
    content: { width: '100%', maxWidth: 900, alignSelf: 'center', gap: 16 },
    noPad: { padding: 0 },
});
