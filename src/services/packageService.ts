import { supabase } from '../lib/supabase';

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  total_credits: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export const packageService = {
  /**
   * Fetches all active packages from Supabase
   * Sorted by featured first, then creation date
   */
  async getPackages(): Promise<Package[]> {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching packages:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching packages:', error);
      return [];
    }
  }
};
