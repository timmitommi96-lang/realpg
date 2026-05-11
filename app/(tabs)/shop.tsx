import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import FoxMascot from '@/components/FoxMascot';
import {
  Zap, 
  Shield, 
  Palette, 
  Ghost, 
  Sparkles,
  Star,
  Trophy,
  Flame,
  Gem,
  Settings,
  ChevronLeft,
  Check,
  Package
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SHOP_ITEMS = [
  { id: 'legendary_avatar', name: 'Legendärer Fuchs', price: 100, icon: Ghost, color: '#FF7F24', category: 'Avatar', description: 'Ein mystischer Look für deinen Begleiter.' },
  { id: 'golden_frame', name: 'Goldener Rahmen', price: 50, icon: Shield, color: '#FFD700', category: 'Style', description: 'Zeige allen deinen Reichtum.' },
  { id: 'joker_card', name: 'Joker-Karte', price: 30, icon: Star, color: '#EC4899', category: 'Item', description: 'Überspringe eine Quest ohne XP-Verlust.' },
  { id: 'neon_theme', name: 'Neon Theme', price: 200, icon: Palette, color: '#00CD00', category: 'Theme', description: 'Die App leuchtet in futuristischen Farben.' },
  { id: 'xp_booster', name: 'XP Booster', price: 150, icon: Sparkles, color: '#3B82F6', category: 'Buff', description: 'Doppelte XP für die nächsten 3 Quests.' },
  { id: 'coins_booster', name: 'Münz-Booster', price: 100, icon: Zap, color: '#FF7F24', category: 'Buff', description: 'Mehr Münzen für abgeschlossene Aufgaben.' },
  { id: 'streak_shield', name: 'Streak-Schild', price: 75, icon: Flame, color: '#EF4444', category: 'Item', description: 'Schützt deinen Streak für einen Tag.' },
  { id: 'treasure_chest', name: 'Schatztruhe', price: 500, icon: Gem, color: '#7C3AED', category: 'Special', description: 'Enthält ein zufälliges seltenes Item!' },
];

export default function Shop() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { stats, inventory, purchaseItem } = useAppStore();
  const s = isDark ? stylesDark : stylesLight;

  const handlePurchase = (item: typeof SHOP_ITEMS[0]) => {
    const ownedItem = inventory.find(i => i.id === item.id);
    
    if (item.category === 'Avatar' && ownedItem) {
      Alert.alert("Bereits gekauft!", "Dieses Item hast du bereits!");
      return;
    }
    
    if (stats.coins >= item.price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      purchaseItem(item.id, item.name, item.category === 'Avatar' ? 'avatar' : item.category === 'Theme' ? 'theme' : item.category === 'Buff' ? 'buff' : 'joker', item.name);
      Alert.alert(
        "Gekauft! 🎉", 
        `${item.name} wurde zu deinem Inventar hinzugefügt!`
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Nicht genug Münzen!", `Du brauchst ${item.price} Münzen, aber hast nur ${stats.coins}.`);
    }
  };

  const mascotReaction = useMemo(() => {
    if (stats.coins > 1000) {
      return { message: "Wow, du bist ja steinreich! Gönn dir was Schönes!", expression: 'excited' };
    }
    if (stats.coins < 30) {
      return { message: "Sparen ist auch eine Quest... aber gucken kostet nichts!", expression: 'thinking' };
    }
    return { message: "Willkommen auf dem Markt! Was darf es heute sein?", expression: 'shop' };
  }, [stats.coins]);

  const renderItem = ({ item }: { item: typeof SHOP_ITEMS[0] }) => {
    const ownedItem = inventory.find(i => i.id === item.id);
    const canAfford = stats.coins >= item.price;
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity 
        style={[
          s.itemCard, 
          !canAfford && s.itemCardDisabled,
          ownedItem && item.category !== 'Avatar' && s.itemCardOwned
        ]}
        onPress={() => handlePurchase(item)}
        activeOpacity={0.7}
      >
        <View style={[s.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <IconComponent color={item.color} size={32} />
          {ownedItem && item.category !== 'Avatar' && (
            <View style={s.ownedBadge}>
              <Text style={s.ownedBadgeText}>×{ownedItem.quantity}</Text>
            </View>
          )}
        </View>
        <Text style={s.itemName}>{item.name}</Text>
        <Text style={s.itemDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={[s.itemCategory, { color: item.color }]}>{item.category.toUpperCase()}</Text>
        {ownedItem && item.category === 'Avatar' ? (
          <View style={[s.priceTag, { backgroundColor: '#10B981' }]}>
            <Check size={16} color="#FFFFFF" />
            <Text style={[s.priceText, { color: '#FFFFFF' }]}>GEKAUFT</Text>
          </View>
        ) : (
          <View style={[s.priceTag, !canAfford && s.priceTagDisabled]}>
            <Text style={[s.priceText, !canAfford && s.priceTextDisabled]}>{item.price}</Text>
            <Zap size={16} color={canAfford ? "#FF7F24" : "#AFAFAF"} fill={canAfford ? "#FF7F24" : "#AFAFAF"} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ChevronLeft color={isDark ? "#94A3B8" : "#AFAFAF"} size={28} />
          </TouchableOpacity>
          <Text style={s.title}>MARKTPLATZ</Text>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.invButton} onPress={() => router.push('/settings/inventory')}>
              <Package color="#10B981" size={22} />
            </TouchableOpacity>
            <View style={[s.coinBadge, { backgroundColor: isDark ? '#334155' : '#F7F7F7' }]}>
              <Text style={s.coinValue}>{stats.coins}</Text>
              <Zap size={22} color="#FF7F24" fill="#FF7F24" />
            </View>
          </View>
        </View>

      <FlatList
        data={SHOP_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={{ marginTop: 10 }}>
            <FoxMascot
              message={mascotReaction.message}
              expression={mascotReaction.expression as any}
              size={80}
            />
          </View>
        }
        contentContainerStyle={s.list}
        columnWrapperStyle={s.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F2',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#AFAFAF', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D1FAE5' },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  coinValue: { color: '#FF7F24', fontSize: 20, fontWeight: '800' },
  list: { padding: 16, paddingTop: 0 },
  columnWrapper: { justifyContent: 'space-between' },
  itemCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 6,
  },
  itemCardDisabled: { opacity: 0.5 },
  itemCardOwned: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ownedBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  itemName: { fontSize: 14, fontWeight: '900', color: '#4B4B4B', textAlign: 'center' },
  itemDesc: { fontSize: 11, color: '#AFAFAF', textAlign: 'center', marginTop: 4, fontWeight: '600', height: 32 },
  itemCategory: { fontSize: 10, marginTop: 8, fontWeight: '800' },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  priceTagDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E5E5E5' },
  priceText: { color: '#FF7F24', fontWeight: '800', fontSize: 16 },
  priceTextDisabled: { color: '#AFAFAF' },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  invButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#052E16', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#065F46' },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#334155',
  },
  coinValue: { color: '#FF7F24', fontSize: 20, fontWeight: '800' },
  list: { padding: 16, paddingTop: 0 },
  columnWrapper: { justifyContent: 'space-between' },
  itemCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderBottomWidth: 6,
  },
  itemCardDisabled: { opacity: 0.5 },
  itemCardOwned: { borderColor: '#10B981', backgroundColor: '#052E16' },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ownedBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  itemName: { fontSize: 14, fontWeight: '900', color: '#F1F5F9', textAlign: 'center' },
  itemDesc: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 4, fontWeight: '600', height: 32 },
  itemCategory: { fontSize: 10, marginTop: 8, fontWeight: '800' },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
  },
  priceTagDisabled: { backgroundColor: '#1E293B', borderColor: '#334155' },
  priceText: { color: '#FF7F24', fontWeight: '800', fontSize: 16 },
  priceTextDisabled: { color: '#94A3B8' },
});
