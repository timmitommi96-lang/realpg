import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Alert, Modal, TouchableOpacity, Linking } from 'react-native';
import { Redirect } from 'expo-router';
import * as LinkingModule from 'expo-linking';
import { initDb, getUserProfile } from '@/src/services/db';
import { useAppStore } from '@/src/store/useAppStore';
import { Trophy, Crown, Flame, Star } from 'lucide-react-native';

interface DeepLinkData {
  type: 'progress' | 'friend' | 'invite';
  senderName?: string;
  senderLevel?: number;
  senderQuests?: number;
  senderStreak?: number;
  senderTitle?: string;
  senderId?: string;
  code?: string;
}

function parseDeepLink(path: string): DeepLinkData | null {
  if (!path) return null;
  
  const parts = path.split('/').filter(p => p);
  if (parts.length < 1) return null;
  
  const type = parts[0];
  
  if (type === 'share') {
    if (parts.length >= 5) {
      return { 
        type: 'progress',
        senderName: decodeURIComponent(parts[1] || 'Unbekannt'),
        senderLevel: parseInt(parts[2]) || 1,
        senderQuests: parseInt(parts[3]) || 0,
        senderStreak: parseInt(parts[4]) || 0,
        senderTitle: decodeURIComponent(parts[5] || 'Anfänger'),
      };
    }
    return { type: 'progress' };
  }
  
  if (type === 'i' || type === 'invite' || type === 'add') {
    const code = parts[1];
    const senderName = parts[2] ? decodeURIComponent(parts[2]) : undefined;
    const senderLevel = parts[3] ? parseInt(parts[3]) : undefined;
    const senderQuests = parts[4] ? parseInt(parts[4]) : undefined;
    const senderStreak = parts[5] ? parseInt(parts[5]) : undefined;
    const senderTitle = parts[6] ? decodeURIComponent(parts[6]) : undefined;
    return { type: 'invite', code, senderName, senderLevel, senderQuests, senderStreak, senderTitle };
  }
  
  if (type === 'friend') {
    return { type: 'friend' };
  }
  
  return { type: 'invite' };
}

function ProgressModal({ visible, data, onClose }: { visible: boolean; data: DeepLinkData | null; onClose: () => void }) {
  if (!data) return null;
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Crown size={32} color="#FFD700" />
            <Text style={modalStyles.title}>{data.senderName}s Fortschritt</Text>
          </View>
          
          <View style={modalStyles.statsContainer}>
            <View style={modalStyles.statBox}>
              <Text style={modalStyles.statValue}>{data.senderLevel || 1}</Text>
              <Text style={modalStyles.statLabel}>Level</Text>
            </View>
            <View style={modalStyles.statBox}>
              <Trophy size={24} color="#FFD700" />
              <Text style={modalStyles.statValue}>{data.senderQuests || 0}</Text>
              <Text style={modalStyles.statLabel}>Quests</Text>
            </View>
            <View style={modalStyles.statBox}>
              <Flame size={24} color="#FF4B4B" />
              <Text style={modalStyles.statValue}>{data.senderStreak || 0}</Text>
              <Text style={modalStyles.statLabel}>Streak</Text>
            </View>
          </View>
          
          <View style={modalStyles.titleBadge}>
            <Text style={modalStyles.titleText}>{data.senderTitle || 'Anfänger'}</Text>
          </View>
          
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeText}>Cool, weiter!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function InviteModal({ visible, data, onClose, onAddFriend }: { 
  visible: boolean; 
  data: DeepLinkData | null; 
  onClose: () => void;
  onAddFriend: () => void;
}) {
  if (!data) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Star size={32} color="#10B981" />
            <Text style={modalStyles.title}>Freundschaftsanfrage</Text>
          </View>
          
          <View style={modalStyles.senderInfo}>
            <View style={modalStyles.senderAvatar}>
              <Text style={modalStyles.senderAvatarText}>
                {(data.senderName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={modalStyles.senderName}>{data.senderName || 'Unbekannt'}</Text>
            <Text style={modalStyles.senderTitle}>{data.senderTitle || 'Anfänger'}</Text>
            <View style={modalStyles.senderStats}>
              <View style={modalStyles.statBox}>
                <Text style={modalStyles.statValue}>{data.senderLevel || 1}</Text>
                <Text style={modalStyles.statLabel}>Level</Text>
              </View>
              <View style={modalStyles.statBox}>
                <Trophy size={20} color="#FFD700" />
                <Text style={modalStyles.statValue}>{data.senderQuests || 0}</Text>
                <Text style={modalStyles.statLabel}>Quests</Text>
              </View>
              <View style={modalStyles.statBox}>
                <Flame size={20} color="#FF4B4B" />
                <Text style={modalStyles.statValue}>{data.senderStreak || 0}</Text>
                <Text style={modalStyles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>
          
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity style={[modalStyles.actionButton, { backgroundColor: '#EF4444' }]} onPress={onClose}>
              <Text style={modalStyles.actionText}>Ablehnen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modalStyles.actionButton, { backgroundColor: '#10B981' }]} onPress={onAddFriend}>
              <Text style={modalStyles.actionText}>Annehmen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#4B4B4B', marginTop: 8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#4B4B4B', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#AFAFAF' },
  titleBadge: { backgroundColor: '#FFF5EE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 20 },
  titleText: { fontSize: 14, fontWeight: '800', color: '#FF7F24' },
  closeButton: { backgroundColor: '#FF7F24', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  closeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  inviteText: { fontSize: 16, color: '#4B4B4B', textAlign: 'center', marginBottom: 16 },
  codeText: { fontSize: 18, fontWeight: '900', color: '#FF7F24', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  senderInfo: { alignItems: 'center', marginBottom: 24, width: '100%' },
  senderAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#FF7F24' },
  senderAvatarText: { fontSize: 28, fontWeight: '900', color: '#FF7F24' },
  senderName: { fontSize: 20, fontWeight: '900', color: '#4B4B4B' },
  senderTitle: { fontSize: 13, color: '#AFAFAF', marginTop: 2, fontWeight: '600' },
  senderStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16 },
});

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [deepLinkData, setDeepLinkData] = useState<DeepLinkData | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { addFriend, stats } = useAppStore();

  useEffect(() => {
    async function checkStatus() {
      try {
        await initDb();
        const profile = await getUserProfile();
        if (profile && profile.onboarding_completed) {
          setOnboardingCompleted(true);
        }
      } catch (err: any) {
        console.error('Failed to init DB', err);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link received:', url);
      const path = url.replace('realpg://', '').replace('https://realpg.app/', '').replace('realpg.app/', '');
      const data = parseDeepLink(path);
      
      if (data) {
        console.log('Parsed deep link data:', data);
        
        if (data.type === 'progress') {
          setDeepLinkData(data);
          setShowProgressModal(true);
        } else if (data.type === 'invite' || data.type === 'friend') {
          setDeepLinkData(data);
          setShowInviteModal(true);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAddFriend = () => {
    if (deepLinkData?.code) {
      addFriend({
        id: 'invite_' + deepLinkData.code,
        nickname: deepLinkData.senderName || 'Unbekannt',
        level: deepLinkData.senderLevel || 1,
        questsCompleted: deepLinkData.senderQuests || 0,
        streak: deepLinkData.senderStreak || 0,
        title: deepLinkData.senderTitle || 'Anfänger',
        addedAt: new Date().toISOString(),
      });
      Alert.alert('Freund hinzugefügt!', `${deepLinkData.senderName || 'Der Spieler'} wurde zu deiner Freundesliste hinzugefügt.`);
    }
    setShowInviteModal(false);
    setDeepLinkData(null);
  };

  const handleCloseModals = () => {
    setShowProgressModal(false);
    setShowInviteModal(false);
    setDeepLinkData(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F24" />
        <Text style={styles.loadingText}>Lädt...</Text>
      </View>
    );
  }

  if (onboardingCompleted) {
    return (
      <>
        <Redirect href="/(tabs)" />
        <ProgressModal visible={showProgressModal} data={deepLinkData} onClose={handleCloseModals} />
        <InviteModal 
          visible={showInviteModal} 
          data={deepLinkData} 
          onClose={handleCloseModals}
          onAddFriend={handleAddFriend}
        />
      </>
    );
  }
  
  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#AFAFAF',
    fontWeight: '600',
  },
});