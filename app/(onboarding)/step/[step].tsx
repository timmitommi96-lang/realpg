import CustomButton from '@/components/CustomButton';
import FoxMascot, { FoxExpression } from '@/components/FoxMascot';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { useTheme } from '@/src/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

const QUESTIONS = [
  { id: 'nickname', question: "Wie dürfen wir dich heute nennen, Held?", placeholder: "Dein Nickname...", type: 'text' },
  { id: 'age', question: "Verrätst du uns dein Alter?", placeholder: "Dein Alter...", type: 'text', keyboardType: 'numeric' },
  { id: 'primary_goal', question: "Was ist dein wichtigstes Ziel?", type: 'choice', options: ['Disziplin', 'Fitness', 'Produktivität', 'Achtsamkeit'] },
  { id: 'hobbies', question: "Was machst du am liebsten in deiner Freizeit?", placeholder: "Gaming, Sport, Kochen...", type: 'text' },
  { id: 'quest_level', question: "Wie intensiv sollen deine Quests sein?", type: 'choice', options: ['Ganz leicht', 'Mittelschwer', 'Hardcore'] },
  { id: 'daily_time', question: "Wie viel Zeit hast du täglich für Quests?", type: 'choice', options: ['15 Min', '30 Min', '1 Std', 'Mehr'] },
  { id: 'sleep_quality', question: "Wie gut schläfst du momentan?", type: 'choice', options: ['Super', 'Ganz ok', 'Eher schlecht'] },
  { id: 'diet_type', question: "Wie achtest du auf deine Ernährung?", type: 'choice', options: ['Sehr gesund', 'Standard', 'Noch Luft nach oben'] },
  { id: 'motivation', question: "Was treibt dich am meisten an?", placeholder: "Persönliches Wachstum, Erfolg...", type: 'text' },
  { id: 'notifications', question: "Soll ich dich täglich motivieren (Pushes)?", type: 'choice', options: ['Klar, leg los!', 'Lieber nicht'] }
];

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const stepIndex = parseInt(step || '1') - 1;
  const currentStep = QUESTIONS[stepIndex];
  const router = useRouter();
  const { isDark } = useTheme();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadValue() {
      if (!currentStep) return;
      try {
        const profile = await getUserProfile();
        if (profile) {
          const existingValue = (profile as any)[currentStep.id];
          if (existingValue !== undefined) setValue(existingValue.toString());
        }
      } catch (err) {
        console.error('Failed to load value:', err);
      }
    }
    loadValue();
  }, [stepIndex, currentStep]);

  // Dynamische Fuchs-Begleitung für das Onboarding
  const mascotState = useMemo(() => {
    const expressions: FoxExpression[] = ['happy', 'thinking', 'excited', 'thinking', 'quest', 'thinking', 'sad', 'thinking', 'happy', 'excited'];
    const messages = [
      "Ein starker Name für einen starken Helden!",
      "Nur eine Zahl, aber wichtig für dein Training!",
      "Gute Wahl! Wir werden dich zum Experten machen.",
      "Interessant! Das lässt sich super in Quests einbauen.",
      "Bist du bereit für die Herausforderung?",
      "Zeitmanagement ist der Schlüssel zum Erfolg!",
      "Schlaf ist heilig für die Regeneration...",
      "Du bist, was du isst! Packen wir's an.",
      "Das ist der Spirit, den wir brauchen!",
      "Fast geschafft! Soll ich dir ab und zu Feuer unterm Hintern machen?"
    ];

    return {
      message: messages[stepIndex] || currentStep.question,
      expression: expressions[stepIndex] || 'idle'
    };
  }, [stepIndex]);

  if (!currentStep) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F24" />
      </View>
    );
  }

  const handleNext = async () => {
    setLoading(true);
    try {
      const update: any = {};
      if (currentStep.id === 'notifications') {
        update[currentStep.id] = value === 'Klar, leg los!';
      } else {
        update[currentStep.id] = value;
      }
      await saveUserProfile(update);

      if (stepIndex < QUESTIONS.length - 1) {
        router.push(`/step/${stepIndex + 2}`);
      } else {
        router.push('/summary');
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setLoading(false);
    }
  };

  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? "#94A3B8" : "#4B4B4B"} size={28} />
        </TouchableOpacity>
        <View style={s.progressBarContainer}>
          <View style={[s.progressBar, { width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={s.stepText}>{stepIndex + 1}/{QUESTIONS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', marginBottom: 10 }}>
            <FoxMascot 
              message={mascotState.message}
              expression={mascotState.expression as any}
            />
        </View>

        <Text style={s.questionSub}>{currentStep.question}</Text>

        {currentStep.type === 'text' ? (
          <TextInput
            style={s.input}
            placeholder={currentStep.placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType={currentStep.keyboardType as any || 'default'}
            autoFocus
            placeholderTextColor={isDark ? "#64748B" : "#AFAFAF"}
          />
        ) : (
          <View style={s.choiceContainer}>
            {currentStep.options?.map((option) => (
              <TouchableOpacity
                  key={option}
                  style={[
                  s.choiceButton,
                  value === option && s.choiceButtonSelected
                  ]}
                  onPress={() => setValue(option)}
              >
                  <Text style={[
                  s.choiceText,
                  value === option && s.choiceTextSelected
                  ]}>
                  {option.toUpperCase()}
                  </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <CustomButton 
          title="WEITER" 
          onPress={handleNext} 
          disabled={!value} 
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, paddingTop: 50 },
  backButton: { padding: 8 },
  progressBarContainer: { flex: 1, height: 10, backgroundColor: '#F2F2F2', borderRadius: 5, marginHorizontal: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FF7F24', borderRadius: 5 },
  stepText: { fontSize: 13, fontWeight: '900', color: '#AFAFAF', width: 35 },
  content: { padding: 24, paddingBottom: 100 },
  questionSub: { fontSize: 18, fontWeight: '900', color: '#4B4B4B', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#F9F9F9', borderWidth: 2, borderColor: '#F2F2F2', borderRadius: 18, padding: 20, fontSize: 19, color: '#4B4B4B', marginTop: 10, fontWeight: '700' },
  choiceContainer: { width: '100%', marginTop: 10 },
  choiceButton: { width: '100%', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6, borderRadius: 20, padding: 18, marginBottom: 14 },
  choiceButtonSelected: { backgroundColor: '#FFF5EE', borderColor: '#FF7F24', borderBottomColor: '#CC5500' },
  choiceText: { fontSize: 16, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', letterSpacing: 1 },
  choiceTextSelected: { color: '#FF7F24' },
  footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 2, borderTopColor: '#F2F2F2' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, paddingTop: 50 },
  backButton: { padding: 8 },
  progressBarContainer: { flex: 1, height: 10, backgroundColor: '#1E293B', borderRadius: 5, marginHorizontal: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FF7F24', borderRadius: 5 },
  stepText: { fontSize: 13, fontWeight: '900', color: '#64748B', width: 35 },
  content: { padding: 24, paddingBottom: 100 },
  questionSub: { fontSize: 18, fontWeight: '900', color: '#F1F5F9', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#1E293B', borderWidth: 2, borderColor: '#334155', borderRadius: 18, padding: 20, fontSize: 19, color: '#F1F5F9', marginTop: 10, fontWeight: '700' },
  choiceContainer: { width: '100%', marginTop: 10 },
  choiceButton: { width: '100%', backgroundColor: '#1E293B', borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6, borderRadius: 20, padding: 18, marginBottom: 14 },
  choiceButtonSelected: { backgroundColor: '#2D1B0E', borderColor: '#FF7F24', borderBottomColor: '#CC5500' },
  choiceText: { fontSize: 16, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', letterSpacing: 1 },
  choiceTextSelected: { color: '#FF7F24' },
  footer: { padding: 24, backgroundColor: '#0F172A', borderTopWidth: 2, borderTopColor: '#334155' },
});
