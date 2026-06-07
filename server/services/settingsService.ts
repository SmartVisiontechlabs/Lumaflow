import { supabase, supabaseAdmin } from '../config/supabase';

export interface CommunicationConfig {
  bookingConfirmations: boolean;
  reminder24h: boolean;
  prep1h: boolean;
  adminNotifications: boolean;
}

const DEFAULT_COMMUNICATION_CONFIG: CommunicationConfig = {
  bookingConfirmations: true,
  reminder24h: true,
  prep1h: true,
  adminNotifications: true
};

export const settingsService = {
  /**
   * Fetches general or communication configurations
   */
  async getSettings(key: string, defaultValue: any = {}) {
    const client = supabaseAdmin || supabase;
    try {
      // 1. Try to read from admin_settings
      const { data, error } = await client
        .from('admin_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error && data) {
        return data.value;
      }

      // If table doesn't exist, use fallback
      if (error && (error.code === 'PGRST205' || error.status === 404)) {
        console.log(`[Settings Service] admin_settings table not found. Using fallback for key: ${key}`);
        const { data: fallbackData, error: fallbackError } = await client
          .from('seo_config')
          .select('meta_description')
          .eq('page_route', `__admin_${key}__`)
          .maybeSingle();

        if (!fallbackError && fallbackData?.meta_description) {
          try {
            return JSON.parse(fallbackData.meta_description);
          } catch (e) {
            console.error('[Settings Service] Error parsing fallback JSON:', e);
          }
        }
      }
    } catch (err) {
      console.error(`[Settings Service] Exception reading setting ${key}:`, err);
    }
    return defaultValue;
  },

  /**
   * Saves general or communication configurations
   */
  async saveSettings(key: string, value: any) {
    const client = supabaseAdmin || supabase;
    try {
      // 1. Try to write to admin_settings
      const { error } = await client
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        console.log(`[Settings Service] Saved key ${key} to admin_settings table.`);
        return { success: true };
      }

      // If table doesn't exist, use fallback
      if (error && (error.code === 'PGRST205' || error.status === 404)) {
        console.log(`[Settings Service] admin_settings table not found during save. Using fallback for key: ${key}`);
        const { error: fallbackError } = await client
          .from('seo_config')
          .upsert({
            page_route: `__admin_${key}__`,
            meta_title: `Admin Setting: ${key}`,
            meta_description: JSON.stringify(value),
            updated_at: new Date().toISOString()
          });

        if (fallbackError) {
          console.error('[Settings Service] Fallback save failed:', fallbackError);
          throw fallbackError;
        }
        console.log(`[Settings Service] Saved key ${key} to fallback (seo_config table).`);
        return { success: true };
      }
      throw error;
    } catch (err: any) {
      console.error(`[Settings Service] Exception saving setting ${key}:`, err);
      throw err;
    }
  },

  /**
   * Convenience method to fetch communications configuration
   */
  async getCommunicationConfig(): Promise<CommunicationConfig> {
    return this.getSettings('communication_config', DEFAULT_COMMUNICATION_CONFIG);
  }
};
