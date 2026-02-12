
import { createClient } from '@supabase/supabase-js';
import { Product, Budget, BusinessSettings, BudgetStatus } from '../types';

const SUPABASE_URL = 'https://mvstfdasphyugpsyrkzk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_53LRfVhLZy7Z0aUPhkpLgg_x39u3Zpn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_SETTINGS: BusinessSettings = {
  name: 'Mi Constructora',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  currency: '$',
  defaultTax: 0
};

export const storage = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  },
  
  saveProduct: async (product: Product) => {
    const { error } = await supabase.from('products').upsert(product);
    if (error) console.error('Error saving product:', error);
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
  },

  getBudgets: async (): Promise<Budget[]> => {
    const { data, error } = await supabase.from('budgets').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
    // Transformamos los campos JSON de snake_case a camelCase si es necesario, 
    // o simplemente devolvemos si coinciden los nombres.
    return (data || []).map(b => ({
      ...b,
      validUntil: b.valid_until,
      taxRate: b.tax_rate
    })) as Budget[];
  },

  saveBudget: async (budget: Budget) => {
    const { error } = await supabase.from('budgets').upsert({
      id: budget.id,
      date: budget.date,
      valid_until: budget.validUntil,
      client: budget.client,
      items: budget.items,
      tax_rate: budget.taxRate,
      discount: budget.discount,
      subtotal: budget.subtotal,
      total: budget.total,
      status: budget.status
    });
    if (error) console.error('Error saving budget:', error);
  },

  updateBudgetStatus: async (id: string, status: BudgetStatus) => {
    const { error } = await supabase.from('budgets').update({ status }).eq('id', id);
    if (error) console.error('Error updating status:', error);
  },

  getSettings: async (): Promise<BusinessSettings> => {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'main').single();
    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    return data.data as BusinessSettings;
  },

  saveSettings: async (settings: BusinessSettings) => {
    const { error } = await supabase.from('settings').upsert({ id: 'main', data: settings });
    if (error) console.error('Error saving settings:', error);
  }
};
