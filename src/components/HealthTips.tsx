/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTrackerStore } from '../store';
import { getPhaseInfo } from '../utils/cycleCalculator';
import { Apple, Dumbbell, Coffee, Sparkles, Footprints, ShieldCheck } from 'lucide-react';

export default function HealthTips() {
  const { periodLogs, settings } = useTrackerStore();
  const today = new Date();
  const phaseInfo = getPhaseInfo(today, periodLogs, settings);

  // Content advice builder based on active cycle stage
  const getPhaseAdvice = () => {
    switch (phaseInfo.phase) {
      case 'menstrual':
        return {
          exercise: 'Latihan Intensitas Ringan: Berjalan santai, Yin Yoga, atau peregangan ringan. Hindari membalikkan badan di air atau gerakan terbalik.',
          nutrition: 'Fokus Zat Besi & Hidrasi: Makan daging merah tanpa lemak, bayam, sup hangat, jahe hangat untuk kram, serta cokelat hitam.',
          selfcare: 'Istirahat Utama: Tidur minimal 8 jam, batasi asupan kafein, manjakan tubuh menggunakan bantal pemanas perut.',
          iconColor: 'text-brand-500 bg-brand-50'
        };
      case 'follicular':
        return {
          exercise: 'Olahraga Intensitas Sedang-Tinggi: Latihan kardio, angkat beban ringan, zumba, dan lari cepat. Energi Anda sedang berkembang!',
          nutrition: 'Makanan Segar & Fermentasi: Konsumsi sayur segar, buah beri, porsi karbohidrat kompleks (oats, quinoa), tempe/yoghurt.',
          selfcare: 'Eksplorasi Ide Baru: Ini adalah saat terbaik untuk merencanakan strategi pekerjaan, memulai hobi baru, dan memperluas jaringan sosial.',
          iconColor: 'text-sky-500 bg-sky-50'
        };
      case 'ovulation':
      case 'fertile':
        return {
          exercise: 'Olahraga Intensitas Maksimal: Kardio berat, HIIT, kickboxing, dan angkat beban berat. Tubuh Anda berada pada bentuk fisik terbaiknya!',
          nutrition: 'Antioksidan & Serat: Brokoli, kubis, bayam merah, buah alpukat (lemak sehat), kacang almond, dan air putih hangat melimpah.',
          selfcare: 'Komunikasi Luar Biasa: Libido dan rasa percaya diri Anda sedang memuncak. Gunakan fase ini untuk melakukan pidato, negosiasi, atau kencan romantik.',
          iconColor: 'text-emerald-500 bg-emerald-50'
        };
      case 'luteal':
      default:
        return {
          exercise: 'Latihan Menenangkan: Pilates, jalan sedang, atau yoga vinyasa lambat. Jika payudara terasa ngilu, hindari lompatan tinggi.',
          nutrition: 'Kurangi Garam & Gula: Kurangi makanan asin kemasan (mencegah perut kembung/water retention) dan makan pisang atau kacang-kacangan.',
          selfcare: 'Kurangi Overthinking: Sensitivitas emosi meningkat (PMS). Prioritaskan menulis jurnal harian, mandi air hangat, dan batasi beban kerja.',
          iconColor: 'text-amber-500 bg-amber-50'
        };
    }
  };

  const advice = getPhaseAdvice();

  return (
    <div id="health-tips-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 space-y-4">
      <div>
        <h3 className="font-serif text-lg font-medium text-stone-800 flex items-center gap-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Tips & Panduan Fase {phaseInfo.phase === 'menstrual' ? 'Haid' : phaseInfo.phase === 'luteal' ? 'Luteal' : phaseInfo.phase === 'ovulation' || phaseInfo.phase === 'fertile' ? 'Ovulasi/Subur' : 'Folikuler'}
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Rekomendasi gaya hidup praktis yang dipersonalisasi sesuai fluktuasi hormon Anda saat ini
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Advice Item 1: Nutrition */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-start gap-3">
          <div className={`p-2.5 rounded-xl ${advice.iconColor} shadow-2xs`}>
            <Apple className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-700">Nutrisi & Hidrasi</div>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {advice.nutrition}
            </p>
          </div>
        </div>

        {/* Advice Item 2: Gym/Exercise */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-start gap-3">
          <div className={`p-2.5 rounded-xl ${advice.iconColor} shadow-2xs`}>
            <Dumbbell className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-700">Aktivitas Fisik</div>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {advice.exercise}
            </p>
          </div>
        </div>

        {/* Advice Item 3: Self care */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex flex-col items-start gap-3">
          <div className={`p-2.5 rounded-xl ${advice.iconColor} shadow-2xs`}>
            <Coffee className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-700">Perawatan Diri & Mental</div>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {advice.selfcare}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
