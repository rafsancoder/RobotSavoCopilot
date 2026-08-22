import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusPill } from '../components/ui/StatusPill';
import { getRobotTheme, withAlpha } from '../constants/theme';
import {
    CHAT_SUGGESTIONS,
    ChatMessage,
    INITIAL_CHAT_MESSAGES,
} from '../data/mock';
import { writeBase64Audio } from '../services/audio-files';
import { ConversationTurn, getConversationSessionId, RobotPlayback } from '../services/conversation';
import { acknowledgePlayback, loadPlaybackTarget, sendTextTurn } from '../services/savomind-api';

const SESSION_ID = getConversationSessionId();

export default function ChatScreen() {
    const { colors } = getRobotTheme();
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [online, setOnline] = useState<boolean | null>(null);
    const listRef = useRef<FlatList>(null);
    const player = useAudioPlayer(null);
    const playerStatus = useAudioPlayerStatus(player);
    const pendingPlayback = useRef<ConversationTurn | null>(null);
    const [robotPlayback, setRobotPlayback] = useState<RobotPlayback>('unknown');
    useEffect(() => {
        if (!playerStatus.didJustFinish || !pendingPlayback.current) return;
        const completed = pendingPlayback.current;
        pendingPlayback.current = null;
        void acknowledgePlayback(completed).catch(() => undefined);
    }, [playerStatus.didJustFinish]);

    async function send(text = input) {
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        const now = new Date().toISOString();
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: trimmed, timestamp: now };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSending(true);
        try {
            const response = await sendTextTurn(trimmed, SESSION_ID);
            const botMsg: ChatMessage = {
                id: response.requestId || `${Date.now()}-reply`,
                role: 'assistant',
                text: response.replyText || 'SavoMind returned no reply.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, botMsg]);
            setRobotPlayback(response.robotPlayback);
            const playbackTarget = await loadPlaybackTarget();
            if (playbackTarget === 'phone' && response.tts.available && response.tts.audioBase64) {
                const audio = writeBase64Audio(response.tts.audioBase64, response.tts.audioFormat || 'wav');
                pendingPlayback.current = response.playbackAckRequired ? response : null;
                player.replace(audio.uri);
                player.play();
            }
            setOnline(true);
        } catch (error) {
            setOnline(false);
            setMessages(prev => [...prev, {
                id: `${Date.now()}-error`,
                role: 'assistant',
                text: error instanceof Error ? `Connection error: ${error.message}` : 'Could not reach SavoMind.',
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setSending(false);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                {/* ── Sub-header ── */}
                <View style={[styles.subHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <View style={styles.subHeaderLeft}>
                        <View style={[styles.botAvatar, { backgroundColor: withAlpha(colors.primary, '20') }]}>
                            <MaterialCommunityIcons name="robot" size={18} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.botName, { color: colors.text }]}>Savo AI</Text>
                            <Text style={[styles.botSub, { color: colors.textMuted }]}>Robot Savo 2.0 assistant</Text>
                        </View>
                    </View>
                    <StatusPill
                        label={online === false ? 'OFFLINE' : sending ? 'SENDING' : 'SAVOMIND'}
                        tone={online === false ? 'danger' : sending ? 'warning' : 'success'}
                    />
                </View>

                {robotPlayback === 'unknown' && messages.length > 1 ? (
                    <Text style={[styles.robotPlayback, { color: colors.textDim }]}>Robot speaker: not reported by this SavoMind API</Text>
                ) : null}

                {/* ── Messages ── */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <Bubble msg={item} colors={colors} />}
                />

                {/* ── Suggestions (shown when only initial message) ── */}
                {messages.length <= 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.suggestionsScroll}
                        contentContainerStyle={styles.suggestionsContent}
                    >
                        {CHAT_SUGGESTIONS.map(s => (
                            <Pressable
                                key={s}
                                onPress={() => void send(s)}
                                style={({ pressed }) => [
                                    styles.suggestionChip,
                                    {
                                        backgroundColor: pressed ? colors.surfaceSoft : colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Text style={[styles.suggestionText, { color: colors.textMuted }]}>{s}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {/* ── Input bar ── */}
                <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSoft }]}
                        placeholder="Ask about Robot Savo…"
                        placeholderTextColor={colors.textDim}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={() => void send()}
                        submitBehavior="submit"
                        returnKeyType="send"
                        multiline
                    />
                    <Pressable
                        onPress={() => void send()}
                        accessibilityRole="button"
                        accessibilityLabel="Send message"
                        accessibilityState={{ disabled: !input.trim() || sending }}
                        disabled={!input.trim() || sending}
                        style={({ pressed }) => [
                            styles.sendBtn,
                            { backgroundColor: input.trim() && !sending ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <MaterialIcons name="send" size={18} color="#fff" />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Bubble({ msg, colors }: { msg: ChatMessage; colors: any }) {
    const isUser = msg.role === 'user';
    return (
        <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
            {!isUser && (
                <View style={[styles.avatar, { backgroundColor: withAlpha(colors.primary, '20') }]}>
                    <MaterialCommunityIcons name="robot" size={14} color={colors.primary} />
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                ]}
            >
                <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>{msg.text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    subHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    botAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    botName: { fontSize: 14, fontWeight: '800' },
    botSub: { fontSize: 11 },
    robotPlayback: { paddingHorizontal: 16, paddingTop: 6, fontSize: 11 },
    messageList: { padding: 16, gap: 12, paddingBottom: 8 },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
    bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
    bubbleText: { fontSize: 14, lineHeight: 21 },
    suggestionsScroll: { marginBottom: 4 },
    suggestionsContent: { paddingHorizontal: 16, gap: 8 },
    suggestionChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    suggestionText: { fontSize: 12, fontWeight: '600' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        padding: 10,
        borderTopWidth: 1,
    },
    input: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
    sendBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
