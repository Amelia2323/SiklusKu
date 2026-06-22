/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PeriodLog, DailyLog, UserSettings, CycleStats } from './types';
import { differenceInDays, parseISO, addDays, subDays, format } from 'date-fns';

interface TrackerState {
  periodLogs: PeriodLog[];
  dailyLogs: Record<string, DailyLog>; // key: YYYY-MM-DD
  settings: UserSettings;
  
  // Actions
  addPeriodLog: (log: Omit<PeriodLog, 'id'>) => void;
  updatePeriodLog: (id: string, updated: Partial<Omit<PeriodLog, 'id'>>) => void;
  deletePeriodLog: (id: string) => void;
  
  setDailyLog: (date: string, log: Partial<Omit<DailyLog, 'date'>>) => void;
  deleteDailyLog: (date: string) => void;
  
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetToDefault: () => void;
}

// Generate high-quality mock data dynamically based on "today" (June 22, 2026)
const getInitialSettings = (): UserSettings => ({
  averageCycleLength: 28,
  averagePeriodLength: 5,
  name: 'Aulia',
});

const generateMockData = () => {
  // Reference date is June 22, 2026
  const baseToday = parseISO('2026-06-22');
  
  // 1. Period Logs
  // Current/last period: June 2 to June 7
  // Period 2: May 5 to May 10
  // Period 3: April 7 to April 12
  // Period 4: March 10 to March 15
  // Period 5: February 10 to February 15
  
  const p1Start = format(subDays(baseToday, 20), 'yyyy-MM-dd'); // June 2, 2026
  const p1End = format(subDays(baseToday, 15), 'yyyy-MM-dd');   // June 7, 2026

  const p2Start = format(subDays(baseToday, 48), 'yyyy-MM-dd'); // May 5, 2026
  const p2End = format(subDays(baseToday, 43), 'yyyy-MM-dd');   // May 10, 2026

  const p3Start = format(subDays(baseToday, 76), 'yyyy-MM-dd'); // Apr 7, 2026
  const p3End = format(subDays(baseToday, 71), 'yyyy-MM-dd');   // Apr 12, 2026

  const p4Start = format(subDays(baseToday, 104), 'yyyy-MM-dd'); // Mar 10, 2026
  const p4End = format(subDays(baseToday, 99), 'yyyy-MM-dd');   // Mar 15, 2026

  const p5Start = format(subDays(baseToday, 132), 'yyyy-MM-dd'); // Feb 10, 2026
  const p5End = format(subDays(baseToday, 127), 'yyyy-MM-dd');   // Feb 15, 2026

  const periodLogs: PeriodLog[] = [
    { id: 'p1', startDate: p1Start, endDate: p1End, flowRating: 'medium' },
    { id: 'p2', startDate: p2Start, endDate: p2End, flowRating: 'heavy' },
    { id: 'p3', startDate: p3Start, endDate: p3End, flowRating: 'medium' },
    { id: 'p4', startDate: p4Start, endDate: p4End, flowRating: 'heavy' },
    { id: 'p5', startDate: p5Start, endDate: p5End, flowRating: 'light' },
  ];

  // 2. Daily Logs for various phases
  const dailyLogs: Record<string, DailyLog> = {};

  // Log on June 2 (Day 1 of last period)
  dailyLogs[p1Start] = {
    date: p1Start,
    flow: 'heavy',
    moods: ['tired', 'sad'],
    symptoms: ['cramps', 'fatigue', 'backache'],
    notes: 'Hari pertama haid, kram perut cukup terasa di bagian bawah panggul. Minum air hangat membantu.',
    weight: 54.5,
    temperature: 36.4,
  };

  // Log on June 3 (Day 2 of last period)
  const p1Day2 = format(addDays(parseISO(p1Start), 1), 'yyyy-MM-dd');
  dailyLogs[p1Day2] = {
    date: p1Day2,
    flow: 'heavy',
    moods: ['irritable', 'tired'],
    symptoms: ['cramps', 'bloating', 'headache'],
    notes: 'Pendarahan masih deras, gampang tersinggung hari ini. Istirahat lebih awal.',
    weight: 54.8,
    temperature: 36.3,
  };

  // Log on June 5 (Day 4 of last period)
  const p1Day4 = format(addDays(parseISO(p1Start), 3), 'yyyy-MM-dd');
  dailyLogs[p1Day4] = {
    date: p1Day4,
    flow: 'light',
    moods: ['calm'],
    symptoms: ['fatigue'],
    notes: 'Haid sudah mulai berkurang banyak, menyisakan sedikit flek. Kram perut sudah hilang.',
    weight: 54.2,
    temperature: 36.5,
  };

  // Log on June 15 (Estimated Ovulation Day for previous cycle)
  const ovulationDay = format(addDays(parseISO(p1Start), 13), 'yyyy-MM-dd'); // Day 14 (June 15)
  dailyLogs[ovulationDay] = {
    date: ovulationDay,
    flow: 'none',
    moods: ['happy', 'energetic'],
    symptoms: ['breast_tenderness'],
    notes: 'Masa subur/ovulasi. Merasa sangat produktif dan berenergi tinggi hari ini! Kulit terlihat cerah.',
    weight: 53.8,
    temperature: 36.8,
  };

  // Log on June 21 (Yesterday - Luteal phase)
  const yesterday = format(subDays(baseToday, 1), 'yyyy-MM-dd');
  dailyLogs[yesterday] = {
    date: yesterday,
    flow: 'none',
    moods: ['calm', 'tired'],
    symptoms: ['bloating'],
    notes: 'Perut terasa agak kembung menjelang siklus berikutnya. Nafsu makan meningkat sedikit.',
    weight: 54.3,
    temperature: 36.7,
  };

  // Log on June 22 (Today - Luteal phase)
  const todayStr = format(baseToday, 'yyyy-MM-dd');
  dailyLogs[todayStr] = {
    date: todayStr,
    flow: 'none',
    moods: ['anxious'],
    symptoms: ['breast_tenderness', 'fatigue'],
    notes: 'Payudara terasa kencang dan sedikit ngilu. Agak cemas, istirahat cukup malam ini.',
    weight: 54.4,
    temperature: 36.7,
  };

  return { periodLogs, dailyLogs };
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      ...generateMockData(),
      settings: getInitialSettings(),

      addPeriodLog: (newLog) =>
        set((state) => {
          const logWithId: PeriodLog = {
            ...newLog,
            id: 'p-' + Date.now().toString(),
          };
          // Append and sort by startDate descending
          const updatedLogs = [...state.periodLogs, logWithId].sort(
            (a, b) => b.startDate.localeCompare(a.startDate)
          );
          return { periodLogs: updatedLogs };
        }),

      updatePeriodLog: (id, updated) =>
        set((state) => ({
          periodLogs: state.periodLogs
            .map((log) => (log.id === id ? { ...log, ...updated } : log))
            .sort((a, b) => b.startDate.localeCompare(a.startDate)),
        })),

      deletePeriodLog: (id) =>
        set((state) => ({
          periodLogs: state.periodLogs.filter((log) => log.id !== id),
        })),

      setDailyLog: (date, logUpdate) =>
        set((state) => {
          const existing = state.dailyLogs[date];
          const newLog: DailyLog = existing
            ? { ...existing, ...logUpdate }
            : {
                date,
                flow: logUpdate.flow || 'none',
                moods: logUpdate.moods || [],
                symptoms: logUpdate.symptoms || [],
                notes: logUpdate.notes || '',
                weight: logUpdate.weight,
                temperature: logUpdate.temperature,
              };

          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: newLog,
            },
          };
        }),

      deleteDailyLog: (date) =>
        set((state) => {
          const updatedLogs = { ...state.dailyLogs };
          delete updatedLogs[date];
          return { dailyLogs: updatedLogs };
        }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetToDefault: () =>
        set({
          ...generateMockData(),
          settings: getInitialSettings(),
        }),
    }),
    {
      name: 'siklus-ku-store-v1',
    }
  )
);

// Analytical Selectors for UI
export function getCycleStats(periodLogs: PeriodLog[], fallbackSettings: UserSettings): CycleStats {
  if (periodLogs.length < 2) {
    return {
      averageCycleLength: fallbackSettings.averageCycleLength,
      averagePeriodLength: fallbackSettings.averagePeriodLength,
      minCycleLength: fallbackSettings.averageCycleLength,
      maxCycleLength: fallbackSettings.averageCycleLength,
      totalLoggedCycles: periodLogs.length,
    };
  }

  // To measure cycle lengths, we sort logs ascending (oldest first)
  const sortedLogs = [...periodLogs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  
  let totalCycleDuration = 0;
  let cycleCount = 0;
  let minCycleLength = Infinity;
  let maxCycleLength = -Infinity;

  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const startCurr = parseISO(sortedLogs[i].startDate);
    const startNext = parseISO(sortedLogs[i + 1].startDate);
    const length = differenceInDays(startNext, startCurr);
    
    // Ignore unreasonable outliers (<15 days or >90 days) for average calculations
    if (length >= 15 && length <= 90) {
      totalCycleDuration += length;
      cycleCount++;
      if (length < minCycleLength) minCycleLength = length;
      if (length > maxCycleLength) maxCycleLength = length;
    }
  }

  // Measure period length
  let totalPeriodDuration = 0;
  let periodCount = 0;

  for (const log of periodLogs) {
    if (log.startDate && log.endDate) {
      const length = differenceInDays(parseISO(log.endDate), parseISO(log.startDate)) + 1;
      if (length > 0 && length <= 15) {
        totalPeriodDuration += length;
        periodCount++;
      }
    }
  }

  const avgCycle = cycleCount > 0 ? Math.round(totalCycleDuration / cycleCount) : fallbackSettings.averageCycleLength;
  const avgPeriod = periodCount > 0 ? Math.round(totalPeriodDuration / periodCount) : fallbackSettings.averagePeriodLength;

  return {
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    minCycleLength: minCycleLength === Infinity ? avgCycle : minCycleLength,
    maxCycleLength: maxCycleLength === -Infinity ? avgCycle : maxCycleLength,
    totalLoggedCycles: periodLogs.length,
  };
}
