/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useTrackerStore } from '../store';
import { FlowLevel, MoodType, SymptomType, DailyLog } from '../types';
import { format, parseISO } from 'date-fns';
import { Save, Sparkles, Scale, Thermometer, Smile, HeartHandshake, CheckCircle } from 'lucide-react';

interface SymptomLoggerProps {
  selectedDate: Date;
}

const IND_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const FLOW_OPTIONS: { value: FlowLevel; label: string; desc: string; color: string }[] = [
  { value: 'none', label: 'Tidak Ada', desc: 'Bersih/kering', color: 'bg-stone-100 text-stone-700 hover:bg-stone-200' },
  { value: 'light', label: 'Flek / Sedikit', desc: 'Sangat sedikit', color: 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100' },
  { value: 'medium', label: 'Sedang', desc: 'Reguler harian', color: 'bg-brand-100 text-brand-800 border-brand-300 hover:bg-brand-200' },
  { value: 'heavy', label: 'Banyak / Deras', desc: 'Mengalir deras', color: 'bg-brand-500 text-white hover:bg-brand-600' },
];

const MOODS: { value: MoodType; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: 'Senang' },
  { value: 'calm', emoji: '😌', label: 'Tenang' },
  { value: 'energetic', emoji: '⚡', label: 'Berenergi' },
  { value: 'tired', emoji: '🥱', label: 'Lelah / Lesu' },
  { value: 'sad', emoji: '😢', label: 'Sedih' },
  { value: 'irritable', emoji: '😡', label: 'Sensitif' },
  { value: 'anxious', emoji: '😰', label: 'Cemas' },
  { value: 'crampy', emoji: '🤕', label: 'Bad Mood' },
];

const SYMPTOMS: { value: SymptomType; label: string; icon: string }[] = [
  { value: 'cramps', label: 'Kram Perut', icon: '😣' },
  { value: 'headache', label: 'Sakit Kepala', icon: '🤕' },
  { value: 'bloating', label: 'Perut Kembung', icon: '🎈' },
  { value: 'breast_tenderness', label: 'Payudara Ngilu', icon: '🍒' },
  { value: 'backache', label: 'Sakit Punggung', icon: '🦴' },
  { value: 'acne', label: 'Timbul Jerawat', icon: '🔴' },
  { value: 'nausea', label: 'Mual / Pusing', icon: '🤢' },
  { value: 'insomnia', label: 'Sulit Tidur', icon: '👁️' },
  { value: 'fatigue', label: 'Sangat Lemas', icon: '💤' },
];

export default function SymptomLogger({ selectedDate }: SymptomLoggerProps) {
  const { dailyLogs, setDailyLog } = useTrackerStore();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Local form states synced with selected date
  const [flow, setFlow] = useState<FlowLevel>('none');
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [temp, setTemp] = useState<string>('');
  
  // Save confirmation notification trigger
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing log if available for the newly selected date
  useEffect(() => {
    const log = dailyLogs[dateStr];
    if (log) {
      setFlow(log.flow || 'none');
      setSelectedMoods(log.moods || []);
      setSelectedSymptoms(log.symptoms || []);
      setNotes(log.notes || '');
      setWeight(log.weight ? log.weight.toString() : '');
      setTemp(log.temperature ? log.temperature.toString() : '');
    } else {
      // Reset form to empty baseline for unlogged dates
      setFlow('none');
      setSelectedMoods([]);
      setSelectedSymptoms([]);
      setNotes('');
      setWeight('');
      setTemp('');
    }
    setSaveSuccess(false);
  }, [selectedDate, dailyLogs, dateStr]);

  const toggleMood = (mood: MoodType) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const toggleSymptom = (symptom: SymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedWeight = parseFloat(weight);
    const parsedTemp = parseFloat(temp);

    setDailyLog(dateStr, {
      flow,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      notes,
      weight: isNaN(parsedWeight) ? undefined : parsedWeight,
      temperature: isNaN(parsedTemp) ? undefined : parsedTemp,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Human-friendly date header
  const formattedHeaderDate = `${selectedDate.getDate()} ${
    IND_MONTHS_SHORT[selectedDate.getMonth()]
  } ${selectedDate.getFullYear()}`;

  return (
    <div id="symptom-logger-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 h-full flex flex-col justify-between">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Title */}
        <div className="flex justify-between items-start border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-stone-800">
              Catatan Kesehatan
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Catat parameter & keluhan untuk tanggal pilihan Anda
            </p>
          </div>
          <div className="bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
            <span className="text-xs font-bold text-brand-600">
              {formattedHeaderDate}
            </span>
          </div>
        </div>

        {/* 1. Menstrual Flow Intensity */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            🩸 Aliran Haid / Flek
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FLOW_OPTIONS.map((opt) => {
              const isSelected = flow === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFlow(opt.value)}
                  className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? opt.value === 'heavy'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-100 scale-[1.02]'
                        : opt.value === 'none'
                        ? 'bg-zinc-800 text-white border-zinc-800 shadow-xs'
                        : 'bg-brand-100 text-brand-800 border-brand-300 font-semibold scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className={`text-[9px] mt-0.5 ${isSelected && opt.value !== 'heavy' ? 'text-brand-600' : 'text-stone-400'}`}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mood Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-stone-400" />
            Suasana Hati (Mood)
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((md) => {
              const isSelected = selectedMoods.includes(md.value);
              return (
                <button
                  key={md.value}
                  type="button"
                  onClick={() => toggleMood(md.value)}
                  className={`py-2 px-3 rounded-2xl text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold scale-105'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{md.emoji}</span>
                  <span>{md.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Physical Symptoms Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-stone-400" />
            Gejala Fisik
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.value);
              return (
                <button
                  key={sym.value}
                  type="button"
                  onClick={() => toggleSymptom(sym.value)}
                  className={`py-2.5 px-3 rounded-2xl text-xs text-left flex items-center gap-2 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 border-rose-200 text-brand-800 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-base leading-none">{sym.icon}</span>
                  <span className="truncate">{sym.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Body Parameters Side-by-Side (Weight & Temp) */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-stone-100 py-4">
          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-stone-400" />
              Berat Badan (kg)
            </label>
            <input
              type="number"
              step="0.05"
              placeholder="e.g. 54.2"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full text-sm py-2 px-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-stone-400" />
              Suhu Basal (°C)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 36.6"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full text-sm py-2 px-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
            />
          </div>
        </div>

        {/* 5. Diary Notes Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            📝 Diary / Catatan Khusus
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan keluhan, aktivitas seksual, obat-obatan, atau apa pun yang Anda rasakan hari ini..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm py-2 px-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 leading-relaxed resize-none"
          ></textarea>
        </div>

        {/* Submit Form Action button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 px-5 rounded-2xl bg-brand-500 text-white font-semibold text-sm tracking-wide cursor-pointer transition shadow-sm hover:bg-brand-600 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Catatan Harian
          </button>
        </div>
      </form>

      {/* Confirmation Banner */}
      {saveSuccess && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs font-medium animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Selesai! Catatan kesehatan berhasil disimpan secara aman di peramban Anda.</span>
        </div>
      )}
    </div>
  );
}
