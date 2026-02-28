'use client';

import { useState } from 'react';
import { FoodEntry } from '@/lib/supabase';

const GOALS = {
  kcal: 2000,
  protein_g: 170,
  carbs_g: 160,
  fat_g: 65,
  fiber_g: 30,
};

// Colors using CSS variables for dark mode compatibility
const MACROS = {
  kcal: { label: 'kcal', emoji: '🔥', cssVar: '--kcal' },
  protein_g: { label: 'Protein', emoji: '💪', cssVar: '--prot' },
  carbs_g: { label: 'Carbs', emoji: '🍞', cssVar: '--carb' },
  fat_g: { label: 'Fat', emoji: '🫒', cssVar: '--fat' },
  fiber_g: { label: 'Fiber', emoji: '🌾', cssVar: '--fiber' },
};

interface MacroSummaryProps {
  entries: FoodEntry[];
}

function getSmartMessage(
  name: string,
  value: number,
  goal: number,
  percentage: number,
  hour: number,
  hasEntries: boolean
): { text: string; status: 'ok' | 'warn' | 'over' } {
  const remaining = goal - value;
  
  // Over target
  if (remaining < 0) {
    if (name === 'kcal') return { text: `❌ ${Math.round(Math.abs(remaining))} over target`, status: 'over' };
    if (name === 'fiber_g') return { text: `${Math.round(Math.abs(remaining))}g over target`, status: 'ok' }; // No warning for fiber over
    return { text: `❌ ${Math.round(Math.abs(remaining))}g over target`, status: 'over' };
  }
  
  // Protein - special handling for cuts (only if there are entries)
  if (name === 'protein_g' && hasEntries) {
    if (percentage < 50 && hour >= 16) { // After 4pm
      return { text: `⚠️ ${Math.round(remaining)}g still needed — prioritize protein in remaining meals`, status: 'warn' };
    }
    if (percentage < 30) {
      return { text: `⚠️ Muscle loss risk — prioritize protein!`, status: 'warn' };
    }
  }
  
  // Calories - time-based (10pm, only if there are entries)
  if (name === 'kcal' && hasEntries) {
    if (percentage < 50 && hour >= 22) { // 10pm
      return { text: `⚠️ You're under-fueled for the day — don't skip meals to cut`, status: 'warn' };
    }
  }
  
  // Default - show remaining
  const unit = name === 'kcal' ? ' kcal' : 'g';
  return { text: `${Math.round(remaining)}${unit} remaining`, status: 'ok' };
}

export function MacroSummary({ entries }: MacroSummaryProps) {
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  
  const dismissTip = (key: string) => {
    setDismissedTips(prev => new Set([...prev, key]));
  };

  const totals = entries.reduce(
    (acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      protein_g: acc.protein_g + entry.protein_g,
      carbs_g: acc.carbs_g + entry.carbs_g,
      fat_g: acc.fat_g + entry.fat_g,
      fiber_g: acc.fiber_g + entry.fiber_g,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );

  const currentHour = new Date().getHours();

  const macrosList = [
    { name: 'kcal' as const, value: totals.kcal, goal: GOALS.kcal },
    { name: 'protein_g' as const, value: totals.protein_g, goal: GOALS.protein_g },
    { name: 'carbs_g' as const, value: totals.carbs_g, goal: GOALS.carbs_g },
    { name: 'fat_g' as const, value: totals.fat_g, goal: GOALS.fat_g },
    { name: 'fiber_g' as const, value: totals.fiber_g, goal: GOALS.fiber_g },
  ];

  // Calculate percentages for tradeoff tips
  const proteinPct = (totals.protein_g / GOALS.protein_g) * 100;
  const carbsPct = (totals.carbs_g / GOALS.carbs_g) * 100;
  const fatPct = (totals.fat_g / GOALS.fat_g) * 100;

  return (
    <div className="mb-6">
      {/* Cards - Responsive: 5 cols on desktop, 2-2-1 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {macrosList.map(({ name, value }, index) => {
          const config = MACROS[name];
          const unit = name === 'kcal' ? '' : 'g';
          const isLast = index === macrosList.length - 1;
          return (
            <div 
              key={name} 
              className={`bg-white rounded-lg shadow-sm p-4 text-center ${isLast ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <div 
                className="text-2xl font-bold font-syne" 
                style={{ color: `var(${config.cssVar})` }}
              >
                {Math.round(value)}{unit}
              </div>
              <div className="text-xs text-black mt-1">
                {config.emoji} {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bars */}
      <div className="bg-white  rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4 text-black">📊 Progress vs. Goal</h3>
        <div className="space-y-4">
          {macrosList.map(({ name, value, goal }) => {
            const config = MACROS[name];
            const percentage = Math.min((value / goal) * 100, 100);
            const message = getSmartMessage(name, value, goal, (value / goal) * 100, currentHour, entries.length > 0);
            const unit = name === 'kcal' ? '' : 'g';

            return (
              <div key={name}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-black">
                    {config.emoji} {config.label}
                  </span>
                  <span className="text-black">
                    {Math.round(value)} / {goal}{unit}
                  </span>
                </div>
                <div className="h-3 bg-gray-200  rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${percentage}%`, backgroundColor: `var(${config.cssVar})` }}
                  />
                </div>
                <div className={`text-xs mt-1 font-medium ${
                  message.status === 'over' ? 'text-red-600' :
                  message.status === 'warn' ? 'text-orange-500' :
                  'text-green-600'
                }`}>
                  {message.text}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Tradeoff Tips */}
        {(() => {
          const tips = [];
          
          // Carb/Fat Tradeoffs
          if (carbsPct > 120 && fatPct < 70 && !dismissedTips.has('carb-fat')) {
            tips.push(
              <div key="carb-fat" className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-2">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex-1 leading-5">
                  💡 <strong>Tip:</strong> Carbs high but fat low — consider swapping some carbs for fat tomorrow. Fat keeps you fuller longer on a cut.
                </p>
                <button 
                  onClick={() => dismissTip('carb-fat')}
                  className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 text-lg flex-shrink-0 h-5 flex items-center justify-center"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            );
          }
          
          if (fatPct > 120 && carbsPct < 70 && !dismissedTips.has('fat-carb')) {
            tips.push(
              <div key="fat-carb" className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex-1 leading-5">
                  ⚡ <strong>Tip:</strong> Fat high but carbs low — try more carbs, less fat for better training energy tomorrow.
                </p>
                <button 
                  onClick={() => dismissTip('fat-carb')}
                  className="text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300 text-lg flex-shrink-0 h-5 flex items-center justify-center"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            );
          }
          
          // Protein vs Carbs tradeoff
          if (proteinPct < 60 && carbsPct > 100 && !dismissedTips.has('protein-carbs')) {
            tips.push(
              <div key="protein-carbs" className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
                <p className="text-sm text-red-700 dark:text-red-300 flex-1 leading-5">
                  🥩 <strong>Priority:</strong> Protein low but carbs high — swap some carb calories for protein to protect muscle while cutting.
                </p>
                <button 
                  onClick={() => dismissTip('protein-carbs')}
                  className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 text-lg flex-shrink-0 h-5 flex items-center justify-center"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            );
          }
          
          // Protein vs Fat tradeoff  
          if (proteinPct < 60 && fatPct > 100 && !dismissedTips.has('protein-fat')) {
            tips.push(
              <div key="protein-fat" className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 flex items-start gap-2">
                <p className="text-sm text-orange-700 dark:text-orange-300 flex-1 leading-5">
                  🍗 <strong>Priority:</strong> Protein low but fat high — reduce fat sources and add lean protein to hit your protein goal.
                </p>
                <button 
                  onClick={() => dismissTip('protein-fat')}
                  className="text-orange-400 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-300 text-lg flex-shrink-0 h-5 flex items-center justify-center"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            );
          }
          
          // Protein success tip
          if (proteinPct >= 90 && (carbsPct < 80 || fatPct < 80) && !dismissedTips.has('protein-good')) {
            tips.push(
              <div key="protein-good" className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-2">
                <p className="text-sm text-green-700 dark:text-green-300 flex-1 leading-5">
                  ✅ <strong>Well done!</strong> Protein on track — you can adjust carbs/fat tomorrow based on energy needs.
                </p>
                <button 
                  onClick={() => dismissTip('protein-good')}
                  className="text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300 text-lg flex-shrink-0 h-5 flex items-center justify-center"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            );
          }
          
          if (tips.length === 0) return null;
          return <div className="mt-4 space-y-2">{tips}</div>;
        })()}
      </div>
    </div>
  );
}
