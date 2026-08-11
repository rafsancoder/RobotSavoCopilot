import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import { VOICE_EXAMPLE_COMMANDS, getMockVoiceResponse } from '../data/mock';

export default function VoiceScreen() {
    const { colors } = getRobotTheme();
    const [input, setInput] = useState('');
    const [recognized, setRecognized] = useState('');
    const [reply, setReply] = useState('');
    const [active, setActive] = useState(false);

    function handleSend(text = input) {
        const trimmed = text.trim();
        if (!trimmed) return;
        setRecognized(trimmed);
        setReply(getMockVoiceResponse(trimmed));
        setInput('');
    }

    function handleMicPress() {
        setActive(a => !a);
        if (!active) {
            setRecognized('[MOCK] STT not connected yet — type a command below.');
            setReply('');
        }
    }

    return (
        <AppScreen>
            {/* ── Header ── */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Voice Command</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Type or tap mic to send commands</Text>
                </View>
                <StatusPill label="MOCK MODE" tone="warning" />
            </View>

            {/* ── Mic button ── */}
            <View style={styles.micSection}>
                <Pressable
                    onPress={handleMicPress}
                    accessibilityRole="button"
                    accessibilityLabel={active ? 'Stop mock microphone' : 'Activate mock microphone'}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                        styles.micOuter,
                        {
                            backgroundColor: withAlpha(active ? colors.danger : colors.primary, '18'),
                            borderColor: withAlpha(active ? colors.danger : colors.primary, '60'),
                            opacity: pressed ? 0.85 : 1,
                        },
                    ]}
                >
                    <View style={[styles.micInner, { backgroundColor: active ? colors.danger : colors.primary }]}>
                        <MaterialCommunityIcons
                            name={active ? 'microphone' : 'microphone-outline'}
                            size={36}
                            color="#fff"
                        />
                    </View>
                </Pressable>
                <Text style={[styles.micLabel, { color: active ? colors.danger : colors.textMuted }]}>
                    {active ? '● LISTENING  (MOCK — STT not connected)' : 'Tap to activate microphone'}
                </Text>
            </View>

            {/* ── Text input ── */}
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Type a command…"
                    placeholderTextColor={colors.textDim}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => handleSend()}
                    returnKeyType="send"
                />
                <Pressable
                    onPress={() => handleSend()}
                    accessibilityRole="button"
                    accessibilityLabel="Send voice command text"
                    accessibilityState={{ disabled: !input.trim() }}
                    disabled={!input.trim()}
                    style={({ pressed }) => [styles.sendBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
                >
                    <MaterialIcons name="send" size={18} color="#fff" />
                </Pressable>
            </View>

            {/* ── Recognized text ── */}
            {recognized ? (
                <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.resultHeader}>
                        <MaterialIcons name="record-voice-over" size={14} color={colors.primary} />
                        <Text style={[styles.resultTitle, { color: colors.primary }]}>Recognized Command</Text>
                    </View>
                    <Text style={[styles.resultText, { color: colors.text }]}>{recognized}</Text>
                </View>
            ) : null}

            {/* ── Robot reply ── */}
            {reply ? (
                <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.resultHeader}>
                        <MaterialCommunityIcons name="robot" size={14} color={colors.success} />
                        <Text style={[styles.resultTitle, { color: colors.success }]}>Savo Reply</Text>
                    </View>
                    <Text style={[styles.resultText, { color: colors.text }]}>{reply}</Text>
                </View>
            ) : null}

            {/* ── Examples ── */}
            <Text style={[styles.exampleTitle, { color: colors.textDim }]}>EXAMPLE COMMANDS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll} contentContainerStyle={styles.examplesContent}>
                {VOICE_EXAMPLE_COMMANDS.map((cmd) => (
                    <Pressable
                        key={cmd}
                        onPress={() => handleSend(cmd)}
                        style={({ pressed }) => [
                            styles.exampleChip,
                            {
                                backgroundColor: pressed ? colors.surfaceSoft : colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons name="robot" size={13} color={colors.primary} />
                        <Text style={[styles.exampleText, { color: colors.textMuted }]}>{cmd}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* ── Backend note ── */}
            <View style={[styles.note, { backgroundColor: withAlpha(colors.primary, '10'), borderColor: withAlpha(colors.primary, '30') }]}>
                <MaterialIcons name="info-outline" size={15} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.textMuted }]}>
                    Real STT will connect to http://SERVER_IP:9000 · LLM at http://SERVER_IP:8000 · Commands are sent as safe backend requests only.
                </Text>
            </View>
        </AppScreen>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13, marginTop: 2 },
    micSection: { alignItems: 'center', gap: 16, paddingVertical: 8 },
    micOuter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        gap: 8,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 8 },
    sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    resultCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    resultTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    resultText: { fontSize: 14, lineHeight: 21 },
    exampleTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: -6 },
    examplesScroll: { marginHorizontal: -16 },
    examplesContent: { paddingHorizontal: 16, gap: 8 },
    exampleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    exampleText: { fontSize: 12, fontWeight: '600' },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
    noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
