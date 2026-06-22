/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import PhaseCircle from './components/PhaseCircle';
import MenstrualCalendar from './components/MenstrualCalendar';
import SymptomLogger from './components/SymptomLogger';
import HistoryCharts from './components/HistoryCharts';
import HealthTips from './components/HealthTips';
import SettingsPanel from './components/SettingsPanel';
import { Sparkles, CalendarHeart, Heart, Info, RotateCcw } from 'lucide-react';

export default function App() {
  // Sync selection state to simulated current local date context: June 22, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-06-22'));

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // Smoothly scroll to the logger panel on mobile screens
    const loggerElement = document.getElementById('symptom-logger-card');
    if (loggerElement && window.innerWidth < 1024) {
      loggerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]/80 flex flex-col selection:bg-brand-100 selection:text-brand-900 pb-12">
      {/* 1. Universal Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-100">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-stone-800 tracking-tight leading-none">
                SiklusKu
              </h1>
              <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-1 block">
                Sains & Pelacak Siklus Pintar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-bold text-stone-450 uppercase tracking-wider">
                Simulasi Hari Ini
              </span>
              <span className="text-xs font-semibold text-stone-700">
                Senin, 22 Juni 2026
              </span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="Sistem Aktif & Terlindungi"></div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Core Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT & CENTER SECTIONS (lg:col-span-2) - High level overview, calendars & charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Row: Dial status & Calendar side-by-side on tablet/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 w-full">
                <PhaseCircle />
              </div>
              <div className="md:col-span-3 w-full">
                <MenstrualCalendar
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              </div>
            </div>

            {/* Middle Row: Personalized Wellness micro-guides */}
            <div>
              <HealthTips />
            </div>

            {/* Bottom Row: Core charts & Histograms tab */}
            <div>
              <HistoryCharts />
            </div>

            {/* Disclaimer & Privacy Pledge note */}
            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 flex gap-3 items-start">
              <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-500 leading-relaxed">
                <strong>🛡️ Jaminan Privasi Pelacak:</strong> SiklusKu mematuhi standar kerahasiaan tertinggi. Semua catatan haid, gejala fisik, berat badan, serta catatan harian disimpan seluruhnya secara <strong>lokal di dalam peramban (browser)</strong> perangkat Anda. Data ini tidak pernah diunggah ke peladen (server) luar apa pun, menjamin privasi reproduksi Anda tetap aman 100%.
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (lg:sub-span-1) - Symptom logger form & general configuration panel */}
          <div className="space-y-6">
            {/* Symptom logger cards */}
            <div id="symptom-logger-section">
              <SymptomLogger selectedDate={selectedDate} />
            </div>

            {/* Settings & Overrides block */}
            <div id="settings-section">
              <SettingsPanel />
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="mt-16 border-t border-stone-100 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs text-stone-400 space-y-2">
          <p className="flex items-center justify-center gap-1">
            Dibuat dengan cinta untuk Kesehatan Reproduksi Perempuan <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-400" />
          </p>
          <p>© 2026 SiklusKu Tracker. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
