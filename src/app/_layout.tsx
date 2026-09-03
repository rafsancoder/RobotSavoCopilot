import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getRobotTheme } from '../constants/theme';

export default function RootLayout() {
    const { colors } = getRobotTheme();

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontWeight: '800', fontSize: 17 },
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Robot Savo Copilot' }} />
                <Stack.Screen name="map" options={{ title: 'Map View' }} />
                <Stack.Screen name="voice" options={{ title: 'Voice Command' }} />
                <Stack.Screen name="chat" options={{ title: 'AI Chatbot' }} />
                <Stack.Screen name="robot" options={{ title: 'Robot Description' }} />
                <Stack.Screen name="localization" options={{ title: 'Localization' }} />
                <Stack.Screen name="sensors" options={{ title: 'Live Sensors' }} />
                <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            </Stack>
        </>
    );
}
