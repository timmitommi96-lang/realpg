import CustomButton from '@/components/CustomButton';
import FoxMascot from '@/components/FoxMascot';
import QuestCard from '@/components/QuestCard';
import { GeneratedQuest, aiService } from '@/src/services/ai';
import { getUserProfile } from '@/src/services/db';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Camera,
    CheckCircle2,
    Crown,
    Dice5,
    Flame,
    Image as ImageIcon,
    Settings,
    ShoppingBag,
    Sparkles,
    Trophy,
    X,
    Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function Dashboard() {
  const appStore = useAppStore();
  const stats = appStore.stats;
  const quests = appStore.quests;
  const isGeneratingQuests = appStore.isGeneratingQuests;
  const refreshQuests = appStore.refreshQuests;
  const completeQuest = appStore.completeQuest;
  const rollQuests = appStore.rollQuests;
  const generateCustomQuest = appStore.generateCustomQuest;
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [selectedQuest, setSelectedQuest] = useState<GeneratedQuest | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  
  const router = useRouter();

  const safeStats = stats || { level: 1, xp: 0, coins: 10, xpToNextLevel: 100, title: "Anfänger", streak: 0, questsCompleted: 0 };
  const progressPercent = (safeStats.xp / safeStats.xpToNextLevel) * 100;

  useEffect(() => {
    async function loadData() {
      const p = await getUserProfile();
      setProfile(p);
      if (quests.length === 0) {
        refreshQuests();
      }
    }
    loadData();
  }, []);

  const openQuestDetail = (quest: GeneratedQuest) => {
    setSelectedQuest(quest);
    setImage(null);
    setImageUri(null);
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeQuestDetail = () => {
    setShowModal(false);
    setTimeout(() => setSelectedQuest(null), 300);
  };

  const handleRollQuests = async () => {
    if (safeStats.coins < 10) {
      Alert.alert("Nicht genug Münzen!", "Du brauchst 10 Münzen für 5 neue Quests.");
      return;
    }
    const success = await rollQuests();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Quests ausgewürfelt! 🎲", "5 neue Quests wurden hinzugefügt!");
    }
  };

  const handleGenerateCustomQuest = async () => {
    if (!customGoal.trim()) {
      Alert.alert("Fehler", "Bitte beschreibe, was du erreichen möchtest!");
      return;
    }
    if (safeStats.coins < 50) {
      Alert.alert("Nicht genug Münzen!", "Du brauchst 50 Münzen für eine KI-Quest.");
      return;
    }
    setShowCustomModal(false);
    const quest = await generateCustomQuest(customGoal);
    if (quest) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("KI-Quest erstellt! ✨", `Deine Quest "${quest.title}" wurde hinzugefügt.`);
    } else {
      Alert.alert("Fehler", "Die KI konnte keine Quest erstellen. Bitte versuche es erneut.");
    }
    setCustomGoal("");
  };

  const onRefresh = React.useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await refreshQuests();
  }, [refreshQuests]);

  const pickImage = async (useCamera: boolean = true) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].base64 || null);
      setImageUri(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleComplete = async () => {
    if (!selectedQuest || !image) {
      alert("Bitte mach zuerst ein Foto von deinem Beweis!");
      return;
    }
    
    setIsValidating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const result = await aiService.validateProof(image, selectedQuest.description);
      setIsValidating(false);
      if (result.isValid) {
        setAiFeedback(result.feedback);
        setShowSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("KI Check", result.feedback);
      }
    } catch (error) {
      setIsValidating(false);
      alert("Quest erledigt!");
      setShowSuccess(true);
    }
  };

  const handleFinishSuccess = () => {
    if (selectedQuest) completeQuest(selectedQuest.title);
    setShowSuccess(false);
    setShowModal(false);
    setSelectedQuest(null);
  };

  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView 
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isGeneratingQuests} onRefresh={onRefresh} tintColor="#FF7F24" />
        }
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>GUTEN TAG,</Text>
            <View style={s.titleRow}>
              <Text style={s.titleText}>{profile?.nickname || 'Held'}</Text>
              <Crown size={22} color="#FFD700" fill="#FFD700" />
            </View>
          </View>
          <TouchableOpacity style={s.settingsButton} onPress={() => router.push('/(tabs)/settings')}>
            <Settings color={isDark ? "#94A3B8" : "#AFAFAF"} size={28} />
          </TouchableOpacity>
        </View>

        <View style={s.safeStatsCardContainer}>
           <View style={s.safeStatsCardShadow} />
           <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#FDFDFD']}
            style={s.safeStatsCard}
           >
            <View style={s.levelHeader}>
                <LinearGradient 
                    colors={['#FF7F24', '#FF5500']} 
                    style={s.levelCircle}
                >
                    <Text style={s.levelValue}>{safeStats.level}</Text>
                </LinearGradient>
                <View style={s.levelInfo}>
                    <Text style={s.levelLabel}>{safeStats.title.toUpperCase()}</Text>
                    <Text style={s.xpText}>{safeStats.xp} / {safeStats.xpToNextLevel} XP</Text>
                </View>
                <View style={s.coinBadge}>
                    <Text style={s.coinValue}>{safeStats.coins}</Text>
                    <Zap size={18} color="#FF7F24" fill="#FF7F24" />
                </View>
            </View>
            <View style={s.progressBarWrapper}>
                <View style={s.progressBarContainer}>
                    <View style={[s.progressBar, { width: `${progressPercent}%` }]} />
                    <LinearGradient 
                        colors={['rgba(255,255,255,0.3)', 'transparent']} 
                        style={StyleSheet.absoluteFill} 
                        start={{x:0, y:0}} 
                        end={{x:1, y:1}}
                    />
                </View>
            </View>
           </LinearGradient>
        </View>

        <View style={s.safeStatsRow}>
          <MiniStat icon={<Flame color="#FF4B4B" size={24} />} value={(safeStats?.streak ?? 0).toString()} label="Streak" isDark={isDark} />
          <MiniStat icon={<ShoppingBag color="#FF7F24" size={24} />} value="Markt" label="Shop" onPress={() => router.push('/(tabs)/shop')} isDark={isDark} />
          <MiniStat icon={<Trophy color="#FFD700" size={24} />} value={(safeStats?.questsCompleted ?? 0).toString()} label="Erfolge" isDark={isDark} />
        </View>

        <FoxMascot 
          message={isGeneratingQuests ? "Ich wuerfle gerade Quests aus..." : "Auf zu neuen Abenteuern, Held!"} 
          expression={isGeneratingQuests ? "thinking" : "quest"} 
        />

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>DEINE HEUTIGEN QUESTS</Text>
        </View>

        <View style={s.questButtonsRow}>
          <TouchableOpacity style={s.questBtn} onPress={handleRollQuests}>
            <Dice5 color="#FF7F24" size={28} />
            <Text style={s.questBtnText}>5 WÜRFELN</Text>
            <Text style={s.questBtnCost}>10 🪙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.questBtn, s.questBtnAi]} onPress={() => setShowCustomModal(true)}>
            <Sparkles color="#9B59B6" size={28} />
            <Text style={[s.questBtnText, { color: '#9B59B6' }]}>KI QUEST</Text>
            <Text style={[s.questBtnCost, { color: '#9B59B6' }]}>50 🪙</Text>
          </TouchableOpacity>
        </View>

        <View style={s.questList}>
          {quests.map((quest, index) => (
            <QuestCard key={`${quest.title}-${index}`} quest={quest} onPress={() => openQuestDetail(quest)} />
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {showModal && selectedQuest && (
        <View style={[StyleSheet.absoluteFill, s.modalWrapper]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeQuestDetail} />
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalHeadTitle}>QUEST DETAILS</Text>
              <TouchableOpacity onPress={closeQuestDetail}><X color={isDark ? "#94A3B8" : "#AFAFAF"} size={28} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalQuestTitle}>{selectedQuest.title}</Text>
              <View style={s.modalRewards}>
                <View style={s.modalRewardItem}>
                  <Trophy size={18} color="#FFD700" /><Text style={s.modalRewardText}>{selectedQuest.xp} XP</Text>
                </View>
                <View style={s.modalRewardItem}>
                  <Zap size={18} color="#FF7F24" fill="#FF7F24" /><Text style={s.modalRewardText}>{selectedQuest.coins}</Text>
                </View>
              </View>

              <View style={s.bubble}><Text style={s.modalDescription}>{selectedQuest.description}</Text></View>

              <View style={s.proofSection}>
                <Text style={s.proofTitle}>BEWEIS ERBRINGEN</Text>
                {imageUri ? (
                  <View style={s.previewContainer}>
                    <Image source={{ uri: imageUri }} style={s.previewImage} />
                    <TouchableOpacity style={s.removeImgBtn} onPress={() => { setImage(null); setImageUri(null); }}><X color="#fff" size={16} /></TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.imageSelectorRow}>
                    <TouchableOpacity style={s.cameraBtn} onPress={() => pickImage(true)}><Camera color="#FF7F24" size={32} /><Text style={s.cameraBtnText}>FOTO</Text></TouchableOpacity>
                    <TouchableOpacity style={s.cameraBtn} onPress={() => pickImage(false)}><ImageIcon color="#FF7F24" size={32} /><Text style={s.cameraBtnText}>GALERIE</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              <CustomButton title={isValidating ? "PRUEFUNG..." : "ABSCHLIESSEN"} onPress={handleComplete} loading={isValidating} disabled={!imageUri || isValidating} />
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}

      {showSuccess && (
        <View style={s.successOverlay}>
          <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="light" />
          <View style={s.successCard}>
            <LinearGradient colors={['#FF7F24', '#FF5500']} style={s.successIconCircle}>
                <CheckCircle2 color="#fff" size={100} />
            </LinearGradient>
            <Text style={s.successTitle}>HELDENHAFT!</Text>
            <Text style={s.successFeedback}>{aiFeedback}</Text>
            <View style={s.successRewards}>
              <View style={s.successRewardItem}><Trophy size={24} color="#FFD700" /><Text style={s.successRewardValue}>+{selectedQuest?.xp} XP</Text></View>
              <View style={s.successRewardItem}><Zap size={24} color="#FF7F24" fill="#FF7F24" /><Text style={s.successRewardValue}>+{selectedQuest?.coins} MUENZEN</Text></View>
            </View>
            <CustomButton title="WEITER GEHT'S" onPress={handleFinishSuccess} style={{ marginTop: 40 }} />
          </View>
        </View>
      )}

      {showCustomModal && (
        <View style={s.customModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCustomModal(false)} />
          <View style={s.customModalContent}>
            <Text style={s.customModalTitle}>Was möchtest du erreichen?</Text>
            <TextInput
              style={s.customInput}
              placeholder="z.B. Mehr Sport treiben, besser lernen, gesünder essen..."
              placeholderTextColor={isDark ? "#64748B" : "#AFAFAF"}
              value={customGoal}
              onChangeText={setCustomGoal}
              multiline
              autoFocus
            />
            <View style={s.customModalButtons}>
              <TouchableOpacity 
                style={[s.customModalBtn, s.customModalBtnCancel]} 
                onPress={() => { setShowCustomModal(false); setCustomGoal(""); }}
              >
                <Text style={[s.customModalBtnText, { color: isDark ? '#F1F5F9' : '#4B4B4B' }]}>ABBRECHEN</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.customModalBtn, s.customModalBtnConfirm]} 
                onPress={handleGenerateCustomQuest}
              >
                <Text style={[s.customModalBtnText, { color: '#FFFFFF' }]}>ERSTELLEN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function MiniStat({ icon, value, label, onPress, isDark }: { icon: any, value: string, label: string, onPress?: () => void, isDark: boolean }) {
  const s = isDark ? stylesDark : stylesLight;
  return (
    <TouchableOpacity style={s.miniStat} onPress={onPress} disabled={!onPress}>
      <View style={s.miniStatIcon}>{icon}</View>
      <View>
        <Text style={s.miniStatValue}>{value}</Text>
        <Text style={s.miniStatLabel}>{label.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 13, color: '#AFAFAF', fontWeight: '900', letterSpacing: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { fontSize: 34, fontWeight: '900', color: '#4B4B4B' },
  settingsButton: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff', borderBottomWidth: 5, borderColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  safeStatsCardContainer: { marginBottom: 24 },
  safeStatsCardShadow: { position: 'absolute', bottom: -6, left: 2, right: 2, top: 10, backgroundColor: '#F2F2F2', borderRadius: 28 },
  safeStatsCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 2, borderColor: '#F2F2F2' },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  levelCircle: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 5, borderBottomColor: '#CC5500', borderWidth: 3, borderColor: '#fff' },
  levelValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  levelInfo: { flex: 1, marginLeft: 16 },
  levelLabel: { color: '#4B4B4B', fontSize: 20, fontWeight: '900' },
  xpText: { color: '#AFAFAF', fontSize: 14, fontWeight: '800', marginTop: 2 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 8, borderWidth: 2, borderColor: '#F2F2F2' },
  coinValue: { color: '#FF7F24', fontSize: 20, fontWeight: '900' },
  progressBarWrapper: { marginTop: 4 },
  progressBarContainer: { height: 16, backgroundColor: '#F5F5F5', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#F2F2F2' },
  progressBar: { height: '100%', backgroundColor: '#00CD00', borderRadius: 8 },
  safeStatsRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  miniStat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 14, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  miniStatIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  miniStatValue: { color: '#4B4B4B', fontSize: 17, fontWeight: '900' },
  miniStatLabel: { color: '#AFAFAF', fontSize: 10, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#AFAFAF', letterSpacing: 0.5 },
  refreshText: { fontSize: 14, color: '#FF7F24', fontWeight: '900' },
  questList: { gap: 4 },
  modalWrapper: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 26, maxHeight: height * 0.92, borderTopWidth: 2, borderColor: '#F2F2F2' },
  modalHandle: { width: 45, height: 6, backgroundColor: '#F2F2F2', borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalHeadTitle: { fontSize: 15, fontWeight: '900', color: '#AFAFAF', letterSpacing: 1 },
  modalQuestTitle: { fontSize: 34, fontWeight: '900', color: '#4B4B4B' },
  modalRewards: { flexDirection: 'row', gap: 14, marginTop: 18, marginBottom: 28 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 10, borderWidth: 2, borderColor: '#F2F2F2' },
  modalRewardText: { color: '#4B4B4B', fontWeight: '900', fontSize: 17 },
  bubble: { borderWidth: 2, borderColor: '#F2F2F2', borderRadius: 24, padding: 22, marginBottom: 32, backgroundColor: '#fff' },
  modalDescription: { fontSize: 19, color: '#4B4B4B', lineHeight: 30, fontWeight: '700' },
  proofSection: { backgroundColor: '#F9F9F9', borderRadius: 28, padding: 26, marginBottom: 34, borderWidth: 2, borderColor: '#F2F2F2' },
  proofTitle: { fontSize: 15, fontWeight: '900', color: '#AFAFAF', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 },
  imageSelectorRow: { flexDirection: 'row', gap: 14 },
  cameraBtn: { flex: 1, height: 110, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E5E5' },
  cameraBtnText: { color: '#FF7F24', fontWeight: '900', fontSize: 13, marginTop: 10 },
  previewContainer: { width: '100%', height: 220, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#F2F2F2' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImgBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: '#FF4B4B', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 32, zIndex: 9999 },
  successCard: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 40, padding: 36, borderWidth: 3, borderColor: '#F2F2F2', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  successIconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#CC5500', borderWidth: 4, borderColor: '#fff' },
  successTitle: { fontSize: 36, fontWeight: '900', color: '#4B4B4B', marginTop: 28 },
  successFeedback: { fontSize: 20, color: '#AFAFAF', textAlign: 'center', marginTop: 18, fontWeight: '700', lineHeight: 28 },
  successRewards: { flexDirection: 'row', gap: 40, marginTop: 40 },
  successRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#F2F2F2' },
  successRewardValue: { fontSize: 20, fontWeight: '900', color: '#4B4B4B' },
  questButtonsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  questBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  questBtnAi: { backgroundColor: '#F5E6F8', borderColor: '#9B59B6' },
  questBtnText: { fontSize: 14, fontWeight: '900', color: '#FF7F24', marginTop: 8 },
  questBtnCost: { fontSize: 12, fontWeight: '700', color: '#FF7F24', marginTop: 4 },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  customModalContent: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, borderWidth: 2, borderColor: '#F2F2F2' },
  customModalTitle: { fontSize: 22, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginBottom: 16 },
  customInput: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 2, borderColor: '#F2F2F2', marginBottom: 16, minHeight: 100, textAlignVertical: 'top' },
  customModalButtons: { flexDirection: 'row', gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  customModalBtnCancel: { backgroundColor: '#F2F2F2' },
  customModalBtnConfirm: { backgroundColor: '#9B59B6' },
  customModalBtnText: { fontSize: 16, fontWeight: '900' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 13, color: '#94A3B8', fontWeight: '900', letterSpacing: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { fontSize: 34, fontWeight: '900', color: '#F1F5F9' },
  settingsButton: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#1E293B', borderBottomWidth: 5, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  safeStatsCardContainer: { marginBottom: 24 },
  safeStatsCardShadow: { position: 'absolute', bottom: -6, left: 2, right: 2, top: 10, backgroundColor: '#1E293B', borderRadius: 28 },
  safeStatsCard: { backgroundColor: '#1E293B', borderRadius: 28, padding: 22, borderWidth: 2, borderColor: '#334155' },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  levelCircle: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 5, borderBottomColor: '#CC5500', borderWidth: 3, borderColor: '#1E293B' },
  levelValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  levelInfo: { flex: 1, marginLeft: 16 },
  levelLabel: { color: '#F1F5F9', fontSize: 20, fontWeight: '900' },
  xpText: { color: '#94A3B8', fontSize: 14, fontWeight: '800', marginTop: 2 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 8, borderWidth: 2, borderColor: '#475569' },
  coinValue: { color: '#FF7F24', fontSize: 20, fontWeight: '900' },
  progressBarWrapper: { marginTop: 4 },
  progressBarContainer: { height: 16, backgroundColor: '#334155', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#475569' },
  progressBar: { height: '100%', backgroundColor: '#00CD00', borderRadius: 8 },
  safeStatsRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  miniStat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 22, padding: 14, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  miniStatIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  miniStatValue: { color: '#F1F5F9', fontSize: 17, fontWeight: '900' },
  miniStatLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#94A3B8', letterSpacing: 0.5 },
  refreshText: { fontSize: 14, color: '#FF7F24', fontWeight: '900' },
  questList: { gap: 4 },
  modalWrapper: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 26, maxHeight: height * 0.92, borderTopWidth: 2, borderColor: '#334155' },
  modalHandle: { width: 45, height: 6, backgroundColor: '#334155', borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalHeadTitle: { fontSize: 15, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  modalQuestTitle: { fontSize: 34, fontWeight: '900', color: '#F1F5F9' },
  modalRewards: { flexDirection: 'row', gap: 14, marginTop: 18, marginBottom: 28 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 10, borderWidth: 2, borderColor: '#475569' },
  modalRewardText: { color: '#F1F5F9', fontWeight: '900', fontSize: 17 },
  bubble: { borderWidth: 2, borderColor: '#334155', borderRadius: 24, padding: 22, marginBottom: 32, backgroundColor: '#1E293B' },
  modalDescription: { fontSize: 19, color: '#F1F5F9', lineHeight: 30, fontWeight: '700' },
  proofSection: { backgroundColor: '#334155', borderRadius: 28, padding: 26, marginBottom: 34, borderWidth: 2, borderColor: '#475569' },
  proofTitle: { fontSize: 15, fontWeight: '900', color: '#94A3B8', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 },
  imageSelectorRow: { flexDirection: 'row', gap: 14 },
  cameraBtn: { flex: 1, height: 110, backgroundColor: '#1E293B', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#475569' },
  cameraBtnText: { color: '#FF7F24', fontWeight: '900', fontSize: 13, marginTop: 10 },
  previewContainer: { width: '100%', height: 220, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#475569' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImgBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: '#FF4B4B', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#1E293B' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 32, zIndex: 9999 },
  successCard: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.98)', borderRadius: 40, padding: 36, borderWidth: 3, borderColor: '#334155' },
  successIconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#CC5500', borderWidth: 4, borderColor: '#1E293B' },
  successTitle: { fontSize: 36, fontWeight: '900', color: '#F1F5F9', marginTop: 28 },
  successFeedback: { fontSize: 20, color: '#94A3B8', textAlign: 'center', marginTop: 18, fontWeight: '700', lineHeight: 28 },
  successRewards: { flexDirection: 'row', gap: 40, marginTop: 40 },
  successRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#475569' },
  successRewardValue: { fontSize: 20, fontWeight: '900', color: '#F1F5F9' },
  questButtonsRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  questBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  questBtnAi: { backgroundColor: '#2E1065', borderColor: '#A78BFA' },
  questBtnText: { fontSize: 14, fontWeight: '900', color: '#FF7F24', marginTop: 8 },
  questBtnCost: { fontSize: 12, fontWeight: '700', color: '#FF7F24', marginTop: 4 },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  customModalContent: { backgroundColor: '#1E293B', borderRadius: 28, padding: 24, borderWidth: 2, borderColor: '#334155' },
  customModalTitle: { fontSize: 22, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginBottom: 16 },
  customInput: { backgroundColor: '#334155', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 2, borderColor: '#475569', marginBottom: 16, minHeight: 100, textAlignVertical: 'top', color: '#F1F5F9' },
  customModalButtons: { flexDirection: 'row', gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  customModalBtnCancel: { backgroundColor: '#334155' },
  customModalBtnConfirm: { backgroundColor: '#A78BFA' },
  customModalBtnText: { fontSize: 16, fontWeight: '900' },
});