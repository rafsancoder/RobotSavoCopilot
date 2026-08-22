import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
    AudioQuality,
    IOSOutputFormat,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioPlayer,
    useAudioPlayerStatus,
    useAudioRecorder,
    useAudioRecorderState,
    type RecordingOptions,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '../components/layout/AppScreen';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import { VOICE_EXAMPLE_COMMANDS } from '../data/mock';
import { writeBase64Audio } from '../services/audio-files';
import { ConversationTurn, getConversationSessionId } from '../services/conversation';
import { acknowledgePlayback, checkSavoMind, loadPlaybackTarget, sendTextTurn, sendVoiceTurn } from '../services/savomind-api';

const SESSION_ID = getConversationSessionId();
const VOICE_FAILURE_MESSAGES: Record<string, string> = {
    stt_failed: 'Speech recognition is not ready on SavoMind. Configure an STT provider or install the local Faster-Whisper model.',
    tts_failed: 'SavoMind understood the command, but speech playback is not ready. Configure a TTS provider or install a Piper voice.',
};
const PCM_WAV_OPTIONS: RecordingOptions = {
    extension: '.wav',
    sampleRate: 16_000,
    numberOfChannels: 1,
    bitRate: 256_000,
    isMeteringEnabled: true,
    ios: {
        extension: '.wav',
        outputFormat: IOSOutputFormat.LINEARPCM,
        audioQuality: AudioQuality.HIGH,
        sampleRate: 16_000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    android: {
        extension: '.m4a',
        outputFormat: 'mpeg4',
        audioEncoder: 'aac',
        sampleRate: 16_000,
    },
    web: { mimeType: 'audio/wav', bitsPerSecond: 256_000 },
};

export default function VoiceScreen() {
    const { colors } = getRobotTheme();
    const recorder = useAudioRecorder(PCM_WAV_OPTIONS);
    const recorderState = useAudioRecorderState(recorder);
    const player = useAudioPlayer(null);
    const playerStatus = useAudioPlayerStatus(player);
    const pendingPlayback = useRef<ConversationTurn | null>(null);
    const lastAudio = useRef<{ uri: string; turn: ConversationTurn } | null>(null);
    const [input, setInput] = useState('');
    const [recognized, setRecognized] = useState('');
    const [reply, setReply] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [connected, setConnected] = useState<boolean | null>(null);

    useEffect(() => {
        void checkSavoMind()
            .then(ok => setConnected(ok))
            .catch(() => setConnected(false));
    }, []);

    useEffect(() => {
        if (!playerStatus.didJustFinish || !pendingPlayback.current) return;
        const completed = pendingPlayback.current;
        pendingPlayback.current = null;
        void acknowledgePlayback(completed).catch(playbackError => {
            setError(playbackError instanceof Error ? playbackError.message : 'Playback acknowledgement failed.');
        });
    }, [playerStatus.didJustFinish]);

    async function playReply(response: ConversationTurn) {
        if (await loadPlaybackTarget() === 'robot') return;
        const base64 = response.tts.audioBase64;
        if (!response.tts.available || !base64) return;
        const audioFile = writeBase64Audio(base64, response.tts.audioFormat || 'wav');
        lastAudio.current = { uri: audioFile.uri, turn: response };
        pendingPlayback.current = response.playbackAckRequired ? response : null;
        player.replace(audioFile.uri);
        player.play();
    }

    async function replayReply() {
        if (!lastAudio.current) return;
        if (await loadPlaybackTarget() === 'robot') return;
        pendingPlayback.current = null;
        player.replace(lastAudio.current.uri);
        player.play();
    }

    async function handleTextSend(text = input) {
        const trimmed = text.trim();
        if (!trimmed || busy || recorderState.isRecording) return;
        setBusy(true);
        setError('');
        setReply('');
        setRecognized(trimmed);
        try {
            const response = await sendTextTurn(trimmed, SESSION_ID);
            setConnected(true);
            setReply(response.replyText || 'SavoMind returned no reply.');
            await playReply(response);
            setInput('');
        } catch (requestError) {
            setConnected(false);
            setError(requestError instanceof Error ? requestError.message : 'Could not reach SavoMind.');
        } finally {
            setBusy(false);
        }
    }

    async function handleMicPress() {
        if (busy) return;
        if (!recorderState.isRecording) {
            try {
                const permission = await requestRecordingPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert('Microphone Permission', 'Allow microphone access to send voice messages to SavoMind.');
                    return;
                }
                setError('');
                setReply('');
                setRecognized('');
                await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
                await recorder.prepareToRecordAsync();
                recorder.record();
            } catch (recordingError) {
                await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
                setError(recordingError instanceof Error ? recordingError.message : 'Could not start recording.');
            }
            return;
        }

        setBusy(true);
        try {
            await recorder.stop();
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
            if (!recorder.uri) throw new Error('The recorder did not produce an audio file.');
            const response = await sendVoiceTurn(recorder.uri, SESSION_ID);
            setConnected(true);
            if (!response.ok || response.reason === 'stt_failed') {
                setRecognized(response.transcript || 'No speech was recognized.');
                setReply(response.replyText);
                setError(VOICE_FAILURE_MESSAGES[response.reason || ''] || response.blockReason || `Voice processing failed: ${response.reason || 'unknown error'}`);
                return;
            }
            setRecognized(response.transcript || '[No speech recognized]');
            setReply(response.replyText || VOICE_FAILURE_MESSAGES[response.reason || ''] || response.reason || 'SavoMind returned no reply.');
            await playReply(response);
        } catch (requestError) {
            setConnected(false);
            setError(requestError instanceof Error ? requestError.message : 'Voice request failed.');
        } finally {
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
            setBusy(false);
        }
    }

    const active = recorderState.isRecording;

    return (
        <AppScreen>
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Voice Command</Text>
                    <Text style={[styles.screenSub, { color: colors.textMuted }]}>Speak or type directly to SavoMind</Text>
                </View>
                <StatusPill
                    label={active ? 'RECORDING' : busy ? 'PROCESSING' : connected === true ? 'CONNECTED' : connected === false ? 'OFFLINE' : 'CHECKING'}
                    tone={active ? 'danger' : busy || connected === null ? 'warning' : connected ? 'success' : 'danger'}
                />
            </View>

            <View style={styles.micSection}>
                <Pressable
                    onPress={() => void handleMicPress()}
                    accessibilityRole="button"
                    accessibilityLabel={active ? 'Stop recording and send' : 'Start voice recording'}
                    accessibilityState={{ selected: active, disabled: busy }}
                    disabled={busy}
                    style={({ pressed }) => [styles.micOuter, {
                        backgroundColor: withAlpha(active ? colors.danger : colors.primary, '18'),
                        borderColor: withAlpha(active ? colors.danger : colors.primary, '60'),
                        opacity: pressed || busy ? 0.7 : 1,
                    }]}
                >
                    <View style={[styles.micInner, { backgroundColor: active ? colors.danger : colors.primary }]}>
                        <MaterialCommunityIcons name={active ? 'stop' : 'microphone-outline'} size={36} color="#fff" />
                    </View>
                </Pressable>
                <Text style={[styles.micLabel, { color: active ? colors.danger : colors.textMuted }]}>
                    {active ? 'Recording - tap again to send' : busy ? 'SavoMind is processing...' : playerStatus.playing ? 'Playing Savo reply...' : 'Tap to record a voice message'}
                </Text>
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Type a command..."
                    placeholderTextColor={colors.textDim}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => void handleTextSend()}
                    returnKeyType="send"
                />
                <Pressable
                    onPress={() => void handleTextSend()}
                    accessibilityRole="button"
                    accessibilityLabel="Send command to SavoMind"
                    disabled={!input.trim() || busy || active}
                    style={({ pressed }) => [styles.sendBtn, { backgroundColor: colors.primary, opacity: pressed || busy ? 0.6 : 1 }]}
                >
                    <MaterialIcons name="send" size={18} color="#fff" />
                </Pressable>
            </View>

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
            {recognized ? <ResultCard title="Recognized Command" text={recognized} color={colors.primary} icon="record-voice-over" colors={colors} /> : null}
            {reply ? <ResultCard title="Savo Reply" text={reply} color={colors.success} icon="smart-toy" colors={colors} /> : null}
            {lastAudio.current ? (
                <Pressable onPress={() => void replayReply()} style={[styles.replayButton, { borderColor: colors.border }]}>
                    <MaterialIcons name="replay" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary }}>Replay Savo reply</Text>
                </Pressable>
            ) : null}

            <Text style={[styles.exampleTitle, { color: colors.textDim }]}>EXAMPLE COMMANDS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll} contentContainerStyle={styles.examplesContent}>
                {VOICE_EXAMPLE_COMMANDS.map(command => (
                    <Pressable key={command} onPress={() => void handleTextSend(command)} style={({ pressed }) => [styles.exampleChip, { backgroundColor: pressed ? colors.surfaceSoft : colors.surface, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="robot" size={13} color={colors.primary} />
                        <Text style={[styles.exampleText, { color: colors.textMuted }]}>{command}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={[styles.note, { backgroundColor: withAlpha(colors.primary, '10'), borderColor: withAlpha(colors.primary, '30') }]}>
                <MaterialIcons name="security" size={15} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.textMuted }]}>Text and voice use SavoMind on port 8000. The app never sends commands directly to ROS or the robot.</Text>
            </View>
        </AppScreen>
    );
}

function ResultCard({ title, text, color, icon, colors }: { title: string; text: string; color: string; icon: 'record-voice-over' | 'smart-toy'; colors: any }) {
    return <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.resultHeader}><MaterialIcons name={icon} size={14} color={color} /><Text style={[styles.resultTitle, { color }]}>{title}</Text></View>
        <Text style={[styles.resultText, { color: colors.text }]}>{text}</Text>
    </View>;
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    screenTitle: { fontSize: 22, fontWeight: '900' },
    screenSub: { fontSize: 13, marginTop: 2 },
    micSection: { alignItems: 'center', gap: 16, paddingVertical: 8 },
    micOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    micInner: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    micLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8 },
    input: { flex: 1, fontSize: 15, paddingVertical: 8 },
    sendBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    error: { fontSize: 12, lineHeight: 18 },
    replayButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    resultCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    resultTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    resultText: { fontSize: 14, lineHeight: 21 },
    exampleTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: -6 },
    examplesScroll: { marginHorizontal: -16 },
    examplesContent: { paddingHorizontal: 16, gap: 8 },
    exampleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    exampleText: { fontSize: 12, fontWeight: '600' },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
    noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
