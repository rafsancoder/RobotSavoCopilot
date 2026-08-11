import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
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
    getMockChatResponse,
} from '../data/mock';

export default function ChatScreen() {
    const { colors } = getRobotTheme();
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [input, setInput] = useState('');
    const listRef = useRef<FlatList>(null);

    function send(text = input) {
        const trimmed = text.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: trimmed, timestamp: now };
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: getMockChatResponse(trimmed),
            timestamp: now,
        };
        setMessages(prev => [...prev, userMsg, botMsg]);
        setInput('');
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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
                    <StatusPill label="MOCK" tone="warning" />
                </View>

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
                                onPress={() => send(s)}
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
                        onSubmitEditing={() => send()}
                        submitBehavior="submit"
                        returnKeyType="send"
                        multiline
                    />
                    <Pressable
                        onPress={() => send()}
                        accessibilityRole="button"
                        accessibilityLabel="Send message"
                        accessibilityState={{ disabled: !input.trim() }}
                        disabled={!input.trim()}
                        style={({ pressed }) => [
                            styles.sendBtn,
                            { backgroundColor: input.trim() ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 },
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
