import { supabase } from './auth';
import type { GeneratedQuest } from './ai';

export interface ShopItem {
  id: string;
  name: string;
  item_type: 'avatar' | 'theme' | 'buff' | 'joker';
  icon: string;
  price: number;
}

export const gameCloudService = {
  async listActiveQuests() {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async createQuest(quest: GeneratedQuest, source: 'daily' | 'custom' | 'manual' = 'daily') {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('quests')
      .insert({
        user_id: userData.user.id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        category: quest.category,
        xp: quest.xp,
        coins: quest.coins,
        source,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) return null;
    return data;
  },

  async completeQuest(questId: string, feedback?: string) {
    const { data, error } = await supabase.rpc('complete_quest', {
      p_quest_id: questId,
      p_feedback: feedback ?? null,
    });
    if (error) return null;
    return Array.isArray(data) ? data[0] : data;
  },

  async listShopItems(): Promise<ShopItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, item_type, icon, price')
      .eq('is_active', true)
      .order('price', { ascending: true });
    if (error) return [];
    return (data as ShopItem[]) ?? [];
  },

  async purchaseItem(itemId: string) {
    const { data, error } = await supabase.rpc('purchase_item', { p_item_id: itemId });
    if (error) return null;
    return Array.isArray(data) ? data[0] : data;
  },

  async listInventory() {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('item_id, quantity, inventory_items(name, icon, item_type, price)')
      .order('updated_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },
};
