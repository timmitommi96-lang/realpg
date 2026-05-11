import CustomButton from '@/components/CustomButton';
import FoxMascot, { FoxExpression } from '@/components/FoxMascot';
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
import React, { useEffect, useState, useMemo } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
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
  const router = useRouter();
  const { isDark, isNeon, colors } = useTheme();
  const {
    stats,
    quests,
    aiQuests,
    rollQuests,
    replaceQuest,
    replaceAiQuest,
    generateCustomQuest,
    completeQuest,
    isGeneratingQuests,
    checkLoginBonus,
    collectDailyBonus,
    dailyBonusCollected,
    aiMode,
    hasActiveBuff
  } = useAppStore();
  
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
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState({ coins: 0, xp: 0 });
  
  const safeStats = stats || { level: 1, xp: 0, coins: 10, xpToNextLevel: 100, title: "Anfänger", streak: 0, questsCompleted: 0 };
  const progressPercent = (safeStats.xp / safeStats.xpToNextLevel) * 100;

  const s = isNeon ? stylesNeon : (isDark ? stylesDark : stylesLight);

  useEffect(() => {
    async function loadData() {
      const p = await getUserProfile();
      setProfile(p);
      const isNewLogin = checkLoginBonus();
      if (isNewLogin) {
        setShowDailyBonus(true);
      }
    }
    loadData();
  }, []);

  const foxState = useMemo(() => {
    const name = profile?.nickname || 'Held';

    if (!dailyBonusCollected) {
      return {
        message: `Hey ${name}! Ich habe ein Geschenk für dich entdeckt! ✨`,
        expression: 'excited' as FoxExpression
      };
    }

    if (safeStats.streak > 3) {
      return {
        message: `${safeStats.streak} Tage am Stück! Du bist eine Legende, ${name}! 🔥`,
        expression: 'happy' as FoxExpression
      };
    }

    if (safeStats.coins < 20 && quests.length === 0) {
      return {
        message: "Oje, wir brauchen Gold! Erledige eine Quest, um wieder flüssig zu sein.",
        expression: 'sad' as FoxExpression
      };
    }

    if (quests.length === 0) {
      return {
        message: "Bereit für neue Abenteuer? Würfle uns ein paar Quests aus!",
        expression: 'thinking' as FoxExpression
      };
    }

    return {
      message: `Auf geht's, ${name}! Schnapp dir die XP!`,
      expression: 'idle' as FoxExpression
    };
  }, [profile, dailyBonusCollected, safeStats.streak, safeStats.coins, quests.length]);

  const handleCollectDailyBonus = () => {
    const bonus = collectDailyBonus();
    if (bonus) {
      setBonusAmount(bonus);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowDailyBonus(false);
      Alert.alert("Täglicher Bonus! 🎁", `Du hast ${bonus.coins} Münzen und ${bonus.xp} XP erhalten!`);
    }
  };

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
    const rollCost = 50;
    if (safeStats.coins < rollCost) {
      Alert.alert("Nicht genug Münzen!", `Du brauchst ${rollCost} Münzen um 5 neue Quests zu würfeln.`);
      return;
    }
    
    Alert.alert(
      "Quests neu würfeln",
      "Das kostet 50 Münzen. Alle aktuellen Quests werden durch 5 neue ersetzt.",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Würfeln", 
          onPress: async () => {
            const success = await rollQuests();
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  };

  const handleReplaceQuest = async (index: number) => {
    if (safeStats.coins < 10) {
      Alert.alert("Nicht genug Münzen!", "Du brauchst 10 Münzen um eine Quest zu ersetzen.");
      return;
    }
    const success = await replaceQuest(index);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleReplaceAiQuest = async (index: number) => {
    if (safeStats.coins < 50) {
      Alert.alert("Nicht genug Münzen!", "Du brauchst 50 Münzen um eine KI-Quest zu ersetzen.");
      return;
    }
    const success = await replaceAiQuest(index);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleGenerateCustomQuest = async () => {
    if (aiMode === 'off' || aiMode === null) {
      Alert.alert("Nicht verfügbar", "KI-Quests sind deaktiviert. Aktiviere sie in den Einstellungen.");
      return;
    }
    if (!customGoal.trim()) {
      Alert.alert("Fehler", "Bitte beschreibe, was du erreichen möchtest!");
      return;
    }
    
    if (aiQuests.length >= 5) {
      setShowCustomModal(false);
      Alert.alert(
        "KI-Quest ersetzen",
        "Du hast bereits 5 KI-Quests. Welche möchtest du ersetzen?",
        [
          ...aiQuests.map((q, i) => ({
            text: `${i + 1}: ${q.title}`,
            onPress: async () => {
              await handleReplaceAiQuest(i);
            }
          })),
          { text: "Abbrechen", style: "cancel" }
        ]
      );
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
    } else {
      Alert.alert("Fehler", "Die KI konnte keine Quest erstellen.");
    }
    setCustomGoal("");
  };

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
      Alert.alert("Fehler", "Bitte mach zuerst ein Foto von deinem Beweis!");
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
      Alert.alert("Quest erledigt!", "Deine Quest wurde erfolgreich abgeschlossen!");
      setShowSuccess(true);
    }
  };

  const handleFinishSuccess = () => {
    if (selectedQuest) completeQuest(selectedQuest.title);
    setShowSuccess(false);
    setShowModal(false);
    setSelectedQuest(null);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>WILLKOMMEN ZURÜCK,</Text>
          <View style={s.titleRow}>
            <Text style={s.titleText}>{profile?.nickname || 'Held'}</Text>
            <Crown size={22} color={isNeon ? "#00F0FF" : "#FFD700"} fill={isNeon ? "#00F0FF" : "#FFD700"} />
          </View>
        </View>
        <TouchableOpacity style={s.settingsButton} onPress={() => router.push('/settings')}>
          <Settings color={isDark ? (isNeon ? "#FF00E4" : "#94A3B8") : "#AFAFAF"} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={s.safeStatsCardContainer}>
           <View style={s.safeStatsCardShadow} />
           <LinearGradient
            colors={isNeon ? ['#261447', '#0D0221'] : (isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#FDFDFD'])}
            style={s.safeStatsCard}
           >
            <View style={s.levelHeader}>
                <LinearGradient 
                    colors={isNeon ? ['#FF00E4', '#7C3AED'] : ['#FF7F24', '#FF5500']}
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
                    <Zap size={18} color={isNeon ? "#00F0FF" : "#FF7F24"} fill={isNeon ? "#00F0FF" : "#FF7F24"} />
                </View>
            </View>
            <View style={s.progressBarWrapper}>
                <View style={s.progressBarContainer}>
                    <View style={[s.progressBar, { width: `${progressPercent}%`, backgroundColor: isNeon ? '#FF00E4' : '#00CD00' }]} />
                    <LinearGradient 
                        colors={['rgba(255,255,255,0.3)', 'transparent']} 
                        style={StyleSheet.absoluteFill} 
                        start={{x:0, y:0}} 
                        end={{x:1, y:1}}
                    />
                </View>
            </View>
            {(hasActiveBuff('xp_boost') || hasActiveBuff('coins_boost')) && (
              <View style={s.buffRow}>
                {hasActiveBuff('xp_boost') && (
                  <View style={[s.buffTag, { backgroundColor: isNeon ? '#FF00E420' : '#3B82F620' }]}>
                    <Sparkles size={12} color={isNeon ? '#FF00E4' : '#3B82F6'} />
                    <Text style={[s.buffTagText, { color: isNeon ? '#FF00E4' : '#3B82F6' }]}>XP +50%</Text>
                  </View>
                )}
                {hasActiveBuff('coins_boost') && (
                  <View style={[s.buffTag, { backgroundColor: isNeon ? '#00F0FF20' : '#FF7F2420' }]}>
                    <Zap size={12} color={isNeon ? '#00F0FF' : '#FF7F24'} />
                    <Text style={[s.buffTagText, { color: isNeon ? '#00F0FF' : '#FF7F24' }]}>COINS +50%</Text>
                  </View>
                )}
              </View>
            )}
           </LinearGradient>
        </View>

        <View style={s.safeStatsRow}>
          <MiniStat icon={<Flame color="#FF4B4B" size={24} />} value={(safeStats?.streak ?? 0).toString()} label="Streak" isDark={isDark} isNeon={isNeon} />
          <MiniStat icon={<ShoppingBag color={isNeon ? "#00F0FF" : "#FF7F24"} size={24} />} value="Markt" label="Shop" onPress={() => router.push('/(tabs)/shop')} isDark={isDark} isNeon={isNeon} />
          <MiniStat icon={<Trophy color={isNeon ? "#FF00E4" : "#FFD700"} size={24} />} value={(safeStats?.questsCompleted ?? 0).toString()} label="Erfolge" isDark={isDark} isNeon={isNeon} />
        </View>

        <FoxMascot 
          message={foxState.message}
          expression={foxState.expression}
        />

        {!dailyBonusCollected && (
          <TouchableOpacity style={s.dailyBonusCard} onPress={handleCollectDailyBonus}>
            <View style={s.dailyBonusIcon}>
              <Sparkles color="#FFD700" size={28} />
            </View>
            <View style={s.dailyBonusContent}>
              <Text style={s.dailyBonusTitle}>TÄGLICHER BONUS!</Text>
              <Text style={s.dailyBonusDesc}>+20 Münzen & +30 XP</Text>
            </View>
            <View style={s.dailyBonusButton}>
              <Text style={s.dailyBonusButtonText}>HOLEN</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={s.questSection}>
          <View style={s.questButtonsRow}>
            <TouchableOpacity style={s.questBtn} onPress={handleRollQuests}>
              <Dice5 color={isNeon ? "#00F0FF" : "#FF7F24"} size={28} />
              <Text style={s.questBtnText}>5 NEUE QUESTS</Text>
              <Text style={s.questBtnCost}>50 🪙</Text>
            </TouchableOpacity>
            {aiMode !== 'off' && (
              <TouchableOpacity style={[s.questBtn, s.questBtnAi]} onPress={() => setShowCustomModal(true)}>
                <Sparkles color={isNeon ? "#FF00E4" : "#9B59B6"} size={28} />
                <Text style={[s.questBtnText, { color: isNeon ? "#FF00E4" : '#9B59B6' }]}>KI QUEST</Text>
                <Text style={[s.questBtnCost, { color: isNeon ? "#FF00E4" : '#9B59B6' }]}>50 🪙</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {quests.length > 0 && (
          <View style={s.questSection}>
            <Text style={s.sectionTitle}>DEINE QUESTS ({quests.length}/5)</Text>
            {quests.map((quest, index) => (
              <View key={`quest-${index}`}>
                <QuestCard quest={quest} onPress={() => openQuestDetail(quest)} />
                <TouchableOpacity 
                  style={s.replaceBtn}
                  onPress={() => handleReplaceQuest(index)}
                >
                  <Text style={s.replaceBtnText}>ERSETZEN (10 🪙)</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {aiMode !== 'off' && aiQuests.length > 0 && (
          <View style={s.questSection}>
            <Text style={[s.sectionTitle, { color: isNeon ? "#FF00E4" : '#9B59B6' }]}>KI-QUESTS ({aiQuests.length}/5)</Text>
            {aiQuests.map((quest, index) => (
              <View key={`ai-${index}`}>
                <QuestCard quest={quest} onPress={() => openQuestDetail(quest)} isAiQuest />
                <TouchableOpacity 
                  style={[s.replaceBtn, s.replaceBtnAi]}
                  onPress={() => handleReplaceAiQuest(index)}
                >
                  <Text style={[s.replaceBtnText, { color: isNeon ? "#FF00E4" : '#9B59B6' }]}>ERSETZEN (50 🪙)</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {quests.length === 0 && (aiMode === 'off' || aiQuests.length === 0) && (
          <View style={s.emptyQuests}>
            <Text style={s.emptyQuestsText}>Keine Quests vorhanden!</Text>
            <Text style={s.emptyQuestsSubtext}>Würfle neue Quests oder erstelle KI-Quests.</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {showModal && selectedQuest && (
        <View style={[StyleSheet.absoluteFill, s.modalWrapper]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeQuestDetail} />
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            
            <View style={{ alignItems: 'center', marginTop: -60, marginBottom: 10 }}>
                <Image source={require('../../assets/images/fox_quest_accepted.png')} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
            </View>

            <View style={s.modalHeader}>
              <Text style={s.modalHeadTitle}>QUEST DETAILS</Text>
              <TouchableOpacity onPress={closeQuestDetail}><X color={isDark ? (isNeon ? "#FF00E4" : "#94A3B8") : "#AFAFAF"} size={28} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalQuestTitle}>{selectedQuest.title}</Text>
              <View style={s.modalRewards}>
                <View style={s.modalRewardItem}>
                  <Trophy size={18} color={isNeon ? "#FF00E4" : "#FFD700"} /><Text style={s.modalRewardText}>{selectedQuest.xp} XP</Text>
                </View>
                <View style={s.modalRewardItem}>
                  <Zap size={18} color={isNeon ? "#00F0FF" : "#FF7F24"} fill={isNeon ? "#00F0FF" : "#FF7F24"} /><Text style={s.modalRewardText}>{selectedQuest.coins}</Text>
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
                    <TouchableOpacity style={s.cameraBtn} onPress={() => pickImage(true)}><Camera color={isNeon ? "#FF00E4" : "#FF7F24"} size={32} /><Text style={s.cameraBtnText}>FOTO</Text></TouchableOpacity>
                    <TouchableOpacity style={s.cameraBtn} onPress={() => pickImage(false)}><ImageIcon color={isNeon ? "#FF00E4" : "#FF7F24"} size={32} /><Text style={s.cameraBtnText}>GALERIE</Text></TouchableOpacity>
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
          <BlurView intensity={90} style={StyleSheet.absoluteFill} tint={isDark ? "dark" : "light"} />
          <View style={s.successCard}>
            <Image 
                source={require('../../assets/images/fox_quest_completed.png')} 
                style={{ width: 160, height: 160, resizeMode: 'contain', marginBottom: 10 }} 
            />
            <Text style={s.successTitle}>HELDENHAFT!</Text>
            <Text style={s.successFeedback}>{aiFeedback}</Text>
            <View style={s.successRewards}>
              <View style={s.successRewardItem}><Trophy size={24} color={isNeon ? "#FF00E4" : "#FFD700"} /><Text style={s.successRewardValue}>+{selectedQuest?.xp} XP</Text></View>
              <View style={s.successRewardItem}><Zap size={24} color={isNeon ? "#00F0FF" : "#FF7F24"} fill={isNeon ? "#00F0FF" : "#FF7F24"} /><Text style={s.successRewardValue}>+{selectedQuest?.coins} MUENZEN</Text></View>
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
              placeholder="z.B. Mehr Sport treiben, besser lernen..."
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

function MiniStat({ icon, value, label, onPress, isDark, isNeon }: { icon: any, value: string, label: string, onPress?: () => void, isDark: boolean, isNeon?: boolean }) {
  const s = isNeon ? stylesNeon : (isDark ? stylesDark : stylesLight);
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
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  dailyBonusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E7', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 2, borderColor: '#FFD700', borderBottomWidth: 6 },
  dailyBonusIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFE066', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  dailyBonusContent: { flex: 1 },
  dailyBonusTitle: { fontSize: 14, fontWeight: '900', color: '#B8860B' },
  dailyBonusDesc: { fontSize: 13, fontWeight: '800', color: '#DAA520', marginTop: 2 },
  dailyBonusButton: { backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  dailyBonusButtonText: { fontSize: 12, fontWeight: '900', color: '#8B6914' },
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
  buffRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  buffTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  buffTagText: { fontSize: 10, fontWeight: '900' },
  safeStatsRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  miniStat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 14, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  miniStatIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  miniStatValue: { color: '#4B4B4B', fontSize: 17, fontWeight: '900' },
  miniStatLabel: { color: '#AFAFAF', fontSize: 10, fontWeight: '900' },
  questSection: { marginBottom: 24 },
  questButtonsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  questBtn: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  questBtnAi: { backgroundColor: '#F5E6F8', borderColor: '#9B59B6' },
  questBtnText: { fontSize: 12, fontWeight: '900', color: '#FF7F24', marginTop: 8 },
  questBtnCost: { fontSize: 11, fontWeight: '700', color: '#FF7F24', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#AFAFAF', letterSpacing: 1, marginBottom: 12 },
  replaceBtn: { backgroundColor: '#F0F0F0', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginTop: -8 },
  replaceBtnAi: { backgroundColor: '#F5E6F8' },
  replaceBtnText: { fontSize: 12, fontWeight: '800', color: '#FF7F24' },
  emptyQuests: { alignItems: 'center', padding: 40 },
  emptyQuestsText: { fontSize: 18, fontWeight: '800', color: '#AFAFAF', marginBottom: 8 },
  emptyQuestsSubtext: { fontSize: 14, color: '#AFAFAF', textAlign: 'center' },
  modalWrapper: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 26, maxHeight: height * 0.92, borderTopWidth: 2, borderColor: '#F2F2F2' },
  modalHandle: { width: 45, height: 6, backgroundColor: '#F2F2F2', borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalHeadTitle: { fontSize: 15, fontWeight: '900', color: '#AFAFAF', letterSpacing: 1 },
  modalQuestTitle: { fontSize: 28, fontWeight: '900', color: '#4B4B4B' },
  modalRewards: { flexDirection: 'row', gap: 14, marginTop: 18, marginBottom: 28 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 10, borderWidth: 2, borderColor: '#F2F2F2' },
  modalRewardText: { color: '#4B4B4B', fontWeight: '900', fontSize: 17 },
  bubble: { borderWidth: 2, borderColor: '#F2F2F2', borderRadius: 24, padding: 22, marginBottom: 32, backgroundColor: '#fff' },
  modalDescription: { fontSize: 17, color: '#4B4B4B', lineHeight: 26, fontWeight: '700' },
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
  successIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#CC5500', borderWidth: 4, borderColor: '#fff' },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#4B4B4B', marginTop: 24 },
  successFeedback: { fontSize: 18, color: '#AFAFAF', textAlign: 'center', marginTop: 16, fontWeight: '700', lineHeight: 26 },
  successRewards: { flexDirection: 'row', gap: 30, marginTop: 30 },
  successRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9F9F9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 2, borderColor: '#F2F2F2' },
  successRewardValue: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  customModalContent: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, borderWidth: 2, borderColor: '#F2F2F2' },
  customModalTitle: { fontSize: 20, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginBottom: 16 },
  customInput: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 2, borderColor: '#F2F2F2', marginBottom: 16, minHeight: 100, textAlignVertical: 'top' },
  customModalButtons: { flexDirection: 'row', gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  customModalBtnCancel: { backgroundColor: '#F2F2F2' },
  customModalBtnConfirm: { backgroundColor: '#9B59B6' },
  customModalBtnText: { fontSize: 16, fontWeight: '900' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  dailyBonusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E1F00', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 2, borderColor: '#FFD700', borderBottomWidth: 6 },
  dailyBonusIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4A3800', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  dailyBonusContent: { flex: 1 },
  dailyBonusTitle: { fontSize: 14, fontWeight: '900', color: '#FFD700' },
  dailyBonusDesc: { fontSize: 13, fontWeight: '800', color: '#FFA500', marginTop: 2 },
  dailyBonusButton: { backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  dailyBonusButtonText: { fontSize: 12, fontWeight: '900', color: '#4A3800' },
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
  buffRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  buffTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  buffTagText: { fontSize: 10, fontWeight: '900' },
  safeStatsRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  miniStat: { flex: 1, backgroundColor: '#1E293B', borderRadius: 22, padding: 14, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  miniStatIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  miniStatValue: { color: '#F1F5F9', fontSize: 17, fontWeight: '900' },
  miniStatLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900' },
  questSection: { marginBottom: 24 },
  questButtonsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  questBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  questBtnAi: { backgroundColor: '#2E1065', borderColor: '#A78BFA' },
  questBtnText: { fontSize: 12, fontWeight: '900', color: '#FF7F24', marginTop: 8 },
  questBtnCost: { fontSize: 11, fontWeight: '700', color: '#FF7F24', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 12 },
  replaceBtn: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginTop: -8, borderWidth: 1, borderColor: '#334155' },
  replaceBtnAi: { backgroundColor: '#2E1065', borderColor: '#A78BFA' },
  replaceBtnText: { fontSize: 12, fontWeight: '800', color: '#FF7F24' },
  emptyQuests: { alignItems: 'center', padding: 40 },
  emptyQuestsText: { fontSize: 18, fontWeight: '800', color: '#94A3B8', marginBottom: 8 },
  emptyQuestsSubtext: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  modalWrapper: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 26, maxHeight: height * 0.92, borderTopWidth: 2, borderColor: '#334155' },
  modalHandle: { width: 45, height: 6, backgroundColor: '#334155', borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalHeadTitle: { fontSize: 15, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  modalQuestTitle: { fontSize: 28, fontWeight: '900', color: '#F1F5F9' },
  modalRewards: { flexDirection: 'row', gap: 14, marginTop: 18, marginBottom: 28 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 10, borderWidth: 2, borderColor: '#475569' },
  modalRewardText: { color: '#F1F5F9', fontWeight: '900', fontSize: 17 },
  bubble: { borderWidth: 2, borderColor: '#334155', borderRadius: 24, padding: 22, marginBottom: 32, backgroundColor: '#1E293B' },
  modalDescription: { fontSize: 17, color: '#F1F5F9', lineHeight: 26, fontWeight: '700' },
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
  successIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#CC5500', borderWidth: 4, borderColor: '#1E293B' },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#F1F5F9', marginTop: 24 },
  successFeedback: { fontSize: 18, color: '#94A3B8', textAlign: 'center', marginTop: 16, fontWeight: '700', lineHeight: 26 },
  successRewards: { flexDirection: 'row', gap: 30, marginTop: 30 },
  successRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#334155', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 2, borderColor: '#475569' },
  successRewardValue: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  customModalContent: { backgroundColor: '#1E293B', borderRadius: 28, padding: 24, borderWidth: 2, borderColor: '#334155' },
  customModalTitle: { fontSize: 20, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginBottom: 16 },
  customInput: { backgroundColor: '#334155', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 2, borderColor: '#475569', marginBottom: 16, minHeight: 100, textAlignVertical: 'top', color: '#F1F5F9' },
  customModalButtons: { flexDirection: 'row', gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  customModalBtnCancel: { backgroundColor: '#334155' },
  customModalBtnConfirm: { backgroundColor: '#A78BFA' },
  customModalBtnText: { fontSize: 16, fontWeight: '900' },
});

const stylesNeon = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0221' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  dailyBonusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D0054', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 2, borderColor: '#FF00E4', borderBottomWidth: 6 },
  dailyBonusIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FF00E420', justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#FF00E4' },
  dailyBonusContent: { flex: 1 },
  dailyBonusTitle: { fontSize: 14, fontWeight: '900', color: '#FF00E4', textShadowColor: '#FF00E4', textShadowRadius: 5 },
  dailyBonusDesc: { fontSize: 13, fontWeight: '800', color: '#00F0FF', marginTop: 2 },
  dailyBonusButton: { backgroundColor: '#FF00E4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  dailyBonusButtonText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  greeting: { fontSize: 13, color: '#FF00E4', fontWeight: '900', letterSpacing: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleText: { fontSize: 34, fontWeight: '900', color: '#FFFFFF', textShadowColor: '#00F0FF', textShadowRadius: 10 },
  settingsButton: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#261447', borderBottomWidth: 5, borderColor: '#FF00E4', justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  safeStatsCardContainer: { marginBottom: 24 },
  safeStatsCardShadow: { position: 'absolute', bottom: -6, left: 2, right: 2, top: 10, backgroundColor: '#261447', borderRadius: 28 },
  safeStatsCard: { backgroundColor: '#261447', borderRadius: 28, padding: 22, borderWidth: 2, borderColor: '#00F0FF' },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  levelCircle: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 5, borderBottomColor: '#7C3AED', borderWidth: 3, borderColor: '#00F0FF' },
  levelValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  levelInfo: { flex: 1, marginLeft: 16 },
  levelLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textShadowColor: '#FF00E4', textShadowRadius: 5 },
  xpText: { color: '#00F0FF', fontSize: 14, fontWeight: '800', marginTop: 2 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D0221', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 8, borderWidth: 2, borderColor: '#FF00E4' },
  coinValue: { color: '#00F0FF', fontSize: 20, fontWeight: '900' },
  progressBarWrapper: { marginTop: 4 },
  progressBarContainer: { height: 16, backgroundColor: '#0D0221', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#FF00E4' },
  progressBar: { height: '100%', borderRadius: 8 },
  buffRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  buffTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  buffTagText: { fontSize: 10, fontWeight: '900' },
  safeStatsRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  miniStat: { flex: 1, backgroundColor: '#261447', borderRadius: 22, padding: 14, alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#FF00E4', borderBottomWidth: 6 },
  miniStatIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#0D0221', justifyContent: 'center', alignItems: 'center' },
  miniStatValue: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  miniStatLabel: { color: '#00F0FF', fontSize: 10, fontWeight: '900' },
  questSection: { marginBottom: 24 },
  questButtonsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  questBtn: { flex: 1, backgroundColor: '#261447', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: '#FF00E4', borderBottomWidth: 6 },
  questBtnAi: { backgroundColor: '#2D0054', borderColor: '#00F0FF' },
  questBtnText: { fontSize: 12, fontWeight: '900', color: '#00F0FF', marginTop: 8 },
  questBtnCost: { fontSize: 11, fontWeight: '700', color: '#00F0FF', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#FF00E4', letterSpacing: 2, marginBottom: 12 },
  replaceBtn: { backgroundColor: '#261447', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginTop: -8, borderWidth: 1, borderColor: '#00F0FF' },
  replaceBtnAi: { backgroundColor: '#2D0054', borderColor: '#FF00E4' },
  replaceBtnText: { fontSize: 12, fontWeight: '800', color: '#00F0FF' },
  emptyQuests: { alignItems: 'center', padding: 40 },
  emptyQuestsText: { fontSize: 18, fontWeight: '800', color: '#FF00E4', marginBottom: 8 },
  emptyQuestsSubtext: { fontSize: 14, color: '#00F0FF', textAlign: 'center' },
  modalWrapper: { backgroundColor: 'rgba(13,2,33,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#261447', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 26, maxHeight: height * 0.92, borderTopWidth: 2, borderColor: '#FF00E4' },
  modalHandle: { width: 45, height: 6, backgroundColor: '#FF00E4', borderRadius: 3, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalHeadTitle: { fontSize: 15, fontWeight: '900', color: '#FF00E4', letterSpacing: 2 },
  modalQuestTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', textShadowColor: '#00F0FF', textShadowRadius: 5 },
  modalRewards: { flexDirection: 'row', gap: 14, marginTop: 18, marginBottom: 28 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D0221', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, gap: 10, borderWidth: 2, borderColor: '#FF00E4' },
  modalRewardText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  bubble: { borderWidth: 2, borderColor: '#00F0FF', borderRadius: 24, padding: 22, marginBottom: 32, backgroundColor: '#2D0054' },
  modalDescription: { fontSize: 17, color: '#FFFFFF', lineHeight: 26, fontWeight: '700' },
  proofSection: { backgroundColor: '#0D0221', borderRadius: 28, padding: 26, marginBottom: 34, borderWidth: 2, borderColor: '#FF00E4' },
  proofTitle: { fontSize: 15, fontWeight: '900', color: '#00F0FF', marginBottom: 18, textAlign: 'center', letterSpacing: 1 },
  imageSelectorRow: { flexDirection: 'row', gap: 14 },
  cameraBtn: { flex: 1, height: 110, backgroundColor: '#261447', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#FF00E4' },
  cameraBtnText: { color: '#FF00E4', fontWeight: '900', fontSize: 13, marginTop: 10 },
  previewContainer: { width: '100%', height: 220, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#00F0FF' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImgBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: '#FF00E4', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 32, zIndex: 9999 },
  successCard: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(38,20,71,0.98)', borderRadius: 40, padding: 36, borderWidth: 3, borderColor: '#00F0FF' },
  successIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8, borderBottomColor: '#CC5500', borderWidth: 4, borderColor: '#1E293B' },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 24, textShadowColor: '#FF00E4', textShadowRadius: 10 },
  successFeedback: { fontSize: 18, color: '#00F0FF', textAlign: 'center', marginTop: 16, fontWeight: '700', lineHeight: 26 },
  successRewards: { flexDirection: 'row', gap: 30, marginTop: 30 },
  successRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0D0221', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 2, borderColor: '#FF00E4' },
  successRewardValue: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13,2,33,0.8)', justifyContent: 'center', padding: 24 },
  customModalContent: { backgroundColor: '#261447', borderRadius: 28, padding: 24, borderWidth: 2, borderColor: '#00F0FF' },
  customModalTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  customInput: { backgroundColor: '#0D0221', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 2, borderColor: '#FF00E4', marginBottom: 16, minHeight: 100, textAlignVertical: 'top', color: '#FFFFFF' },
  customModalButtons: { flexDirection: 'row', gap: 12 },
  customModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  customModalBtnCancel: { backgroundColor: '#0D0221' },
  customModalBtnConfirm: { backgroundColor: '#FF00E4' },
  customModalBtnText: { fontSize: 16, fontWeight: '900' },
});
