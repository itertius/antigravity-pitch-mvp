'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { Sparkles, Dices } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../lib/audio';

interface VisualRandomizerProps {
  poolTeams: Team[];
  onTeamSelected: (team: Team) => void;
  isPitchingActive: boolean;
}

export const VisualRandomizer: React.FC<VisualRandomizerProps> = ({
  poolTeams,
  onTeamSelected,
  isPitchingActive,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayTeam, setDisplayTeam] = useState<Team | null>(null);
  const [justSelected, setJustSelected] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set default display when pool changes and not spinning
  useEffect(() => {
    if (!isSpinning && poolTeams.length > 0 && !displayTeam) {
      setDisplayTeam(poolTeams[0]);
    }
  }, [poolTeams, isSpinning, displayTeam]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  const handleSpin = () => {
    if (poolTeams.length === 0 || isSpinning || isPitchingActive) return;

    setIsSpinning(true);
    setJustSelected(false);

    let speed = 50; // Initial fast cycle speed (ms)
    let elapsed = 0;
    const duration = 2800; // 2.8 seconds spin duration

    const step = () => {
      // Pick random team for visual roll
      const randomIdx = Math.floor(Math.random() * poolTeams.length);
      setDisplayTeam(poolTeams[randomIdx]);
      soundEffects.playTick();

      elapsed += speed;
      // Gradually ease out / slow down as time passes
      if (elapsed > duration * 0.6) {
        speed += 35;
      } else if (elapsed > duration * 0.3) {
        speed += 12;
      }

      if (elapsed < duration) {
        spinIntervalRef.current = setTimeout(step, speed);
      } else {
        // Selection finalization
        const chosenIndex = Math.floor(Math.random() * poolTeams.length);
        const finalTeam = poolTeams[chosenIndex];
        setDisplayTeam(finalTeam);
        setIsSpinning(false);
        setJustSelected(true);
        soundEffects.playFanfare();
        triggerConfetti();
        onTeamSelected(finalTeam);
      }
    };

    spinIntervalRef.current = setTimeout(step, speed);
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden min-h-[460px]">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Visual Randomizer
            </h2>
            <p className="text-xs text-slate-400">ระบบสุ่มคิว Pitching โปร่งใส</p>
          </div>
        </div>

        <div className="text-xs px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          เหลือใน Pool: <span className="font-bold text-indigo-400">{poolTeams.length}</span> ทีม
        </div>
      </div>

      {/* Center Reel Display */}
      <div className="w-full my-auto py-8 flex flex-col items-center justify-center z-10">
        <div
          className={`w-full max-w-md p-6 rounded-2xl border-2 transition-all duration-300 text-center relative ${
            isSpinning
              ? 'bg-indigo-950/50 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.35)] scale-105 animate-pulse'
              : justSelected
              ? 'bg-indigo-900/40 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-102'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {isSpinning && (
            <div className="absolute top-2 right-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-bounce">
              SPINNING...
            </div>
          )}

          {poolTeams.length === 0 && !displayTeam ? (
            <div className="py-6 space-y-2">
              <p className="text-lg font-bold text-slate-400">สุ่มครบทุกทีมแล้ว 🎉</p>
              <p className="text-xs text-slate-500">
                คุณสามารถกด Reset หรือ Import CSV เพิ่มเติมได้
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[11px] font-mono tracking-widest text-indigo-300 uppercase px-2.5 py-0.5 rounded-full bg-indigo-900/50 border border-indigo-700/50">
                {isSpinning ? '🎲 Randomizing...' : justSelected ? '✨ SELECTED TEAM' : 'PREVIEW'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md truncate">
                {displayTeam?.name || 'กดปุ่มเพื่อเริ่มสุ่ม'}
              </h1>

              <p className="text-sm font-medium text-indigo-200/90 line-clamp-1">
                {displayTeam?.project_name || '—'}
              </p>

              <div className="inline-flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
                <span>Presenter:</span>
                <span className="font-semibold text-slate-200">
                  {displayTeam?.pitcher || '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin Button Controller */}
      <div className="w-full flex flex-col items-center space-y-2 z-10">
        <button
          onClick={handleSpin}
          disabled={isSpinning || poolTeams.length === 0 || isPitchingActive}
          className={`w-full max-w-sm py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl ${
            isSpinning || isPitchingActive || poolTeams.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <Dices size={24} className={isSpinning ? 'animate-spin' : ''} />
          <span>
            {isSpinning
              ? 'กำลังสุ่มทีม...'
              : isPitchingActive
              ? 'มีทีมกำลัง Pitch อยู่บนเวที'
              : poolTeams.length === 0
              ? 'ไม่มีทีมใน Pool'
              : 'สุ่มทีมถัดไป (SPIN NEXT)'}
          </span>
        </button>

        {isPitchingActive && (
          <p className="text-[11px] text-amber-400/90 font-medium">
            *กรุณากด "เสร็จสิ้นการ Pitch" ที่แผงนาฬิกาก่อน จึงจะสุ่มทีมถัดไปได้
          </p>
        )}
      </div>
    </div>
  );
};
