/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addDays, differenceInDays, format, isAfter, isBefore, isSameDay, isWithinInterval, parseISO, subDays } from 'date-fns';
import { PeriodLog, UserSettings, PhaseType } from '../types';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  isLoggedPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}

export function getLatestPeriodLog(periodLogs: PeriodLog[]): PeriodLog | null {
  if (periodLogs.length === 0) return null;
  return [...periodLogs].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

/**
 * Predicts the next N period start dates
 */
export function predictNextPeriods(
  periodLogs: PeriodLog[],
  settings: UserSettings,
  count: number = 3
): Date[] {
  const latestLog = getLatestPeriodLog(periodLogs);
  const cycleLength = settings.averageCycleLength || 28;
  
  if (!latestLog) {
    // If no logs, assume next starts today
    const today = new Date();
    return Array.from({ length: count }, (_, i) => addDays(today, i * cycleLength));
  }

  const lastStart = parseISO(latestLog.startDate);
  return Array.from({ length: count }, (_, i) => addDays(lastStart, (i + 1) * cycleLength));
}

/**
 * Gets the phase status and information for a specific date
 */
export function getPhaseInfo(
  date: Date,
  periodLogs: PeriodLog[],
  settings: UserSettings
): {
  phase: PhaseType;
  label: string;
  description: string;
  colorClass: string;
  subColorClass: string;
} {
  const dateStr = format(date, 'yyyy-MM-dd');
  const d = parseISO(dateStr);

  // 1. Is it a logged period day?
  const isLogged = periodLogs.some((log) => {
    const start = parseISO(log.startDate);
    const end = log.endDate 
      ? parseISO(log.endDate) 
      : addDays(start, settings.averagePeriodLength - 1);
    
    return (
      (isSameDay(d, start) || isAfter(d, start)) &&
      (isSameDay(d, end) || isBefore(d, end))
    );
  });

  if (isLogged) {
    return {
      phase: 'menstrual',
      label: 'Fase Menstruasi (Haid)',
      description: 'Tubuh Anda sedang luruh. Fokuslah pada istirahat, hidrasi, dan kurangi aktivitas berat.',
      colorClass: 'bg-brand-500 text-white',
      subColorClass: 'text-brand-500 border-brand-200 bg-brand-50',
    };
  }

  // 2. Is it a predicted period?
  const cycleLength = settings.averageCycleLength || 28;
  const periodLength = settings.averagePeriodLength || 5;
  const latestLog = getLatestPeriodLog(periodLogs);
  
  let isPredicted = false;
  if (latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    // Project forward up to 1 year
    for (let i = 1; i <= 12; i++) {
      const predStart = addDays(lastStart, i * cycleLength);
      const predEnd = addDays(predStart, periodLength - 1);
      
      if (
        (isSameDay(d, predStart) || isAfter(d, predStart)) &&
        (isSameDay(d, predEnd) || isBefore(d, predEnd))
      ) {
        isPredicted = true;
        break;
      }
    }
  }

  if (isPredicted) {
    return {
      phase: 'menstrual',
      label: 'Prediksi Menstruasi',
      description: 'Siklus menstruasi berikutnya diperkirakan akan dimulai. Bersiaplah dengan pembalut/alat sanitasi.',
      colorClass: 'bg-brand-300 text-white border border-dashed border-brand-500',
      subColorClass: 'text-brand-400 border-brand-300 bg-brand-50/50',
    };
  }

  // 3. Check fertile and ovulation windows
  // For each cycle (past or predicted), we calculate the ovulation date.
  // Ovulation = next period start - 14 days. Fertile window = ovulation - 5 days through ovulation + 1 day.
  let isFertile = false;
  let isOvulation = false;

  if (latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    
    // Check past cycle windows (1 cycle back) and forward cycles (up to 6 cycles)
    for (let i = 0; i <= 6; i++) {
      const currentCycleStart = addDays(lastStart, i * cycleLength);
      const nextCycleStart = addDays(currentCycleStart, cycleLength);
      
      const ovulation = subDays(nextCycleStart, 14);
      const fertileStart = subDays(ovulation, 5);
      const fertileEnd = addDays(ovulation, 1);

      if (isSameDay(d, ovulation)) {
        isOvulation = true;
        isFertile = true;
        break;
      } else if (
        (isSameDay(d, fertileStart) || isAfter(d, fertileStart)) &&
        (isSameDay(d, fertileEnd) || isBefore(d, fertileEnd))
      ) {
        isFertile = true;
        break;
      }
    }
  } else {
    // If no past cycles are logged, estimate relative to today
    const today = new Date();
    const ovulation = addDays(today, 14);
    const fertileStart = subDays(ovulation, 5);
    const fertileEnd = addDays(ovulation, 1);
    
    if (isSameDay(d, ovulation)) {
      isOvulation = true;
      isFertile = true;
    } else if (
      (isSameDay(d, fertileStart) || isAfter(d, fertileStart)) &&
      (isSameDay(d, fertileEnd) || isBefore(d, fertileEnd))
    ) {
      isFertile = true;
    }
  }

  if (isOvulation) {
    return {
      phase: 'ovulation',
      label: 'Fase Ovulasi (Hari Puncak)',
      description: 'Ini adalah hari ketika sel telur dilepaskan. Peluang kehamilan berada di tingkat tertinggi.',
      colorClass: 'bg-emerald-600 text-white shadow-emerald-100',
      subColorClass: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    };
  }

  if (isFertile) {
    return {
      phase: 'fertile',
      label: 'Masa Subur',
      description: 'Peluang tinggi untuk hamil. Sperma dapat bertahan hidup hingga 5 hari di dalam tubuh.',
      colorClass: 'bg-emerald-400 text-white',
      subColorClass: 'text-emerald-500 border-emerald-100 bg-emerald-50/50',
    };
  }

  // 4. Follicular and Luteal
  // Follicular is the interval between Period End and Fertile Window Start.
  // Luteal is between Ovulation Day + 2 and Next Period Start.
  if (latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    
    // Find which cycle slot that 'd' falls in
    const daysSinceLastStart = differenceInDays(d, lastStart) % cycleLength;
    const normalizedDays = daysSinceLastStart >= 0 ? daysSinceLastStart : daysSinceLastStart + cycleLength;

    // Inside a 28 day cycle:
    // Period: 0 to 4
    // Follicular: 5 to 7
    // Fertile: 8 to 14 (Ovulation on Day 14)
    // Luteal: 15 to 27
    
    // Formally let's calculate based on offsets
    const ovulationDayIndex = cycleLength - 14; // e.g. 14 for length 28
    const fertileStartIndex = ovulationDayIndex - 5; // e.g. 9
    
    if (normalizedDays < periodLength) {
      // It was already caught by period check unless it's a gap day (in case where actual period is shorter than settings)
      return {
        phase: 'follicular',
        label: 'Fase Folikuler',
        description: 'Tingkat estrogen mulai meningkat. Anda merasa lebih energik, cerah, dan ramah.',
        colorClass: 'bg-indigo-500 text-white',
        subColorClass: 'text-indigo-600 border-indigo-200 bg-indigo-50',
      };
    } else if (normalizedDays < fertileStartIndex) {
      return {
        phase: 'follicular',
        label: 'Fase Folikuler',
        description: 'Estrogen berkembang dan mempersiapkan sel telur baru. Energi, kreativitas, dan motivasi meningkat.',
        colorClass: 'bg-sky-500 text-white',
        subColorClass: 'text-sky-600 border-sky-100 bg-sky-50',
      };
    } else {
      return {
        phase: 'luteal',
        label: 'Fase Luteal',
        description: 'Progesteron mendominasi. Tubuh melambat, gejala PMS mungkin muncul. Waktunya memanjakan diri.',
        colorClass: 'bg-amber-500 text-white',
        subColorClass: 'text-amber-600 border-amber-200 bg-amber-50',
      };
    }
  }

  // Fallback
  return {
    phase: 'follicular',
    label: 'Fase Folikuler',
    description: 'Estrogen berkembang secara bertahap. Waktu optimal untuk produktivitas kerja dan bersosialisasi.',
    colorClass: 'bg-sky-500 text-white',
    subColorClass: 'text-sky-600 border-sky-100 bg-sky-50',
  };
}

/**
 * Gets full checklist status of a specific day for calendar highlights
 */
export function getDayStatus(
  date: Date,
  periodLogs: PeriodLog[],
  settings: UserSettings
): DayStatus {
  const dateStr = format(date, 'yyyy-MM-dd');
  const d = parseISO(dateStr);
  const cycleLength = settings.averageCycleLength || 28;
  const periodLength = settings.averagePeriodLength || 5;
  const latestLog = getLatestPeriodLog(periodLogs);

  // 1. Is Logged Period?
  const isLoggedPeriod = periodLogs.some((log) => {
    const start = parseISO(log.startDate);
    const end = log.endDate 
      ? parseISO(log.endDate) 
      : addDays(start, periodLength - 1);
    
    return (
      (isSameDay(d, start) || isAfter(d, start)) &&
      (isSameDay(d, end) || isBefore(d, end))
    );
  });

  // 2. Is Predicted Period?
  let isPredictedPeriod = false;
  if (!isLoggedPeriod && latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    // Check up to 12 cycles in future
    for (let i = 1; i <= 12; i++) {
      const predStart = addDays(lastStart, i * cycleLength);
      const predEnd = addDays(predStart, periodLength - 1);
      if (
        (isSameDay(d, predStart) || isAfter(d, predStart)) &&
        (isSameDay(d, predEnd) || isBefore(d, predEnd))
      ) {
        isPredictedPeriod = true;
        break;
      }
    }
  }

  // 3. Is Fertile / Ovulation?
  let isFertile = false;
  let isOvulation = false;

  if (latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    for (let i = 0; i <= 6; i++) {
      const currentCycleStart = addDays(lastStart, i * cycleLength);
      const nextCycleStart = addDays(currentCycleStart, cycleLength);
      
      const ovulation = subDays(nextCycleStart, 14);
      const fertileStart = subDays(ovulation, 5);
      const fertileEnd = addDays(ovulation, 1);

      if (isSameDay(d, ovulation)) {
        isOvulation = true;
        isFertile = true;
        break;
      } else if (
        (isSameDay(d, fertileStart) || isAfter(d, fertileStart)) &&
        (isSameDay(d, fertileEnd) || isBefore(d, fertileEnd))
      ) {
        isFertile = true;
        break;
      }
    }
  }

  return {
    date: dateStr,
    isPeriod: isLoggedPeriod || isPredictedPeriod,
    isLoggedPeriod,
    isPredictedPeriod,
    isFertile,
    isOvulation,
  };
}
