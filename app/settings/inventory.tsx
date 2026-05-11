import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/src/context/ThemeContext';
import { ChevronLeft, Package, Zap, Sparkles, Shield, RotateCcw, Crown, Star, Palette, Gem } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import FoxMascot from '@/components/FoxMascot';

const ITEM_INFO: Record<string, { name: string; description: string; icon: any; color: string }> = {
  default: { name: 'Item', description: 'Ein gekauftes Item', icon: Package, color: '#AFAFAF' },
  legendary_avatar: { name: 'Legendärer Avatar', description: 'Ein exklusives Avatar-Design', icon: Crown, color: '#FF7F24' },
  golden_frame: { name: 'Goldener Rahmen', description: 'Verleihe deinem Profil einen goldenen Look', icon: Shield, color: '#FFD700' },
  joker_card: { name: 'Joker-Karte', description: 'Überspringe eine Quest ohne Strafe', icon: Star, color: '#EC4899' },
  neon_theme: { name: 'Neon Theme', description: 'Aktiviere ein leuchtendes Neon-Design', icon: Palette, color: '#00CD00' },
  xp_booster: { name: 'XP-Booster', description: '+50% XP für 1 Stunde', icon: Sparkles, color: '#3B82F6' },
  coins_booster: { name: 'Münzen-Booster', description: '+50% Münzen für 1 Stunde', icon: Zap, color: '#FF7F24' },
  streak_shield: { name: 'Streak-Schild', description: 'Schütze deine Streak für einen Tag', icon: Shield, color: '#EF4444' },
  treasure_chest: { name: 'Schatztruhe', description: 'Öffne sie für eine Überraschung!', icon: Gem, color: '#7C3AED' },
};

export default function Inventory() {
  const router = useRouter();
  const { isDark } = useTheme();
  const {
    inventory,
    useInventoryItem,
    activateBuff,
    openTreasureChest,
    hasActiveBuff,
    neonThemeEnabled,
    toggleNeonTheme
  } = useAppStore();

  const s = isDark ? stylesDark : stylesLight;

  const handleUseItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (itemId) {
      case 'joker_card':
        Alert.alert(
          'Joker verwenden',
          'Möchtest du eine Joker-Karte verbrauchen? Du kannst damit eine beliebige Quest sofort abschließen.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            {
              text: 'Verwenden',
              onPress: () => {
                if (useInventoryItem('joker_card')) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('Joker aktiviert!', 'Gehe zum Dashboard und schließe eine Quest ab.');
                }
              }
            }
          ]
        );
        break;

      case 'xp_booster':
        if (hasActiveBuff('xp_boost')) {
          Alert.alert('Aktiv', 'Ein XP-Booster ist bereits aktiv!');
        } else {
          useInventoryItem('xp_booster');
          activateBuff('xp_boost', 60);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('XP-Booster aktiv!', 'Du erhältst jetzt 60 Minuten lang +50% XP!');
        }
        break;

      case 'coins_booster':
        if (hasActiveBuff('coins_boost')) {
          Alert.alert('Aktiv', 'Ein Münzen-Booster ist bereits aktiv!');
        } else {
          useInventoryItem('coins_booster');
          activateBuff('coins_boost', 60);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Münz-Booster aktiv!', 'Du erhältst jetzt 60 Minuten lang +50% Münzen!');
        }
        break;

      case 'treasure_chest':
        const reward = openTreasureChest();
        if (reward) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Schatztruhe geöffnet! 🎁', `Du hast gefunden: ${reward.name}!`);
        }
        break;

      case 'neon_theme':
        toggleNeonTheme(!neonThemeEnabled);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Theme geändert', `Neon-Theme wurde ${!neonThemeEnabled ? 'aktiviert' : 'deaktiviert'}.`);
        break;

      case 'legendary_avatar':
        Alert.alert('Avatar wechseln', 'Gehe in die Avatar-Einstellungen um diesen Look zu wählen.', [
          { text: 'OK' },
          { text: 'Zu Avataren', onPress: () => router.push('/settings/avatar') }
        ]);
        break;

      default:
        Alert.alert('Info', 'Dieses Item wird automatisch verwendet oder kann hier nicht aktiviert werden.');
    }
  };

  const renderItem = ({ item }: { item: typeof inventory[0] }) => {
    const info = ITEM_INFO[item.id] || ITEM_INFO.default;
    const Icon = info.icon;

    return (
      <View style={s.itemCard}>
        <View style={[s.itemIcon, { backgroundColor: `${info.color}15` }]}>
          <Icon color={info.color} size={32} />
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemName}>{info.name}</Text>
          <Text style={s.itemDesc}>{info.description}</Text>
          <View style={s.quantityBadge}>
            <Text style={s.quantityText}>×{item.quantity}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[s.useButton, item.id === 'neon_theme' && neonThemeEnabled && { backgroundColor: '#10B981' }]}
          onPress={() => handleUseItem(item.id)}
        >
          <Text style={s.useButtonText}>
            {item.id === 'neon_theme' ? (neonThemeEnabled ? 'AN' : 'AUS') : 'NUTZEN'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <ChevronLeft color={isDark ? "#F1F5F9" : "#4B4B4B"} size={28} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>DEINE SCHATZKAMMER</Text>
        <View style={s.placeholder} />
      </View>

      <FlatList
        data={inventory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <FoxMascot
              message="Hier lagerst du deine Beute! Nutze die Booster weise."
              expression="happy"
              size={80}
            />
            <View style={s.activeBuffs}>
              <Text style={s.sectionTitle}>AKTIVE EFFEKTE</Text>
              <View style={s.buffRow}>
                <View style={[s.buffBadge, hasActiveBuff('xp_boost') ? s.buffActive : s.buffInactive]}>
                  <Sparkles size={16} color={hasActiveBuff('xp_boost') ? '#FFD700' : (isDark ? '#64748B' : '#AFAFAF')} />
                  <Text style={[s.buffText, hasActiveBuff('xp_boost') && s.buffTextActive]}>XP +50%</Text>
                </View>
                <View style={[s.buffBadge, hasActiveBuff('coins_boost') ? s.buffActive : s.buffInactive]}>
                  <Zap size={16} color={hasActiveBuff('coins_boost') ? '#FF7F24' : (isDark ? '#64748B' : '#AFAFAF')} />
                  <Text style={[s.buffText, hasActiveBuff('coins_boost') && s.buffTextActive]}>COINS +50%</Text>
                </View>
              </View>
            </View>
            <Text style={[s.sectionTitle, { marginLeft: 20, marginTop: 20 }]}>GEKAUFTE ITEMS</Text>
          </>
        }
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Package color={isDark ? "#334155" : "#F2F2F2"} size={80} />
            <Text style={s.emptyText}>Deine Schatzkammer ist leer!</Text>
            <TouchableOpacity style={s.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
              <Text style={s.shopBtnText}>ZUM MARKT GEHEN</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const stylesLight = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#F2F2F2' },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#AFAFAF', letterSpacing: 1 },
  placeholder: { width: 44 },
  activeBuffs: { padding: 20, backgroundColor: '#FDFDFD', borderRadius: 24, marginHorizontal: 16, borderWidth: 2, borderColor: '#F2F2F2' },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#AFAFAF', letterSpacing: 1, marginBottom: 12 },
  buffRow: { flexDirection: 'row', gap: 12 },
  buffBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, gap: 8, borderWidth: 2, borderColor: '#F2F2F2' },
  buffActive: { backgroundColor: '#FFF8E7', borderColor: '#FFD700' },
  buffInactive: { backgroundColor: '#F9F9F9', opacity: 0.5 },
  buffText: { fontSize: 13, fontWeight: '800', color: '#AFAFAF' },
  buffTextActive: { color: '#B8860B' },
  list: { paddingBottom: 100 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 2, borderColor: '#F2F2F2', borderBottomWidth: 6 },
  itemIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '900', color: '#4B4B4B' },
  itemDesc: { fontSize: 12, color: '#AFAFAF', marginTop: 2, fontWeight: '600' },
  quantityBadge: { position: 'absolute', top: -24, right: 0, backgroundColor: '#FF7F24', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2, borderColor: '#FFFFFF' },
  quantityText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },
  useButton: { backgroundColor: '#FF7F24', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  useButtonText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingVertical: 100 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#AFAFAF', marginTop: 20, marginBottom: 30 },
  shopBtn: { backgroundColor: '#FF7F24', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});

const stylesDark = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#334155' },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  placeholder: { width: 44 },
  activeBuffs: { padding: 20, backgroundColor: '#1E293B', borderRadius: 24, marginHorizontal: 16, borderWidth: 2, borderColor: '#334155' },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 12 },
  buffRow: { flexDirection: 'row', gap: 12 },
  buffBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, gap: 8, borderWidth: 2, borderColor: '#334155' },
  buffActive: { backgroundColor: '#2D1B0E', borderColor: '#FFD700' },
  buffInactive: { backgroundColor: '#1E293B', opacity: 0.5 },
  buffText: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  buffTextActive: { color: '#FFD700' },
  list: { paddingBottom: 100 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 24, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 6 },
  itemIcon: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '900', color: '#F1F5F9' },
  itemDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
  quantityBadge: { position: 'absolute', top: -24, right: 0, backgroundColor: '#FF7F24', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2, borderColor: '#1E293B' },
  quantityText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },
  useButton: { backgroundColor: '#FF7F24', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  useButtonText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingVertical: 100 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#94A3B8', marginTop: 20, marginBottom: 30 },
  shopBtn: { backgroundColor: '#FF7F24', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
});
