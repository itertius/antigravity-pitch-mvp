'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Team } from '../types';
import { teamRepository, isSupabaseConfigured, supabase } from '../lib/supabase';
import { TeamPool } from '../components/TeamPool';
import { VisualRandomizer } from '../components/VisualRandomizer';
import { HardTimer } from '../components/HardTimer';
import { ShieldAlert, Database, Laptop, Radio } from 'lucide-react';

export default function PitchingDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load teams from repository (Supabase or Local fallback)
  const refreshTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teamRepository.getTeams();
      setTeams(data);

      // Find if there is an active pitching team
      const active = data.find((t) => t.status === 'pitching');
      setCurrentTeam(active || null);
    } catch (e) {
      console.error('Error loading teams:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTeams();

    // Supabase Realtime Subscription if configured
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('realtime_teams')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'teams' },
          () => {
            refreshTeams();
          }
        )
        .subscribe();

      const client = supabase;
      return () => {
        if (client) {
          client.removeChannel(channel);
        }
      };
    }
  }, [refreshTeams]);

  // Handler: When randomizer selects a team
  const handleTeamSelected = async (selected: Team) => {
    const nextOrder = teams.filter((t) => t.status === 'completed').length + 1;
    await teamRepository.updateTeamStatus(selected.id, 'pitching', nextOrder);
    
    // Optimistic local state update
    const updated = teams.map((t) =>
      t.id === selected.id ? { ...t, status: 'pitching' as const, order_num: nextOrder } : t
    );
    setTeams(updated);
    setCurrentTeam({ ...selected, status: 'pitching', order_num: nextOrder });
  };

  // Handler: When pitching is marked completed
  const handleFinishPitch = async (team: Team) => {
    await teamRepository.updateTeamStatus(team.id, 'completed', team.order_num);
    
    const updated = teams.map((t) =>
      t.id === team.id ? { ...t, status: 'completed' as const } : t
    );
    setTeams(updated);
    setCurrentTeam(null);
  };

  // Handler: Reset to Mock Data
  const handleResetMock = async () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็น Mock Data เริ่มต้นใช่หรือไม่?')) {
      setIsLoading(true);
      await teamRepository.resetPool();
      await refreshTeams();
    }
  };

  // Handler: Import CSV from Google Form / pasted text
  const handleImportCSV = async (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const newItems: Omit<Team, 'id' | 'status'>[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Split by comma or tab
        const delimiter = line.includes('\t') ? '\t' : ',';
        const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

        // Skip header line if detected
        if (
          i === 0 &&
          (cols[0]?.toLowerCase().includes('timestamp') ||
            cols[0]?.toLowerCase().includes('ชื่อทีม') ||
            cols[0]?.toLowerCase().includes('team'))
        ) {
          continue;
        }

        if (cols.length >= 1 && cols[0]) {
          // Flexible mapping:
          // Format A: Timestamp, Team Name, Project Name, Pitcher
          // Format B: Team Name, Project Name, Pitcher
          let name = cols[0];
          let projectName = cols[1] || '';
          let pitcher = cols[2] || '';

          if (cols.length >= 4 && (cols[0].includes('/') || cols[0].includes('-') || cols[0].includes(':'))) {
            // Timestamp in column 0
            name = cols[1];
            projectName = cols[2] || '';
            pitcher = cols[3] || '';
          }

          newItems.push({
            name,
            project_name: projectName,
            pitcher,
            order_num: 0,
          });
        }
      }

      if (newItems.length > 0) {
        setIsLoading(true);
        const merged = await teamRepository.importTeams(newItems);
        setTeams(merged);
        setIsLoading(false);
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV กรุณาตรวจสอบรูปแบบ');
      console.error(e);
      setIsLoading(false);
    }
  };

  const poolTeams = teams.filter((t) => t.status === 'pool');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-3 sm:p-5 lg:p-6 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Radio className="text-white" size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
                Antigravity Event MVP
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pitching Queue & Hard Timebox
            </h1>
          </div>
        </div>

        {/* System Indicators */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isSupabaseConfigured
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-800'
            }`}
            title={
              isSupabaseConfigured
                ? 'เชื่อมต่อ Supabase Database พร้อมใช้งาน'
                : 'ทำงานแบบ Local / Offline Mode (พร้อม Deploy เชื่อม Supabase)'
            }
          >
            <Database size={13} />
            <span>{isSupabaseConfigured ? 'Supabase Online' : 'Local / Offline Mode'}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            <Laptop size={13} />
            <span>Single Screen Mode</span>
          </div>
        </div>
      </header>

      {/* Main Single Page 3-Panel Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 py-5 items-stretch">
        {/* Panel 1: ซ้าย/ล่าง - Pool of Teams (Col 1-4) */}
        <section className="lg:col-span-4 flex flex-col min-h-[460px]">
          <TeamPool
            teams={teams}
            onImportCSV={handleImportCSV}
            onResetMock={handleResetMock}
            isLoading={isLoading}
          />
        </section>

        {/* Panel 2: จุดศูนย์กลาง - Visual Randomizer (Col 5-8) */}
        <section className="lg:col-span-4 flex flex-col min-h-[460px]">
          <VisualRandomizer
            poolTeams={poolTeams}
            onTeamSelected={handleTeamSelected}
            isPitchingActive={Boolean(currentTeam)}
          />
        </section>

        {/* Panel 3: บน/ขวา - Hard Timebox Countdown (Col 9-12) */}
        <section className="lg:col-span-4 flex flex-col min-h-[460px]">
          <HardTimer
            currentTeam={currentTeam}
            onFinishPitch={handleFinishPitch}
          />
        </section>
      </main>

      {/* Footer Info */}
      <footer className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <p>Antigravity Event Management MVP — Ready for Vercel Deployment</p>
        <p className="font-mono">Google Form $\rightarrow$ Visual Randomizer $\rightarrow$ Hard Timebox</p>
      </footer>
    </div>
  );
}
