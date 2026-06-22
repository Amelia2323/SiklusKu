/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTrackerStore } from '../store';
import { getDayStatus } from '../utils/cycleCalculator';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkle } from 'lucide-react';

interface MenstrualCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const ID_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function MenstrualCalendar({ selectedDate, onSelectDate }: MenstrualCalendarProps) {
  const { periodLogs, settings, dailyLogs } = useTrackerStore();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date('2026-06-01')); // Lock default to simulated June 2026 for consistent entry point, but support changing!

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar dates generation
  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startWeekday = getDay(firstDay); // 0 = Sunday, 1 = Monday, etc.

  // Padding cells before the first day of the month
  const padCells = Array.from({ length: startWeekday }, (_, i) => null);

  // Combine empty cells and date days
  const gridCells = [...padCells, ...daysInMonth];

  return (
    <div id="cycle-calendar-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 flex flex-col h-full justify-between">
      <div>
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-stone-800">
              Kalender Siklus
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Ketuk tanggal untuk mencatat atau melihat gejala
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-2xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white hover:shadow-xs transition text-stone-500 cursor-pointer"
              title="Filter Bulan Sebelum"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-stone-700 min-w-[100px] text-center">
              {ID_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white hover:shadow-xs transition text-stone-500 cursor-pointer"
              title="Filter Bulan Sesudah"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-y-2 mb-2 text-center">
          {ID_DAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-xs font-semibold uppercase tracking-wider py-1 ${
                idx === 0 ? 'text-red-400/80' : 'text-stone-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {gridCells.map((cell, idx) => {
            if (cell === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const cellDateStr = format(cell, 'yyyy-MM-dd');
            const isSelected = isSameDay(cell, selectedDate);
            const status = getDayStatus(cell, periodLogs, settings);
            const hasNotesOrLogs = !!dailyLogs[cellDateStr];

            // Render classes based on status
            let cellBg = 'hover:bg-stone-50 text-stone-700';
            let dotColor = null;
            let borderStyle = '';
            let isOvulationPulse = false;

            if (status.isLoggedPeriod) {
              cellBg = 'bg-brand-500 text-white font-semibold hover:bg-brand-600 shadow-sm shadow-brand-100';
            } else if (status.isPredictedPeriod) {
              cellBg = 'bg-brand-50/70 text-brand-600 font-medium hover:bg-brand-100';
              borderStyle = 'border-2 border-dashed border-brand-300';
            } else if (status.isOvulation) {
              cellBg = 'bg-emerald-600 text-white font-semibold hover:bg-emerald-700 relative';
              isOvulationPulse = true;
            } else if (status.isFertile) {
              cellBg = 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium';
              dotColor = 'bg-emerald-400';
            }

            // Adjust border for current day (today)
            const isToday = isSameDay(cell, new Date());

            return (
              <button
                key={cellDateStr}
                onClick={() => onSelectDate(cell)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer group transition-all duration-200 text-sm ${cellBg} ${borderStyle} ${
                  isSelected ? 'ring-2 ring-stone-850 ring-offset-2 scale-105 z-10' : ''
                } ${isToday && !isSelected ? 'border border-zinc-700' : ''}`}
              >
                {/* Daily log tiny indicator */}
                {hasNotesOrLogs && !status.isLoggedPeriod && !status.isOvulation && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                )}

                {/* Day number */}
                <span>{cell.getDate()}</span>

                {/* Ovulation peak icon indicator */}
                {status.isOvulation && (
                  <Sparkle className="w-2.5 h-2.5 text-white absolute bottom-1" />
                )}

                {/* Fertile dot marker */}
                {dotColor && !isSelected && (
                  <span className={`w-1 h-1 rounded-full ${dotColor} absolute bottom-1`}></span>
                )}

                {/* Tooltip for hover details */}
                <div className="absolute bottom-full mb-1 bg-zinc-900 text-white text-[10px] py-1 px-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-30 shadow-md">
                  {status.isLoggedPeriod && 'Haid Tercatat'}
                  {status.isPredictedPeriod && 'Prediksi Haid'}
                  {status.isOvulation && 'Hari Puncak Ovulasi'}
                  {status.isFertile && !status.isOvulation && 'Masa Subur'}
                  {!status.isPeriod && !status.isFertile && 'Hari Biasa'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend Map */}
      <div className="mt-6 pt-5 border-t border-stone-100/80">
        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
          Legenda & Informasi
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-brand-500 shadow-xs"></span>
            <span>Haid Tercatat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-brand-50/70 border-2 border-dashed border-brand-300"></span>
            <span>Prediksi Haid</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Sparkle className="w-1.5 h-1.5 text-white" />
            </span>
            <span>Puncak Ovulasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-lg bg-emerald-50 border border-emerald-200"></span>
            <span>Masa Subur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
