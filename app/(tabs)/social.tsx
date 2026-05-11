import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Share, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppStore } from '@/src/store/useAppStore';
import { getUserProfile } from '@/src/services/db';
import FoxMascot from '@/components/FoxMascot';
import { Users, Share2, Trophy, Star, Crown, Heart, MessageCircle, Send, Copy, Plus, Check, X, QrCode, UserPlus, Cloud, RefreshCw, ShieldAlert, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SocialScreen() {
  const { isDark, isNeon, colors } = useTheme();
  const { 
    stats, friends, friendRequests, generateInviteCode, inviteCode, addFriend, 
    acceptFriendRequest, declineFriendRequest, getLeaderboard, accountType,
    cloudFriends, cloudFriendRequests, cloudLeaderboard, cloudInviteCode, syncToCloud, loadCloudFriends,
    loadCloudFriendRequests, loadCloudLeaderboard, addCloudFriend, acceptCloudFriendRequest, declineCloudFriendRequest, loadCloudIdentity
  } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [loading, setLoading] = useState(false);

  const s = isNeon ? stylesNeon : (isDark ? stylesDark : stylesLight);

  const isCloud = accountType === 'cloud';

  React.useEffect(() => {
    async function loadProfile() {
      const p = await getUserProfile();
      setProfile(p);
    }
    loadProfile();
    
    if (isCloud) {
      loadCloudIdentity();
      loadCloudFriends();
      loadCloudFriendRequests();
      loadCloudLeaderboard();
    }
  }, [isCloud]);

  const myCode = isCloud ? (cloudInviteCode || inviteCode || generateInviteCode()) : (inviteCode || generateInviteCode());
  const leaderboard = isCloud && cloudLeaderboard.length > 0 ? cloudLeaderboard : getLeaderboard();

  const guildStats = useMemo(() => {
    const totalLevel = friends.reduce((sum, f) => sum + f.level, stats.level);
    const totalQuests = friends.reduce((sum, f) => sum + f.questsCompleted, stats.questsCompleted);
    const guildPower = Math.floor((totalLevel * 10) + (totalQuests * 2));
    const rank = guildPower > 5000 ? 'Legendär' : guildPower > 2000 ? 'Elite' : guildPower > 500 ? 'Abenteurer' : 'Anfänger';
    return { power: guildPower, rank, members: friends.length + 1 };
  }, [friends, stats]);

  const displayedFriends = isCloud
    ? cloudFriends.map((friend: any) => ({
        id: friend.friend_id,
        nickname: friend.friend_nickname || 'Unknown',
        level: friend.friend_level || 1,
        questsCompleted: friend.friend_quests || 0,
        streak: friend.friend_streak || 0,
        title: friend.friend_title || 'Anfänger',
      }))
    : friends;

  const displayedRequests = isCloud
    ? cloudFriendRequests.map((request: any) => ({
        id: request.id,
        nickname: request.friend_nickname || 'Unknown',
        level: request.friend_level || 1,
        title: request.friend_title || 'Anfänger',
      }))
    : friendRequests;

  const mascotReaction = useMemo(() => {
    if (displayedRequests.length > 0) {
      return { message: "Oh! Jemand möchte deiner Gilde beitreten. Schau mal bei den Anfragen!", expression: 'excited' };
    }
    if (displayedFriends.length === 0) {
      return { message: "Zusammen macht das Abenteuer mehr Spaß! Deine Gilde wartet auf dich.", expression: 'thinking' };
    }
    return { message: `Unsere Gilde hat jetzt ${guildStats.power} Power! Wir sind unaufhaltsam!`, expression: 'happy' };
  }, [displayedRequests.length, displayedFriends.length, guildStats.power]);

  const handleInvite = async () => {
    const code = myCode;
    const message = `🎮 Tritt meiner Gilde in RealPG bei! Nutze meinen Code: ${code}`;
    try { await Share.share({ message }); } catch (e) {}
  };

  const handleCopyCode = () => {
    Alert.alert('Dein Gilden-Code', `Code: ${myCode}\n\nTeile ihn mit neuen Mitstreitern!`);
  };

  const handleAddByCode = async () => {
    const code = friendCodeInput.trim().toUpperCase();
    if (code.length !== 8) return Alert.alert('Fehler', 'Ungültiger Code.');
    
    if (isCloud) {
      setLoading(true);
      const success = await addCloudFriend(code);
      setLoading(false);
      if (success) Alert.alert('Erfolg', 'Anfrage gesendet!');
      else Alert.alert('Fehler', 'Nicht gefunden.');
    } else {
      Alert.alert('Cloud nötig', 'Aktiviere Cloud-Sync für Gilden-Features.');
    }
    setFriendCodeInput('');
    setShowAddFriend(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.title}>GILDE & SOZIALES</Text>
            <Text style={s.subtitle}>Gemeinsam zum Level-Up!</Text>
          </View>
          {isCloud && (
            <TouchableOpacity style={s.syncButton} onPress={() => syncToCloud()}>
              <RefreshCw color="#10B981" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={isNeon ? ['#261447', '#FF00E4'] : (isDark ? ['#1E293B', '#0F172A'] : ['#FFF5EE', '#FFFFFF'])}
          style={s.guildCard}
          start={{x:0, y:0}} end={{x:1, y:1}}
        >
          <View style={s.guildHeader}>
            <ShieldAlert color={isNeon ? "#00F0FF" : "#FF7F24"} size={32} />
            <View>
              <Text style={s.guildRank}>{guildStats.rank.toUpperCase()}-GILDE</Text>
              <Text style={s.guildPower}>{guildStats.power} Gilden-Power</Text>
            </View>
            <View style={s.memberCount}>
              <Users color="#FFFFFF" size={14} />
              <Text style={s.memberText}>{guildStats.members}</Text>
            </View>
          </View>
        </LinearGradient>

        <FoxMascot
          message={mascotReaction.message}
          expression={mascotReaction.expression as any}
          size={80}
        />

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>NEUE MITSTREITER</Text>
            <TouchableOpacity style={s.addFriendBtn} onPress={() => setShowAddFriend(true)}>
              <Plus color={isNeon ? "#00F0FF" : "#10B981"} size={20} />
              <Text style={[s.addFriendText, isNeon && {color: "#00F0FF"}]}>CODE</Text>
            </TouchableOpacity>
          </View>
          <View style={s.inviteCard}>
            <Text style={s.inviteText}>Lade Freunde ein und verstärke die Gilde!</Text>
            <View style={s.codeDisplay}>
              <Text style={s.codeLabel}>DEIN CODE</Text>
              <Text style={s.codeValue}>{myCode}</Text>
            </View>
            <View style={s.inviteButtons}>
              <TouchableOpacity style={s.inviteButton} onPress={handleInvite}>
                <Send color="#FFFFFF" size={18} />
                <Text style={s.inviteButtonText}>EINLADEN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.copyButton} onPress={handleCopyCode}>
                <Copy color={isNeon ? "#00F0FF" : (isDark ? "#F1F5F9" : "#4B4B4B")} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {displayedRequests.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, {color: '#F59E0B'}]}>OFFENE ANFRAGEN</Text>
            {displayedRequests.map((request: any) => (
              <View key={request.id} style={s.requestItem}>
                <View style={s.requestInfo}>
                  <Text style={s.requestName}>{request.nickname}</Text>
                  <Text style={s.requestLevel}>Level {request.level} • {request.title}</Text>
                </View>
                <View style={s.requestActions}>
                  <TouchableOpacity style={s.acceptButton} onPress={() => isCloud ? acceptCloudFriendRequest(request.id) : acceptFriendRequest(request.id)}>
                    <Check color="#FFFFFF" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.declineButton} onPress={() => isCloud ? declineCloudFriendRequest(request.id) : declineFriendRequest(request.id)}>
                    <X color="#FFFFFF" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.leaderboard}>
          <Text style={s.sectionTitle}>GILDE-RANKING</Text>
          {leaderboard.map((entry: any) => (
            <View key={entry.rank} style={[s.leaderboardItem, entry.isCurrentUser && s.leaderboardItemHighlight]}>
              <Text style={[s.rank, entry.rank <= 3 && s.rankTop]}>#{entry.rank}</Text>
              <View style={s.leaderInfo}>
                <Text style={[s.leaderName, entry.isCurrentUser && s.leaderNameHighlight]}>{entry.nickname}</Text>
                <Text style={s.leaderSub}>{entry.title}</Text>
              </View>
              <View style={s.leaderStats}>
                <Text style={s.leaderLevel}>Lv. {entry.level}</Text>
                <Zap color="#FF7F24" size={12} fill="#FF7F24" />
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showAddFriend} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.content, isNeon ? modalStyles.contentNeon : (isDark ? modalStyles.contentDark : {})]}>
            <Text style={[modalStyles.title, (isDark || isNeon) && { color: '#F1F5F9' }]}>Gilden-Code</Text>
            <TextInput
              style={[modalStyles.input, isNeon ? modalStyles.inputNeon : (isDark ? modalStyles.inputDark : {})]}
              placeholder="CODE"
              placeholderTextColor="#AFAFAF"
              value={friendCodeInput}
              onChangeText={setFriendCodeInput}
              autoCapitalize="characters"
              maxLength={8}
            />
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={modalStyles.actionButton} onPress={() => setShowAddFriend(false)}>
                <Text style={{color: '#AFAFAF', fontWeight: '900'}}>ABBRUCH</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.actionButton, { backgroundColor: isNeon ? '#FF00E4' : '#10B981' }]} onPress={handleAddByCode}>
                <Text style={{color: '#FFFFFF', fontWeight: '900'}}>BEITRETEN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, width: '100%', borderWidth: 3, borderColor: '#F2F2F2' },
  contentDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  contentNeon: { backgroundColor: '#0D0221', borderColor: '#FF00E4' },
  title: { fontSize: 24, fontWeight: '900', color: '#4B4B4B', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 20, fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 4, borderWidth: 2, borderColor: '#F2F2F2', marginBottom: 24 },
  inputDark: { backgroundColor: '#334155', borderColor: '#475569', color: '#F1F5F9' },
  inputNeon: { backgroundColor: '#2D0054', borderColor: '#00F0FF', color: '#FFFFFF' },
  buttonRow: { flexDirection: 'row', gap: 16 },
  actionButton: { flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
});

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 0 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  syncButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#4B4B4B' },
  subtitle: { fontSize: 13, color: '#AFAFAF', fontWeight: '700' },
  guildCard: { padding: 24, borderRadius: 28, marginBottom: 20, marginTop: 10, shadowColor: '#FF7F24', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  guildHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guildRank: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  guildPower: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  memberCount: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#AFAFAF', letterSpacing: 1 },
  addFriendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addFriendText: { fontSize: 12, fontWeight: '900', color: '#10B981' },
  inviteCard: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 24, borderWidth: 2, borderColor: '#F2F2F2' },
  inviteText: { fontSize: 14, color: '#4B4B4B', fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  codeDisplay: { backgroundColor: '#FFF5EE', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: '#FF7F24', borderStyle: 'dashed' },
  codeLabel: { fontSize: 11, color: '#FF7F24', fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  codeValue: { fontSize: 22, fontWeight: '900', color: '#4B4B4B', letterSpacing: 4 },
  inviteButtons: { flexDirection: 'row', gap: 12 },
  inviteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF7F24', paddingVertical: 14, borderRadius: 14 },
  inviteButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  copyButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F2F2F2' },
  requestItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E7', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 2, borderColor: '#FFD700' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: '900', color: '#4B4B4B' },
  requestLevel: { fontSize: 12, color: '#B8860B', fontWeight: '700' },
  requestActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  acceptButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  declineButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  leaderboard: { backgroundColor: '#FDFDFD', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: '#F2F2F2' },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  leaderboardItemHighlight: { backgroundColor: '#FFF5EE', borderRadius: 16, paddingHorizontal: 12, borderBottomWidth: 0, marginBottom: 4 },
  rank: { fontSize: 16, fontWeight: '900', color: '#AFAFAF', width: 32 },
  rankTop: { color: '#FFD700' },
  leaderInfo: { flex: 1, marginLeft: 8 },
  leaderName: { fontSize: 15, fontWeight: '800', color: '#4B4B4B' },
  leaderNameHighlight: { color: '#FF7F24' },
  leaderSub: { fontSize: 11, color: '#AFAFAF', fontWeight: '700' },
  leaderStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderLevel: { fontSize: 14, fontWeight: '900', color: '#4B4B4B' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingTop: 0 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  syncButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#F1F5F9' },
  subtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
  guildCard: { padding: 24, borderRadius: 28, marginBottom: 20, marginTop: 10 },
  guildHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guildRank: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  guildPower: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  memberCount: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  addFriendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#052E16', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addFriendText: { fontSize: 12, fontWeight: '900', color: '#10B981' },
  inviteCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 24, borderWidth: 2, borderColor: '#334155' },
  inviteText: { fontSize: 14, color: '#F1F5F9', fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  codeDisplay: { backgroundColor: '#2D1B0E', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: '#FF7F24', borderStyle: 'dashed' },
  codeLabel: { fontSize: 11, color: '#FF7F24', fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  codeValue: { fontSize: 22, fontWeight: '900', color: '#F1F5F9', letterSpacing: 4 },
  inviteButtons: { flexDirection: 'row', gap: 12 },
  inviteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF7F24', paddingVertical: 14, borderRadius: 14 },
  inviteButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  copyButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#475569' },
  requestItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D1B0E', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 2, borderColor: '#FF7F24' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: '900', color: '#F1F5F9' },
  requestLevel: { fontSize: 12, color: '#FF7F24', fontWeight: '700' },
  requestActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  acceptButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  declineButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  leaderboard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: '#334155' },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  leaderboardItemHighlight: { backgroundColor: '#2D1B0E', borderRadius: 16, paddingHorizontal: 12, borderBottomWidth: 0, marginBottom: 4 },
  rank: { fontSize: 16, fontWeight: '900', color: '#94A3B8', width: 32 },
  rankTop: { color: '#FFD700' },
  leaderInfo: { flex: 1, marginLeft: 8 },
  leaderName: { fontSize: 15, fontWeight: '800', color: '#F1F5F9' },
  leaderNameHighlight: { color: '#FF7F24' },
  leaderSub: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  leaderStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderLevel: { fontSize: 14, fontWeight: '900', color: '#F1F5F9' },
});

const stylesNeon = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0221' },
  content: { padding: 20, paddingTop: 0 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  syncButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#2D0054', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00F0FF' },
  title: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', textShadowColor: '#FF00E4', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 10 },
  subtitle: { fontSize: 13, color: '#00F0FF', fontWeight: '900' },
  guildCard: { padding: 24, borderRadius: 28, marginBottom: 20, marginTop: 10, borderWidth: 2, borderColor: '#00F0FF' },
  guildHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guildRank: { fontSize: 12, fontWeight: '900', color: '#00F0FF', letterSpacing: 2 },
  guildPower: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', textShadowColor: '#00F0FF', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 5 },
  memberCount: { backgroundColor: 'rgba(0,240,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#00F0FF' },
  memberText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#FF00E4', letterSpacing: 2 },
  addFriendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,240,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#00F0FF' },
  addFriendText: { fontSize: 12, fontWeight: '900', color: '#00F0FF' },
  inviteCard: { backgroundColor: '#261447', padding: 20, borderRadius: 24, borderWidth: 2, borderColor: '#FF00E4' },
  inviteText: { fontSize: 14, color: '#FFFFFF', fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  codeDisplay: { backgroundColor: '#2D0054', borderRadius: 16, padding: 14, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: '#00F0FF', borderStyle: 'dashed' },
  codeLabel: { fontSize: 11, color: '#00F0FF', fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  codeValue: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4 },
  inviteButtons: { flexDirection: 'row', gap: 12 },
  inviteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF00E4', paddingVertical: 14, borderRadius: 14, shadowColor: '#FF00E4', shadowOpacity: 0.5, shadowRadius: 10 },
  inviteButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  copyButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#0D0221', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00F0FF' },
  requestItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D0054', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 2, borderColor: '#FF00E4' },
  requestInfo: { flex: 1 },
  requestName: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  requestLevel: { fontSize: 12, color: '#00F0FF', fontWeight: '900' },
  requestActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  acceptButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#39FF14', justifyContent: 'center', alignItems: 'center' },
  declineButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF0055', justifyContent: 'center', alignItems: 'center' },
  leaderboard: { backgroundColor: '#261447', borderRadius: 24, padding: 16, borderWidth: 2, borderColor: '#00F0FF' },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,240,255,0.2)' },
  leaderboardItemHighlight: { backgroundColor: 'rgba(255,0,228,0.1)', borderRadius: 16, paddingHorizontal: 12, borderBottomWidth: 0, marginBottom: 4, borderWidth: 1, borderColor: '#FF00E4' },
  rank: { fontSize: 16, fontWeight: '900', color: '#00F0FF', width: 32 },
  rankTop: { color: '#39FF14' },
  leaderInfo: { flex: 1, marginLeft: 8 },
  leaderName: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  leaderNameHighlight: { color: '#00F0FF' },
  leaderSub: { fontSize: 11, color: '#FF00E4', fontWeight: '900' },
  leaderStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderLevel: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
});
