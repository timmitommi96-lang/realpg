import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import { getUserProfile, saveUserProfile } from '@/src/services/db';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentStep) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F24" />
      </View>
    );
  }

  useEffect(() => {
    async function loadValue() {
      try {
        if (!currentStep) return;
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

  if (!currentStep) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#4B4B4B" size={28} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>{stepIndex + 1}/{QUESTIONS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%' }}>
            <FoxMascot 
            message={currentStep.question} 
            expression={stepIndex % 3 === 0 ? 'happy' : stepIndex % 3 === 1 ? 'thinking' : 'quest'} 
            />
        </View>

        {currentStep.type === 'text' ? (
          <TextInput
            style={styles.input}
            placeholder={currentStep.placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType={currentStep.keyboardType as any || 'default'}
            autoFocus
            placeholderTextColor="#D4D4D4"
          />
        ) : (
          <View style={styles.choiceContainer}>
            {currentStep.options?.map((option) => (
              <TouchableOpacity
                  key={option}
                  style={[
                  styles.choiceButton,
                  value === option && styles.choiceButtonSelected
                  ]}
                  onPress={() => setValue(option)}
              >
                  <Text style={[
                  styles.choiceText,
                  value === option && styles.choiceTextSelected
                  ]}>
                  {option === 'Ja, schick mir Pushes!' ? 'JA, AUF JEDEN FALL!' : option.toUpperCase()}
                  </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  backButton: { padding: 8 },
  progressBarContainer: { flex: 1, height: 14, backgroundColor: '#F2F2F2', borderRadius: 7, marginHorizontal: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5E5' },
  progressBar: { height: '100%', backgroundColor: '#FF7F24', borderRadius: 7 },
  stepText: { fontSize: 13, fontWeight: '900', color: '#AFAFAF', width: 35 },
  content: { padding: 24, paddingBottom: 100 },
  input: { width: '100%', backgroundColor: '#F9F9F9', borderWidth: 2, borderColor: '#F2F2F2', borderRadius: 18, padding: 20, fontSize: 19, color: '#4B4B4B', marginTop: 24, fontWeight: '700' },
  choiceContainer: { width: '100%', marginTop: 24 },
  choiceButton: { width: '100%', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6, borderRadius: 20, padding: 20, marginBottom: 14 },
  choiceButtonSelected: { backgroundColor: '#FDFDFD', borderColor: '#FF7F24', borderBottomColor: '#CC5500' },
  choiceText: { fontSize: 17, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', letterSpacing: 1 },
  choiceTextSelected: { color: '#FF7F24' },
  footer: { padding: 24, backgroundColor: '#FFFFFF' },
});
