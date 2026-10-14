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

export type SyncKey = 'tables' | 'sessions' | 'menu' | 'shifts' | 'transactions';

export function parseSyncData<T>(raw: any): T {
  if (raw && typeof raw === 'object' && '_v' in raw && 'data' in raw) {
    return raw.data as T;
  }
  return raw as T;
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

export const SupabaseSync = {
  // Sync state up to cloud immediately
  async pushKey(key: SyncKey, data: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('club_data')
        .upsert({
          key,
          data,
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
      return parseSyncData<T>(data.data);
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
        result[row.key] = parseSyncData(row.data);
      });
      return result;
    } catch {
      return null;
    }
  },

  // Subscribe to realtime updates across all connected devices
  subscribeRealtime(onUpdate: (key: SyncKey, data: any) => void) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('billiards_club_realtime_' + Date.now())
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_data' },
        (payload) => {
          if (payload.new && (payload.new as any).key) {
            const row = payload.new as any;
            const actualData = parseSyncData(row.data);
            onUpdate(row.key as SyncKey, actualData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },
};
