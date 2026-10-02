'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Team, TimerPhase } from '../types';
import { Play, Pause, RotateCcw, Plus, CheckCircle, AlertTriangle, Flame } from 'lucide-react';
import { soundEffects } from '../lib/audio';

interface HardTimerProps {
  currentTeam: Team | null;
  onFinishPitch: (team: Team) => void;
}

export const HardTimer: React.FC<HardTimerProps> = ({ currentTeam, onFinishPitch }) => {
  const DEFAULT_SECONDS = 180; // 3 minutes standard pitch
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_SECONDS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('normal');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer whenever a new team takes the stage
  useEffect(() => {
    if (currentTeam) {
      setTimeLeft(DEFAULT_SECONDS);
      setTotalSeconds(DEFAULT_SECONDS);
      setIsRunning(false);
      setPhase('normal');
    }
  }, [currentTeam?.id]);

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setPhase('overtime');
            soundEffects.playBuzzer();
            return 0;
          }
          const next = prev - 1;
          if (next <= 10) {
            setPhase('danger');
            soundEffects.playWarningBeep();
          } else if (next <= 60) {
            setPhase('warning');
          } else {
            setPhase('normal');
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(DEFAULT_SECONDS);
      setPhase('normal');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = (seconds: number = DEFAULT_SECONDS) => {
    setIsRunning(false);
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setPhase('normal');
  };

  const addSeconds = (secs: number) => {
    setTimeLeft((prev) => {
      const next = prev + secs;
      if (next > 60) setPhase('normal');
      else if (next > 10) setPhase('warning');
      return next;
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalSeconds) * 100));

  const getPhaseStyles = () => {
    switch (phase) {
      case 'overtime':
        return {
          container: 'bg-red-950/70 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse',
          timerText: 'text-red-500 font-black scale-105',
          badge: 'bg-red-500 text-white animate-bounce',
          bar: 'bg-red-600',
        };
      case 'danger':
        return {
          container: 'bg-red-950/40 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
          timerText: 'text-red-400 font-bold animate-pulse',
          badge: 'bg-red-600/30 text-red-300 border border-red-500',
          bar: 'bg-red-500',
        };
      case 'warning':
        return {
          container: 'bg-amber-950/30 border-amber-600/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
          timerText: 'text-amber-400 font-bold',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          bar: 'bg-amber-500',
        };
      default:
        return {
          container: 'bg-slate-900 border-slate-800',
          timerText: 'text-emerald-400 font-bold',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          bar: 'bg-emerald-500',
        };
    }
  };

  const styles = getPhaseStyles();

  return (
    <div
      className={`rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 border-2 ${styles.container}`}
    >
      {/* Header & Stage Tag */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isRunning ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Now Pitching
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {phase === 'overtime' ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                🚨 TIME'S UP! (หมดเวลา)
              </span>
            ) : phase === 'danger' ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                ⚠️ 10 วินาทีสุดท้าย
              </span>
            ) : phase === 'warning' ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                ⏳ 1 นาทีสุดท้าย
              </span>
            ) : (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}>
                Active Stage
              </span>
            )}
          </div>
        </div>

        {/* Current Team Information */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          {currentTeam ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">
                  Current Presenter
                </span>
                <span className="text-xs text-slate-400">
                  {currentTeam.pitcher || 'ตัวแทนทีม'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white truncate">
                {currentTeam.name}
              </h3>
              <p className="text-xs text-indigo-200/90 line-clamp-1">
                {currentTeam.project_name || 'หัวข้อการแข่งขัน Antigravity'}
              </p>
            </div>
          ) : (
            <div className="py-2 text-center text-slate-500 text-xs font-medium">
              ยังไม่มีทีมบนเวที — กดปุ่มสุ่มทีม (SPIN) เพื่อเริ่มคิว
            </div>
          )}
        </div>
      </div>

      {/* Giant Countdown Clock Display */}
      <div className="my-6 text-center">
        <div
          className={`font-mono text-6xl sm:text-7xl lg:text-8xl tracking-tighter select-none transition-all duration-300 ${styles.timerText}`}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2.5 rounded-full mt-4 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={() => resetTimer(180)}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            3 นาที
          </button>
          <button
            onClick={() => resetTimer(300)}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            5 นาที
          </button>
          <button
            onClick={() => addSeconds(60)}
            className="flex items-center space-x-0.5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <Plus size={12} />
            <span>1 นาที</span>
          </button>
          <button
            onClick={() => addSeconds(30)}
            className="flex items-center space-x-0.5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <Plus size={12} />
            <span>30 วิ</span>
          </button>
        </div>
      </div>

      {/* Controls & Finish Button */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleTimer}
            disabled={!currentTeam}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
              !currentTeam
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            <span>{isRunning ? 'หยุดชั่วคราว (Pause)' : 'เริ่มจับเวลา (Start)'}</span>
          </button>

          <button
            onClick={() => resetTimer(totalSeconds)}
            disabled={!currentTeam}
            className="py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <RotateCcw size={16} />
            <span>รีเซ็ต (Reset)</span>
          </button>
        </div>

        {/* Mark Completed */}
        {currentTeam && (
          <button
            onClick={() => onFinishPitch(currentTeam)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800/90 hover:bg-emerald-900/60 hover:text-emerald-300 text-slate-300 border border-slate-700 flex items-center justify-center space-x-2 transition-all"
          >
            <CheckCircle size={15} />
            <span>เสร็จสิ้นการ Pitch (Finish & Next)</span>
          </button>
        )}
      </div>
    </div>
  );
};
