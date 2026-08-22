import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import {
    buildServerEndpoints,
    DEFAULT_SERVER_CONFIG,
    ServerConfig,
    validateServerConfig,
} from '../utils/server-config';
import { checkSavoMind, loadPlaybackTarget, loadServerConfig, PlaybackTarget, savePlaybackTarget, saveServerConfig } from '../services/savomind-api';

export default function SettingsScreen() {
    const { colors } = getRobotTheme();
    const [config, setConfig] = useState<ServerConfig>(DEFAULT_SERVER_CONFIG);
    const [saved, setSaved] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [connected, setConnected] = useState<boolean | null>(null);
    const [playbackTarget, setPlaybackTarget] = useState<PlaybackTarget>('phone');

    const { savoMindUrl } = buildServerEndpoints(config);

    useEffect(() => {
        async function loadConfig() {
            try {
                const [storedConfig, storedPlaybackTarget] = await Promise.all([loadServerConfig(), loadPlaybackTarget()]);
                setConfig(storedConfig);
                setPlaybackTarget(storedPlaybackTarget);
            } catch {
                Alert.alert('Settings Error', 'Saved server settings could not be loaded. Defaults are being used.');
            } finally {
                setLoaded(true);
            }
        }
        void loadConfig();
    }, []);

    function updateConfig(patch: Partial<ServerConfig>) {
        setConfig(current => ({ ...current, ...patch }));
        setSaved(false);
        setConnected(null);
    }

    async function handleSave() {
        const error = validateServerConfig(config);
        if (error) {
            Alert.alert('Invalid Configuration', error);
            return;
        }
        try {
            await Promise.all([saveServerConfig(config), savePlaybackTarget(playbackTarget)]);
            setSaved(true);
            Alert.alert('Settings Saved', 'Configuration will be restored the next time the app starts.');
        } catch {
            Alert.alert('Save Failed', 'The configuration could not be saved on this device.');
        }
    }

    async function handleTest() {
        const error = validateServerConfig(config);
        if (error) {
            Alert.alert('Invalid Configuration', error);
            return;
        }
        try {
            const ok = await checkSavoMind(config);
            setConnected(ok);
            Alert.alert(ok ? 'Connected' : 'Not Ready', ok ? `SavoMind is reachable at ${savoMindUrl}.` : 'SavoMind did not report healthy.');
        } catch (connectionError) {
            setConnected(false);
            Alert.alert('Connection Failed', connectionError instanceof Error ? connectionError.message : `Could not reach ${savoMindUrl}.`);
        }
    }

    return (
        <AppScreen>
            {/* ── Header ── */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Server connection configuration</Text>
                </View>
                <StatusPill label={connected === true ? 'CONNECTED' : connected === false ? 'OFFLINE' : 'NOT TESTED'} tone={connected === true ? 'success' : connected === false ? 'danger' : 'warning'} dot />
            </View>

            {/* ── Server config ── */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="server-network" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Server Configuration</Text>
                </View>
                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

                <Field
                    label="SavoMind Base URL"
                    placeholder="http://10.149.45.61:8001"
                    value={config.savoMindBaseUrl}
                    onChangeText={value => updateConfig({ savoMindBaseUrl: value })}
                    icon="language"
                    keyboardType="url"
                    colors={colors}
                />
                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.outputLabel, { color: colors.textMuted }]}>Speaker output</Text>
                <View style={styles.protocolRow}>
                    {(['phone', 'robot'] as PlaybackTarget[]).map(option => (
                        <Pressable
                            key={option}
                            onPress={() => { setPlaybackTarget(option); setSaved(false); }}
                            accessibilityRole="radio"
                            accessibilityLabel={option === 'phone' ? 'Phone speaker' : 'Robot speaker'}
                            accessibilityState={{ checked: playbackTarget === option }}
                            style={[
                                styles.protocolButton,
                                {
                                    backgroundColor: playbackTarget === option ? withAlpha(colors.primary, '20') : colors.surfaceSoft,
                                    borderColor: playbackTarget === option ? colors.primary : colors.border,
                                },
                            ]}
                        >
                            <Text style={[styles.protocolText, { color: playbackTarget === option ? colors.primary : colors.textMuted }]}>
                                {option === 'phone' ? 'Phone speaker' : 'Robot speaker'}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <Text style={[styles.insecureWarning, { color: colors.warning }]}>HTTP traffic is unencrypted. Use only on the trusted robot network.</Text>
            </View>

            {/* ── Endpoint preview ── */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="link" size={16} color={colors.textMuted} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Endpoint Preview</Text>
                </View>
                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                <EndpointRow label="SavoMind" url={savoMindUrl} colors={colors} />
                <View style={[styles.endpointDivider, { backgroundColor: colors.border }]} />
                <EndpointRow label="Text" url={`${savoMindUrl}/app/chat`} colors={colors} />
                <View style={[styles.endpointDivider, { backgroundColor: colors.border }]} />
                <EndpointRow label="Voice" url={`${savoMindUrl}/app/voice/turn`} colors={colors} />
            </View>

            {/* ── Buttons ── */}
            <Pressable
                onPress={() => void handleSave()}
                disabled={!loaded}
                accessibilityRole="button"
                accessibilityLabel="Save server configuration"
                accessibilityState={{ disabled: !loaded }}
                style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: saved ? colors.success : colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
            >
                <MaterialIcons name={saved ? 'check' : 'save'} size={18} color="#fff" />
                <Text style={styles.btnText}>{saved ? 'Saved' : 'Save Configuration'}</Text>
            </Pressable>

            <Pressable
                onPress={() => void handleTest()}
                accessibilityRole="button"
                accessibilityLabel="Test server connection"
                style={({ pressed }) => [
                    styles.btnOutline,
                    { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
            >
                <MaterialIcons name="wifi-tethering" size={18} color={colors.primary} />
                <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Test Connection</Text>
            </Pressable>

            {/* ── API Plan ── */}
            <View style={[styles.apiPlan, { backgroundColor: withAlpha(colors.primary, '10'), borderColor: withAlpha(colors.primary, '30') }]}>
                <View style={styles.apiPlanHeader}>
                    <MaterialIcons name="api" size={15} color={colors.primary} />
                    <Text style={[styles.apiPlanTitle, { color: colors.primary }]}>Live SavoMind API</Text>
                </View>
                {[
                    { method: 'GET', path: '/robot/status', desc: 'Robot status, mode, battery' },
                    { method: 'GET', path: '/robot/pose', desc: 'X, Y, yaw, frame, localization' },
                    { method: 'POST', path: '/app/chat', desc: 'Full SavoMind text pipeline' },
                    { method: 'POST', path: '/app/voice/turn', desc: 'STT, intelligence, and TTS pipeline' },
                ].map(e => (
                    <View key={e.path} style={styles.apiRow}>
                        <View style={[styles.apiMethod, { backgroundColor: withAlpha(e.method === 'GET' ? colors.success : colors.warning, '25') }]}>
                            <Text style={[styles.apiMethodText, { color: e.method === 'GET' ? colors.success : colors.warning }]}>{e.method}</Text>
                        </View>
                        <View style={styles.apiInfo}>
                            <Text style={[styles.apiPath, { color: colors.text }]}>{e.path}</Text>
                            <Text style={[styles.apiDesc, { color: colors.textMuted }]}>{e.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* ── Safety note ── */}
            <View style={[styles.safetyNote, { backgroundColor: withAlpha(colors.danger, '10'), borderColor: withAlpha(colors.danger, '30') }]}>
                <MaterialIcons name="security" size={15} color={colors.danger} />
                <Text style={[styles.safetyText, { color: colors.textMuted }]}>
                    Movement and stop commands are sent only as safe backend requests. ROS 2 core enforces safety — the app never directly controls motors.
                </Text>
            </View>
        </AppScreen>
    );
}

// ── Sub-components ──────────────────────────────────────────

function Field({ label, placeholder, value, onChangeText, icon, keyboardType, colors }: {
    label: string; placeholder: string; value: string; onChangeText: (v: string) => void;
    icon: any; keyboardType?: any; colors: any;
}) {
    return (
        <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
            <View style={[styles.fieldInput, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
                <MaterialIcons name={icon} size={16} color={colors.textDim} />
                <TextInput
                    style={[styles.fieldText, { color: colors.text }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textDim}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
        </View>
    );
}

function EndpointRow({ label, url, colors }: { label: string; url: string; colors: any }) {
    return (
        <View style={styles.endpointRow}>
            <Text style={[styles.endpointLabel, { color: colors.textDim }]}>{label}</Text>
            <Text style={[styles.endpointUrl, { color: colors.primary }]} numberOfLines={1}>{url}</Text>
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13, marginTop: 2 },
    section: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
    sectionTitle: { fontSize: 14, fontWeight: '800' },
    sectionDivider: { height: 1 },
    field: { padding: 14, gap: 6, borderBottomWidth: 0 },
    fieldLabel: { fontSize: 12, fontWeight: '600' },
    outputLabel: { fontSize: 12, fontWeight: '600', paddingHorizontal: 14, paddingTop: 14 },
    fieldInput: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    fieldText: { flex: 1, fontSize: 14 },
    protocolRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 6 },
    protocolButton: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center' },
    protocolText: { fontSize: 11, fontWeight: '800' },
    insecureWarning: { fontSize: 11, lineHeight: 16, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14 },
    endpointRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    endpointLabel: { fontSize: 13, minWidth: 80 },
    endpointUrl: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' },
    endpointDivider: { height: 1, marginHorizontal: 14 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        paddingVertical: 15,
    },
    btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    btnOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1.5,
    },
    btnOutlineText: { fontSize: 15, fontWeight: '800' },
    apiPlan: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
    apiPlanHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    apiPlanTitle: { fontSize: 13, fontWeight: '800' },
    apiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    apiMethod: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, minWidth: 46, alignItems: 'center' },
    apiMethodText: { fontSize: 10, fontWeight: '900' },
    apiInfo: { flex: 1 },
    apiPath: { fontSize: 12, fontWeight: '700' },
    apiDesc: { fontSize: 11, marginTop: 1 },
    safetyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
    safetyText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
