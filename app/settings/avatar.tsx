import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { Crown, ChevronLeft } from 'lucide-react-native';

const AVATARS = [
  { id: 'fox_default', name: 'Standard', image: require('../../assets/images/fox_idle.png'), cost: 0 },
  { id: 'fox_stars', name: 'Episch', image: require('../../assets/images/fox_level_up.png'), cost: 100 },
  { id: 'fox_quest', name: 'Siegreich', image: require('../../assets/images/fox_quest_completed.png'), cost: 250 },
];

export default function AvatarSelection() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { stats, addCoins } = useAppStore();
  const ownedAvatars = ['fox_default'];
  
  if (stats.coins >= 100 && !ownedAvatars.includes('fox_stars')) ownedAvatars.push('fox_stars');
  if (stats.coins >= 250 && !ownedAvatars.includes('fox_quest')) ownedAvatars.push('fox_quest');
  
  const s = isDark ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ChevronLeft color={isDark ? '#F1F5F9' : '#4B4B4B'} size={28} />
        </TouchableOpacity>
        <Crown color="#FFD700" size={28} />
        <Text style={s.title}>AVATARE</Text>
      </View>
      
      <View style={s.avatarDisplay}>
        <Image 
          source={AVATARS.find(a => a.id === stats.selectedAvatar)?.image || AVATARS[0].image}
          style={s.avatarImage}
        />
        <Text style={s.avatarName}>
          {AVATARS.find(a => a.id === stats.selectedAvatar)?.name || 'Fuchs Default'}
        </Text>
      </View>

      <FlatList
        data={AVATARS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={s.grid}
        renderItem={({ item }) => {
          const isOwned = ownedAvatars.includes(item.id);
          const isSelected = stats.selectedAvatar === item.id;
          
          return (
            <TouchableOpacity
              style={[s.avatarCard, isSelected && s.selectedCard]}
              onPress={() => {
                if (isOwned) {
                  useAppStore.getState().setAvatar(item.id);
                } else if (stats.coins >= item.cost) {
                  addCoins(-item.cost);
                  useAppStore.getState().setAvatar(item.id);
                }
              }}
            >
              <Image source={item.image} style={s.thumbnail} />
              <Text style={s.avatarCardName}>{item.name}</Text>
              {isOwned ? (
                <Text style={s.ownedBadge}>GEWÄHLT</Text>
              ) : (
                <Text style={s.costBadge}>{item.cost} 💎</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#4B4B4B' },
  avatarDisplay: { alignItems: 'center', padding: 30, backgroundColor: '#F9F9F9', borderRadius: 30, margin: 20 },
  avatarImage: { width: 150, height: 150, resizeMode: 'contain' },
  avatarName: { fontSize: 20, fontWeight: '900', color: '#4B4B4B', marginTop: 16 },
  grid: { padding: 16 },
  avatarCard: { flex: 1, margin: 8, padding: 12, borderRadius: 20, backgroundColor: '#F9F9F9', alignItems: 'center', borderWidth: 2, borderColor: '#E5E5E5' },
  selectedCard: { borderColor: '#FF7F24', backgroundColor: '#FFF5EE' },
  thumbnail: { width: 80, height: 80, resizeMode: 'contain' },
  avatarCardName: { fontSize: 12, fontWeight: '700', color: '#4B4B4B', marginTop: 8, textAlign: 'center' },
  ownedBadge: { fontSize: 10, fontWeight: '900', color: '#10B981', marginTop: 4 },
  costBadge: { fontSize: 10, fontWeight: '900', color: '#FF7F24', marginTop: 4 },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#F1F5F9' },
  avatarDisplay: { alignItems: 'center', padding: 30, backgroundColor: '#1E293B', borderRadius: 30, margin: 20 },
  avatarImage: { width: 150, height: 150, resizeMode: 'contain' },
  avatarName: { fontSize: 20, fontWeight: '900', color: '#F1F5F9', marginTop: 16 },
  grid: { padding: 16 },
  avatarCard: { flex: 1, margin: 8, padding: 12, borderRadius: 20, backgroundColor: '#1E293B', alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  selectedCard: { borderColor: '#FF7F24', backgroundColor: '#2D1B0E' },
  thumbnail: { width: 80, height: 80, resizeMode: 'contain' },
  avatarCardName: { fontSize: 12, fontWeight: '700', color: '#F1F5F9', marginTop: 8, textAlign: 'center' },
  ownedBadge: { fontSize: 10, fontWeight: '900', color: '#10B981', marginTop: 4 },
  costBadge: { fontSize: 10, fontWeight: '900', color: '#FF7F24', marginTop: 4 },
});
