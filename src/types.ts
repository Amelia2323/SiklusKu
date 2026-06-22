/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PeriodLog {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD (null means currently ongoing)
  flowRating?: 'light' | 'medium' | 'heavy'; // Initial or dominant flow rating
}

export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy';

export type MoodType =
  | 'happy'       // Senang
  | 'calm'        // Tenang
  | 'energetic'   // Berenergi
  | 'tired'       // Lelah
  | 'sad'         // Sedih
  | 'irritable'   // Sensitif / Mudah Marah
  | 'anxious'     // Cemas
  | 'crampy';     // Kram (Mood state)

export type SymptomType =
  | 'cramps'            // Kram Perut
  | 'headache'          // Sakit Kepala
  | 'bloating'          // Perut Kembung
  | 'breast_tenderness' // Payudara Sensitif
  | 'backache'          // Sakit Punggung
  | 'acne'              // Jerawat
  | 'nausea'            // Mual
  | 'insomnia'          // Sulit Tidur
  | 'fatigue';          // Kelelahan Luar Biasa

export interface DailyLog {
  date: string; // YYYY-MM-DD (acts as unique identifier for daily logs)
  flow: FlowLevel;
  moods: MoodType[];
  symptoms: SymptomType[];
  notes: string;
  weight?: number; // in kg
  temperature?: number; // in °C
}

export interface UserSettings {
  averageCycleLength: number; // Durasi siklus rata-rata (default 28 hari)
  averagePeriodLength: number; // Durasi haid rata-rata (default 5 hari)
  name: string; // Nama pengguna untuk menyapa secara personal
}

export interface CycleStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  totalLoggedCycles: number;
}

export type PhaseType = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'fertile';
