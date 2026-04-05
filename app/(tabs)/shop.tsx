import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { 
  Zap, 
  Shield, 
  Palette, 
  Ghost, 
  Sparkles 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const SHOP_ITEMS = [
  { id: '1', name: 'Legendärer Avatar', price: 100, icon: <Ghost color="#FF7F24" size={32} />, category: 'Skins' },
  { id: '2', name: 'Goldener Rahmen', price: 50, icon: <Shield color="#FFD700" size={32} />, category: 'Skins' },
  { id: '3', name: 'Joker-Karte', price: 30, icon: <Zap color="#FF7F24" size={32} fill="#FF7F24" />, category: 'Sonder' },
  { id: '4', name: 'Neon Theme', price: 200, icon: <Palette color="#00CD00" size={32} />, category: 'Themes' },
  { id: '5', name: 'XP Booster', price: 150, icon: <Sparkles color="#3B82F6" size={32} />, category: 'Buffs' },
];

export default function Shop() {
  const { stats, addCoins } = useAppStore();

  const handlePurchase = (item: any) => {
    if (stats.coins >= item.price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addCoins(-item.price);
      alert(`${item.name} erfolgreich gekauft!`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Nicht genügend Münzen!');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => handlePurchase(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{item.icon}</View>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.price}</Text>
        <Zap size={16} color="#FF7F24" fill="#FF7F24" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MARKTPLATZ</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinValue}>{stats.coins}</Text>
          <Zap size={22} color="#FF7F24" fill="#FF7F24" />
        </View>
      </View>

      <FlatList
        data={SHOP_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F2',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#AFAFAF',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 4,
  },
  coinValue: {
    color: '#FF7F24',
    fontSize: 20,
    fontWeight: '800',
  },
  list: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B4B4B',
    textAlign: 'center',
  },
  itemCategory: {
    fontSize: 10,
    color: '#AFAFAF',
    marginTop: 6,
    fontWeight: '800',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  priceText: {
    color: '#FF7F24',
    fontWeight: '800',
    fontSize: 16,
  }
});
