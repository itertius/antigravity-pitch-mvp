'use client';

import React, { useState } from 'react';
import { Team } from '../types';
import { Users, Upload, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

interface TeamPoolProps {
  teams: Team[];
  onImportCSV: (csvText: string) => void;
  onResetMock: () => void;
  isLoading?: boolean;
}

export const TeamPool: React.FC<TeamPoolProps> = ({
  teams,
  onImportCSV,
  onResetMock,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'pool' | 'completed'>('pool');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState('');

  const poolTeams = teams.filter((t) => t.status === 'pool');
  const completedTeams = teams.filter((t) => t.status === 'completed');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportCSV(content);
        setShowImportModal(false);
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (csvInput.trim()) {
      onImportCSV(csvInput);
      setCsvInput('');
      setShowImportModal(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full shadow-xl">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              รายชื่อทีมแข่งขัน
            </h2>
            <p className="text-xs text-slate-400">Pool of Teams (Google Form)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700"
            title="นำเข้าข้อมูลจาก Google Form / CSV"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={onResetMock}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="รีเซ็ตเป็นข้อมูล Mock Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-4 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('pool')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'pool'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={13} />
          <span>รอสุ่ม ({poolTeams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>Pitch แล้ว ({completedTeams.length})</span>
        </button>
      </div>

      {/* Team List Content */}
      <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 max-h-[460px] custom-scrollbar">
        {activeTab === 'pool' ? (
          poolTeams.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              ไม่มีทีมเหลือใน Pool แล้ว
            </div>
          ) : (
            poolTeams.map((team, idx) => (
              <div
                key={team.id}
                className="group p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-indigo-500/40 transition-all flex items-start justify-between"
              >
                <div className="space-y-1 overflow-hidden pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {team.name}
                    </h3>
                  </div>
                  <p className="text-xs text-indigo-300/80 truncate">
                    {team.project_name || 'หัวข้อยังไม่ระบุ'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Pitcher: {team.pitcher || 'ตัวแทนทีม'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  Ready
                </span>
              </div>
            ))
          )
        ) : (
          completedTeams.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              ยังไม่มีทีมที่ Pitch เสร็จสิ้น
            </div>
          ) : (
            completedTeams.map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-xl bg-slate-950/30 border border-emerald-950/40 flex items-start justify-between opacity-80"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-900/50 text-[10px] text-emerald-300 font-bold shrink-0">
                      #{team.order_num || '✓'}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200 line-through">
                      {team.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">{team.project_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Done
                </span>
              </div>
            ))
          )
        )}
      </div>

      {/* Modal Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload size={18} className="text-indigo-400" />
                <span>นำเข้าข้อมูลจาก Google Form</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  1. อัปโหลดไฟล์ .CSV จาก Google Form
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest">
                  หรือ วางข้อมูลโดยตรง
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  2. วางข้อมูลตาราง (ชื่อทีม, หัวข้อโปรเจกต์, ผู้บรรยาย)
                </label>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Team Alpha, AI Diagnostics, Somchai
Team Beta, Drone Mapping, Somsri
Team Gamma, FinTech Agent, Somsak"
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleManualImport}
                disabled={!csvInput.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                เพิ่มเข้า Pool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
