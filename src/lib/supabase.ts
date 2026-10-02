import { createClient } from '@supabase/supabase-js';
import { Team, TeamStatus } from '../types';
import { INITIAL_MOCK_TEAMS } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'antigravity_teams_v1';

// Unified Data Repository: Works with Supabase when configured, or Local Storage fallback
export const teamRepository = {
  async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('order_num', { ascending: true })
        .order('created_at', { ascending: true });
        
      if (!error && data && data.length > 0) {
        return data as Team[];
      }
    }
    
    // Fallback: localStorage or initial mock data
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse teams from localStorage', e);
        }
      }
    }
    return INITIAL_MOCK_TEAMS;
  },

  async saveTeams(teams: Team[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(teams));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Upsert all teams to Supabase
        const { error } = await supabase.from('teams').upsert(teams, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase upsert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase sync error:', err);
      }
    }
  },

  async updateTeamStatus(id: string, status: TeamStatus, orderNum?: number): Promise<void> {
    const teams = await this.getTeams();
    const updated = teams.map((t) =>
      t.id === id ? { ...t, status, ...(orderNum !== undefined ? { order_num: orderNum } : {}) } : t
    );
    await this.saveTeams(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('teams')
        .update({ status, ...(orderNum !== undefined ? { order_num: orderNum } : {}) })
        .eq('id', id);
    }
  },

  async resetPool(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teams').insert(INITIAL_MOCK_TEAMS);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TEAMS));
    }
  },

  async importTeams(newTeams: Omit<Team, 'id' | 'status'>[]): Promise<Team[]> {
    const formatted: Team[] = newTeams.map((t, idx) => ({
      ...t,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `team-${Date.now()}-${idx}`,
      status: 'pool',
      order_num: 0,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('teams').insert(formatted).select();
      if (!error && data) {
        const all = await this.getTeams();
        return all;
      }
    }

    const current = await this.getTeams();
    const merged = [...current, ...formatted];
    await this.saveTeams(merged);
    return merged;
  }
};
