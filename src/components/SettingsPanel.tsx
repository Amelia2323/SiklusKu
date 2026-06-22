/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTrackerStore } from '../store';
import { Settings, RefreshCw, Trash2, User, HelpCircle } from 'lucide-react';

export default function SettingsPanel() {
  const { settings, updateSettings, resetToDefault } = useTrackerStore();
  
  // Local editable form state
  const [userName, setUserName] = useState(settings.name);
  const [cycleLength, setCycleLength] = useState(settings.averageCycleLength);
  const [periodLength, setPeriodLength] = useState(settings.averagePeriodLength);
  
  // Interaction response triggers
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || cycleLength < 21 || cycleLength > 45 || periodLength < 3 || periodLength > 15) {
      alert('Mohon masukkan nilai yang valid (Siklus: 21-45 hari, Haid: 3-15 hari).');
      return;
    }
    
    updateSettings({
      name: userName,
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin memuat ulang data simulasi awal? Tindakan ini akan menimpa catatan kustom Anda saat ini.')) {
      resetToDefault();
      setUserName(settings.name);
      setCycleLength(settings.averageCycleLength);
      setPeriodLength(settings.averagePeriodLength);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleWipeData = () => {
    if (confirm('⚠️ PERINGATAN: Tindakan ini akan menghapus seluruh catatan haid dan gejala harian, serta mengatur ulang nama Anda. Hapus semua data harian?')) {
      // Clear store completely to empty state
      useTrackerStore.setState({
        periodLogs: [],
        dailyLogs: {},
        settings: {
          name: 'Pengguna',
          averageCycleLength: 28,
          averagePeriodLength: 5
        }
      });
      setUserName('Pengguna');
      setCycleLength(28);
      setPeriodLength(5);
      setWipeSuccess(true);
      setTimeout(() => setWipeSuccess(false), 3000);
    }
  };

  return (
    <div id="settings-panel-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex items-center gap-2 border-b border-stone-105 pb-4">
          <Settings className="w-5 h-5 text-stone-500" />
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-800">
              Konfigurasi Siklus
            </h3>
            <p className="text-[11px] text-stone-400">
              Sesuaikan model kalkulator medis untuk memprediksi tanggal Anda secara presisi
            </p>
          </div>
        </div>

        {/* Form Calibration */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Nama Panggilan
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-sm py-2.5 px-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
              placeholder="e.g. Aulia"
            />
          </div>

          {/* Average Cycle Length overrides */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center justify-between">
              <span>Durasi Rata-rata Siklus</span>
              <span className="text-[10px] text-stone-400 tracking-normal lowercase">(biasanya 21-45 hari)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="21"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="w-full text-sm py-2.5 px-3.5 pr-20 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 font-medium"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">Hari</span>
            </div>
          </div>

          {/* Average Period overrides */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center justify-between">
              <span>Durasi Rata-rata Peluruhan (Haid)</span>
              <span className="text-[10px] text-stone-400 tracking-normal lowercase">(biasanya 3-15 hari)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="3"
                max="15"
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)}
                className="w-full text-sm py-2.5 px-3.5 pr-20 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 font-medium"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">Hari</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-stone-850 hover:bg-stone-900 text-white font-semibold text-xs tracking-wider uppercase cursor-pointer transition shadow-xs"
          >
            Terapkan Kalibrasi Baru
          </button>
        </form>

        {/* Feedback Success Notification */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
            ✓ Parameter siklus berhasil dimutakhirkan. Kalender kini memproyeksikan hari subur dan perkiraan haid sesuai konfigurasi baru Anda.
          </div>
        )}
      </div>

      {/* Simulator Tools (Disruptive Actions) */}
      <div className="mt-8 pt-6 border-t border-stone-100 space-y-3.5">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
          🔧 Alat Penguji / Simulator
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Reload system simulated logs seeds */}
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 justify-center py-2 px-3 border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang Data Simulasi
          </button>

          {/* Dry wipe clean state */}
          <button
            type="button"
            onClick={handleWipeData}
            className="flex items-center gap-1.5 justify-center py-2 px-3 border border-red-200 text-red-650 bg-red-50/20 hover:bg-red-50 hover:text-red-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua Data (Kosongkan)
          </button>
        </div>

        {resetSuccess && (
          <div className="p-2 bg-indigo-50 text-indigo-800 rounded-xl text-[10px] font-medium text-center">
            ✓ Data simulasi berhasil dimuat ulang dengan riwayat pendarahan dan catatan harian pre-populated.
          </div>
        )}

        {wipeSuccess && (
          <div className="p-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-medium text-center">
            ✓ Seluruh data bersih terhapus. Anda siap melakukan pencatatan murni dari awal.
          </div>
        )}
      </div>
    </div>
  );
}
