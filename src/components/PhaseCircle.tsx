/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTrackerStore, getCycleStats } from '../store';
import { getPhaseInfo, getLatestPeriodLog } from '../utils/cycleCalculator';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { Droplet, Heart, Sparkles, Sprout, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function PhaseCircle() {
  const { periodLogs, settings, addPeriodLog, updatePeriodLog } = useTrackerStore();
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Calculate general stats
  const stats = getCycleStats(periodLogs, settings);
  const cycleLength = stats.averageCycleLength;
  
  const latestLog = getLatestPeriodLog(periodLogs);
  const phaseInfo = getPhaseInfo(today, periodLogs, settings);

  // Calculate current cycle day
  let currentCycleDay = 1;
  let isPeriodOngoing = false;

  if (latestLog) {
    const start = parseISO(latestLog.startDate);
    const daysSince = differenceInDays(today, start);
    
    if (daysSince >= 0 && daysSince < cycleLength) {
      currentCycleDay = daysSince + 1;
    } else if (daysSince >= cycleLength) {
      currentCycleDay = (daysSince % cycleLength) + 1;
    } else {
      // In case latest log is set to future date
      currentCycleDay = 1;
    }

    if (!latestLog.endDate) {
      isPeriodOngoing = true;
    }
  }

  // Calculate days until next expected period
  let nextPeriodCountdown = 0;
  if (latestLog) {
    const lastStart = parseISO(latestLog.startDate);
    const nextExpectedStart = addDays(lastStart, cycleLength);
    nextPeriodCountdown = differenceInDays(nextExpectedStart, today);
    if (nextPeriodCountdown < 0) {
      // If overdue, calculate next upcoming
      const cyclesOverdue = Math.ceil(Math.abs(nextPeriodCountdown) / cycleLength);
      const nextUpcoming = addDays(nextExpectedStart, cyclesOverdue * cycleLength);
      nextPeriodCountdown = differenceInDays(nextUpcoming, today);
    }
  } else {
    // default cycle setting
    nextPeriodCountdown = cycleLength;
  }

  // Handler for Start/Stop period quick button
  const handleQuickPeriodToggle = () => {
    if (isPeriodOngoing && latestLog) {
      // End the ongoing period today
      updatePeriodLog(latestLog.id, { endDate: todayStr });
    } else {
      // Start a new period log starting today
      addPeriodLog({
        startDate: todayStr,
        endDate: null,
        flowRating: 'medium'
      });
    }
  };

  // Determine Icon for active phase
  const getPhaseIcon = () => {
    switch (phaseInfo.phase) {
      case 'menstrual':
        return <Droplet className="w-8 h-8 text-brand-500 animate-pulse" />;
      case 'fertile':
      case 'ovulation':
        return <Sprout className="w-8 h-8 text-emerald-500" />;
      case 'luteal':
        return <Sparkles className="w-8 h-8 text-amber-500" />;
      default:
        return <Heart className="w-8 h-8 text-sky-500" />;
    }
  };

  // Determine styling color details for glowing ring
  const getGlowStyles = () => {
    switch (phaseInfo.phase) {
      case 'menstrual':
        return 'border-brand-500 shadow-[0_0_20px_rgba(244,63,104,0.15)] ring-brand-100';
      case 'fertile':
      case 'ovulation':
        return 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-emerald-100';
      case 'luteal':
        return 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-amber-100';
      default:
        return 'border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-sky-100';
    }
  };

  // Percent calculation through cycle
  const currentPercent = (currentCycleDay / cycleLength) * 100;
  const strokeDashoffset = 502 - (502 * currentPercent) / 100; // SVG circle perimeter is 502

  return (
    <div id="phase-circle-card" className="bg-white rounded-3xl p-6 shadow-xs border border-stone-100 flex flex-col items-center justify-between min-h-[460px]">
      <div className="text-center w-full">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
          Status Hari Ini
        </span>
        <h3 className="font-serif text-2xl text-stone-800 mt-2.5">
          Siklus {settings.name}
        </h3>
      </div>

      {/* Glow Circle Dashboard */}
      <div className="relative my-6 flex items-center justify-center w-64 h-64">
        {/* Underlay SVG Ring & Progress Circle */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="80"
            className="stroke-stone-50"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="80"
            className={`${
              phaseInfo.phase === 'menstrual'
                ? 'stroke-brand-500'
                : phaseInfo.phase === 'fertile' || phaseInfo.phase === 'ovulation'
                ? 'stroke-emerald-500'
                : phaseInfo.phase === 'luteal'
                ? 'stroke-amber-500'
                : 'stroke-sky-500'
            }`}
            strokeWidth="10"
            strokeDasharray="502"
            initial={{ strokeDashoffset: 502 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text Container */}
        <div id="inner-dial" className={`w-[146px] h-[146px] rounded-full bg-white border-2 ${getGlowStyles()} ring-8 flex flex-col justify-center items-center text-center p-4 z-10 transition-all duration-500`}>
          <div className="mb-1">{getPhaseIcon()}</div>
          <div className="text-3xl font-bold tracking-tight text-stone-800">
            Hari {currentCycleDay}
          </div>
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mt-0.5">
            dari {cycleLength} Hari
          </div>
        </div>
      </div>

      {/* Info Stats Footer inside card */}
      <div className="w-full text-center space-y-4">
        <div>
          <div className="text-sm font-medium tracking-wide text-zinc-800">
            {phaseInfo.label}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto mt-1">
            {phaseInfo.description}
          </p>
        </div>

        {/* Highlight counter */}
        <div className="bg-stone-50 rounded-2xl py-3 px-4 border border-stone-100/80 flex justify-around items-center">
          <div className="text-left">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Haid Berikutnya
            </div>
            <div className="text-sm font-bold text-stone-700 mt-0.5">
              {nextPeriodCountdown === 0 ? (
                <span className="text-brand-500 animate-pulse font-extrabold">Hari Ini!</span>
              ) : (
                <span>{nextPeriodCountdown} Hari lagi</span>
              )}
            </div>
          </div>
          <div className="h-6 w-px bg-stone-200"></div>
          <div className="text-left">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              Status Haid
            </div>
            <div className="text-sm font-bold text-stone-700 mt-0.5">
              {isPeriodOngoing ? (
                <span className="text-brand-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                  Berlangsung
                </span>
              ) : (
                <span className="text-stone-400">Tidak Haid</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Toggle Button */}
        <button
          id="quick-period-action-btn"
          onClick={handleQuickPeriodToggle}
          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            isPeriodOngoing
              ? 'bg-zinc-800 hover:bg-zinc-900 text-white hover:shadow-md'
              : 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-brand-100 hover:shadow-md'
          }`}
        >
          {isPeriodOngoing ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Selesaikan Haid Hari Ini
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4" />
              Mulai Catat Haid Hari Ini
            </>
          )}
        </button>
      </div>
    </div>
  );
}
