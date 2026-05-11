import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/context/ThemeContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import FoxMascot from '@/components/FoxMascot';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { isDark } = useTheme();
  const s = isDark ? stylesDark : stylesLight;
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hallo! 🦊 Ich bin QuestMaster, dein persönlicher Assistent. Wie kann ich dir heute helfen?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model' as const,
        parts: [{ text: m.content }],
      }));

      const chat = chatModel.startChat({
        history: chatHistory.slice(0, -1),
        systemInstruction: {
          role: 'user',
          parts: [{ text: 'Du bist QuestMaster, ein motivierender Fuchs-Assistent einer Life-RPG-App. Antworten auf Deutsch, maximal 3 Sätze. Sei ermutigend, kreativ und nutze Emojis. Hilf Nutzern Quests zu planen, motivier sie und gib Tipps.' }],
        },
      });

      const result = await chat.sendMessage(userMessage.content);
      const response = (await result.response).text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'Klingt gut! 🦊 Leg los und sammle XP!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entschuldigung, ich hab ein Problem mit der Cloud-Verbindung. Versuchs gleich nochmal! 🦊',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[s.messageContainer, item.role === 'user' ? s.userMessage : s.assistantMessage]}>
      {item.role === 'assistant' && (
        <View style={s.avatar}>
          <Text style={s.avatarEmoji}>🦊</Text>
        </View>
      )}
      <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.assistantBubble]}>
        <Text style={[s.messageText, item.role === 'user' && s.userText]}>{item.content}</Text>
      </View>
      {item.role === 'user' && (
        <View style={s.userAvatar}>
          <Text style={s.userAvatarEmoji}>👤</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <FoxMascot
        message="Ich bin da, um dich zu motivieren! Was hast du heute vor?"
        expression="happy"
        size={80}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          keyboardShouldPersistTaps="handled"
        />
        <View style={s.inputContainer}>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              placeholder="Schreib eine Nachricht..."
              placeholderTextColor={isDark ? '#64748B' : '#AFAFAF'}
              value={inputText}
              onChangeText={setInputText}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[s.sendButton, (!inputText.trim() || isLoading) && s.sendButtonDisabled]} 
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Send color={inputText.trim() ? '#FFFFFF' : '#AFAFAF'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  messageList: { padding: 16, paddingBottom: 20 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarEmoji: { fontSize: 20 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  userAvatarEmoji: { fontSize: 18 },
  bubble: { maxWidth: '75%', padding: 14, borderRadius: 20 },
  assistantBubble: { backgroundColor: '#F9F9F9', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#FF7F24', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#4B4B4B', lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  inputContainer: { padding: 16, paddingBottom: 0, backgroundColor: '#FFFFFF', borderTopWidth: 2, borderTopColor: '#F2F2F2' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F9F9F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 2, borderColor: '#F2F2F2' },
  input: { flex: 1, fontSize: 15, color: '#4B4B4B', maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sendButtonDisabled: { backgroundColor: '#F2F2F2' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  messageList: { padding: 16, paddingBottom: 20 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D1B0E', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarEmoji: { fontSize: 20 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  userAvatarEmoji: { fontSize: 18 },
  bubble: { maxWidth: '75%', padding: 14, borderRadius: 20 },
  assistantBubble: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#FF7F24', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#F1F5F9', lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  inputContainer: { padding: 16, paddingBottom: 0, backgroundColor: '#0F172A', borderTopWidth: 2, borderTopColor: '#334155' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 2, borderColor: '#334155' },
  input: { flex: 1, fontSize: 15, color: '#F1F5F9', maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF7F24', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sendButtonDisabled: { backgroundColor: '#334155' },
});