/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTrackerStore, getCycleStats } from '../store';
import { PeriodLog, DailyLog } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BarChart3, Activity, PieChart, TrendingUp, Sparkles, Scale } from 'lucide-react';

export default function HistoryCharts() {
  const { periodLogs, dailyLogs, settings } = useTrackerStore();
  const [activeTab, setActiveTab] = useState<'history' | 'biomarkers' | 'symptoms'>('history');

  // Process Cycle & Period Length History
  // Needs to be sorted cron ascending
  const sortedPeriodLogs = [...periodLogs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  const historyData = [];
  for (let i = 0; i < sortedPeriodLogs.length; i++) {
    const current = sortedPeriodLogs[i];
    const prev = i > 0 ? sortedPeriodLogs[i - 1] : null;
    
    // Period bleeding duration
    let durasiHaid = settings.averagePeriodLength;
    if (current.startDate && current.endDate) {
      durasiHaid = differenceInDays(parseISO(current.endDate), parseISO(current.startDate)) + 1;
    }
    
    // Cycle length is calculated from previous cycle start to current cycle start
    if (prev) {
      const length = differenceInDays(parseISO(current.startDate), parseISO(prev.startDate));
      // Save for the previous cycle slot
      historyData.push({
        siklusLabel: `Siklus ${format(parseISO(prev.startDate), 'MMM')} '26`,
        'Panjang Siklus (Hari)': length,
        'Durasi Haid (Hari)': durasiHaid,
      });
    }
  }

  // If there's only 1 cycle logged or we need initial elements
  if (historyData.length === 0 && sortedPeriodLogs.length > 0) {
    const single = sortedPeriodLogs[0];
    let durasiHaid = settings.averagePeriodLength;
    if (single.startDate && single.endDate) {
      durasiHaid = differenceInDays(parseISO(single.endDate), parseISO(single.startDate)) + 1;
    }
    historyData.push({
      siklusLabel: `Siklus Terkini`,
      'Panjang Siklus (Hari)': settings.averageCycleLength,
      'Durasi Haid (Hari)': durasiHaid,
    });
  }

  // Process Basal Biomarkers (Suhu & Berat Badan)
  // Get all dates with logged weights or temperatures and sort chronological
  const biomarkerData = Object.values(dailyLogs)
    .filter((log) => log.weight !== undefined || log.temperature !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      tanggal: format(parseISO(log.date), 'dd MMM'),
      'Suhu Tubuh (°C)': log.temperature,
      'Berat Badan (kg)': log.weight,
    }));

  // Process Symptom & Mood frequencies
  const symptomsCount: Record<string, number> = {};
  const moodsCount: Record<string, number> = {};
  
  Object.values(dailyLogs).forEach((log) => {
    (log.symptoms || []).forEach((sym) => {
      symptomsCount[sym] = (symptomsCount[sym] || 0) + 1;
    });
    (log.moods || []).forEach((md) => {
      moodsCount[md] = (moodsCount[md] || 0) + 1;
    });
  });

  const SYMPTOMS_LABELS: Record<string, string> = {
    cramps: '😣 Kram Perut',
    headache: '🤕 Sakit Kepala',
    bloating: '🎈 Perut Kembung',
    breast_tenderness: '🍒 Payudara Ngilu',
    backache: '🦴 Sakit Punggung',
    acne: '🔴 Timbul Jerawat',
    nausea: '🤢 Mual / Pusing',
    insomnia: '👁️ Sulit Tidur',
    fatigue: '💤 Lemas / Lelah',
  };

  const MOODS_LABELS: Record<string, string> = {
    happy: '😊 Senang',
    calm: '😌 Tenang',
    energetic: '⚡ Berenergi',
    tired: '🥱 Lelah / Lesu',
    sad: '😢 Sedih',
    irritable: '😡 Sensitif',
    anxious: '😰 Cemas',
    crampy: '🤕 Bad Mood',
  };

  const symptomsList = Object.entries(symptomsCount)
    .map(([key, count]) => ({
      name: SYMPTOMS_LABELS[key] || key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const moodsList = Object.entries(moodsCount)
    .map(([key, count]) => ({
      name: MOODS_LABELS[key] || key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div id="analytics-panel-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 flex flex-col h-full justify-between">
      <div>
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-stone-800">
              Analitik & Tren Kesehatan
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Visualisasi historis panjang siklus dan pola gejala Anda
            </p>
          </div>

          <div className="flex bg-stone-100 p-1.2 rounded-2xl border border-stone-200/50 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white shadow-xs text-stone-800'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Siklus
            </button>
            <button
              onClick={() => setActiveTab('biomarkers')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'biomarkers'
                  ? 'bg-white shadow-xs text-stone-800'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Biomarker
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'symptoms'
                  ? 'bg-white shadow-xs text-stone-800'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              Keluhan
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[280px]">
          {/* TAB 1: Cycle Length History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {historyData.length > 0 ? (
                <div className="w-full h-[260px] text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={historyData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" />
                      <XAxis dataKey="siklusLabel" stroke="#a3a39e" />
                      <YAxis stroke="#a3a39e" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          color: '#fff',
                          borderRadius: '16px',
                          border: 'none',
                        }}
                      />
                      <Legend iconType="circle" />
                      <Bar
                        dataKey="Panjang Siklus (Hari)"
                        fill="#ffbec8"
                        radius={[10, 10, 0, 0]}
                      />
                      <Bar
                        dataKey="Durasi Haid (Hari)"
                        fill="#f43f68"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-stone-400 min-h-[220px]">
                  <BarChart3 className="w-12 h-12 text-stone-300 stroke-1.5 mb-2.5" />
                  <p className="text-sm">Riwayat siklus belum mencukupi.</p>
                  <p className="text-xs text-stone-400 mt-1">Selesaikan setidaknya 2 siklus pendarahan untuk melihat peta statistik.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Basal Biomarkers (Temp & Weight) */}
          {activeTab === 'biomarkers' && (
            <div className="space-y-4">
              {biomarkerData.length > 0 ? (
                <div className="w-full h-[260px] text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={biomarkerData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" />
                      <XAxis dataKey="tanggal" stroke="#a3a39e" />
                      <YAxis yAxisId="left" stroke="#38bdf8" label={{ value: 'Suhu (°C)', angle: -90, position: 'insideLeft', fill: '#0284c7' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Berat (kg)', angle: 90, position: 'insideRight', fill: '#047857' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          color: '#fff',
                          borderRadius: '16px',
                          border: 'none',
                        }}
                      />
                      <Legend iconType="circle" />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Suhu Tubuh (°C)"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Berat Badan (kg)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-stone-400 min-h-[220px]">
                  <Activity className="w-12 h-12 text-stone-300 stroke-1.5 mb-2.5" />
                  <p className="text-sm">Biomarker belum tercatat.</p>
                  <p className="text-xs text-stone-400 mt-1">Masukkan parameter Suhu Basal atau Berat Badan harian di pencatat sebelah kanan.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Symptoms & Mood Distribution */}
          {activeTab === 'symptoms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Symptoms frequencies */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Keluhan Fisik (Sering Dirasakan)
                </div>
                {symptomsList.length > 0 ? (
                  <div className="space-y-2.5">
                    {symptomsList.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-stone-700">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-stone-400">{item.count} hari</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-400 h-full rounded-full"
                            style={{
                              width: `${Math.min((item.count / 10) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 py-6 text-center">Belum ada catatan gejala fisik.</div>
                )}
              </div>

              {/* Mood frequencies */}
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Kekerapan Suasana Hati
                </div>
                {moodsList.length > 0 ? (
                  <div className="space-y-2.5">
                    {moodsList.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-stone-700">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-stone-400">{item.count} hari</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{
                              width: `${Math.min((item.count / 10) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 py-6 text-center">Belum ada catatan kondisi suasana hati.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer statistics summaries summaries */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3">
        <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="text-xs text-stone-500 leading-relaxed">
          Kesehatan haid dinilai stabil. Rata-rata siklus Anda berjalan selama{' '}
          <strong className="text-stone-700">{settings.averageCycleLength} hari</strong>, dengan durasi haid rata-rata{' '}
          <strong className="text-stone-700">{settings.averagePeriodLength} hari</strong>.
        </span>
      </div>
    </div>
  );
}
