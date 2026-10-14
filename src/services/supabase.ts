import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TableItem, TableSession, MenuItem, ShiftRecord, CashTransaction } from '../types';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fvfzxfwnnplmuemqqsei.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_5bXkPb_olHIuGFzhPYyksw_tKUUgnEV';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Unique client identifier per browser session/device to prevent echo loops
export const CLIENT_ID = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export type SyncKey = 'tables' | 'sessions' | 'menu' | 'shifts' | 'transactions';

export interface SyncEnvelope<T = any> {
  _v: number;
  senderId: string;
  timestamp: number;
  data: T;
}

export function parseSyncData<T>(raw: any): { data: T; senderId?: string; timestamp?: number } {
  if (raw && typeof raw === 'object' && '_v' in raw && 'data' in raw && 'senderId' in raw) {
    return {
      data: raw.data as T,
      senderId: raw.senderId,
      timestamp: raw.timestamp,
    };
  }
  // Backwards compatibility with raw array or object
  return { data: raw as T };
}

export const SQL_SETUP_SCRIPT = `-- 1. Tạo bảng lưu trữ dữ liệu đồng bộ cho Thanh Long Billiards
create table if not exists public.club_data (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Bật bảo mật Row Level Security (cho phép đọc/ghi công khai qua Anon Key của quán)
alter table public.club_data enable row level security;

create policy "Allow all access to club_data"
on public.club_data
for all
using (true)
with check (true);

-- 3. Kích hoạt tính năng Realtime (Đồng bộ thời gian thực tức thì)
alter publication supabase_realtime add table public.club_data;
`;

const debounceTimers: Partial<Record<SyncKey, any>> = {};

export const SupabaseSync = {
  // Sync state up to cloud immediately
  async pushKey(key: SyncKey, data: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const envelope: SyncEnvelope = {
        _v: 1,
        senderId: CLIENT_ID,
        timestamp: Date.now(),
        data,
      };

      const { error } = await supabase
        .from('club_data')
        .upsert({
          key,
          data: envelope,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.warn(`[SupabaseSync] Push ${key} error:`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`[SupabaseSync] Push ${key} exception:`, err);
      return false;
    }
  },

  // Push state with debounce to prevent network flood on rapid typing or item additions
  pushKeyDebounced(key: SyncKey, data: any, delayMs: number = 250): void {
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key]);
    }
    debounceTimers[key] = setTimeout(() => {
      SupabaseSync.pushKey(key, data);
      delete debounceTimers[key];
    }, delayMs);
  },

  // Pull state from cloud
  async pullKey<T>(key: SyncKey): Promise<T | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('club_data')
        .select('data')
        .eq('key', key)
        .single();
      if (error || !data) return null;
      return parseSyncData<T>(data.data).data;
    } catch {
      return null;
    }
  },

  // Pull all initial data
  async pullAll(): Promise<{
    tables?: TableItem[];
    sessions?: TableSession[];
    menu?: MenuItem[];
    shifts?: ShiftRecord[];
    transactions?: CashTransaction[];
  } | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('club_data').select('*');
      if (error || !data) return null;

      const result: any = {};
      data.forEach((row) => {
        result[row.key] = parseSyncData(row.data).data;
      });
      return result;
    } catch {
      return null;
    }
  },

  // Subscribe to realtime updates across all connected devices
  subscribeRealtime(onUpdate: (key: SyncKey, data: any, timestamp?: number) => void) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('billiards_club_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_data' },
        (payload) => {
          if (payload.new && (payload.new as any).key) {
            const row = payload.new as any;
            const parsed = parseSyncData(row.data);
            // Drop our own echo broadcast to eliminate ping-pong loops
            if (parsed.senderId && parsed.senderId === CLIENT_ID) {
              return;
            }
            onUpdate(row.key as SyncKey, parsed.data, parsed.timestamp);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },
};
