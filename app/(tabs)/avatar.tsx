import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/src/store/useAppStore';
import { ACHIEVEMENTS, getAchievementProgress } from '@/src/services/achievements';
import { Trophy, Lock, Crown, Sparkles } from 'lucide-react-native';
import { Confetti } from '@/src/components/animations';

const AVATARS = [
  { id: 'fox_default', name: 'Fuchs Default', image: require('../../assets/images/fox_default.png'), cost: 0 },
  { id: 'fox_stars', name: 'Fuchs Sterne', image: require('../../assets/images/fox_stars.png'), cost: 100 },
  { id: 'fox_quest', name: 'Fuchs Quest', image: require('../../assets/images/fox_quest.png'), cost: 250 },
];

export default function AvatarSelection() {
  const { stats, unlockedAchievements, addCoins } = useAppStore();
  const ownedAvatars = ['fox_default'];
  
  if (stats.coins >= 100 && !ownedAvatars.includes('fox_stars')) ownedAvatars.push('fox_stars');
  if (stats.coins >= 250 && !ownedAvatars.includes('fox_quest')) ownedAvatars.push('fox_quest');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Crown color="#FFD700" size={28} />
        <Text style={styles.title}>AVATARE</Text>
      </View>
      
      <View style={styles.avatarDisplay}>
        <Image 
          source={AVATARS.find(a => a.id === stats.selectedAvatar)?.image || AVATARS[0].image}
          style={styles.avatarImage}
        />
        <Text style={styles.avatarName}>
          {AVATARS.find(a => a.id === stats.selectedAvatar)?.name || 'Fuchs Default'}
        </Text>
      </View>

      <FlatList
        data={AVATARS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isOwned = ownedAvatars.includes(item.id);
          const isSelected = stats.selectedAvatar === item.id;
          
          return (
            <TouchableOpacity
              style={[styles.avatarCard, isSelected && styles.selectedCard]}
              onPress={() => {
                if (isOwned) {
                  useAppStore.getState().setAvatar(item.id);
                } else if (stats.coins >= item.cost) {
                  addCoins(-item.cost);
                  useAppStore.getState().setAvatar(item.id);
                }
              }}
            >
              <Image source={item.image} style={styles.thumbnail} />
              <Text style={styles.avatarCardName}>{item.name}</Text>
              {isOwned ? (
                <Text style={styles.ownedBadge}>GEWÄHLT</Text>
              ) : (
                <Text style={styles.costBadge}>{item.cost} 💎</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
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
