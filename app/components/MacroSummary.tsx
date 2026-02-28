'use client';

import { FoodEntry } from '@/lib/supabase';

const GOALS = {
  kcal: 2000,
  protein_g: 170,
  carbs_g: 160,
  fat_g: 65,
  fiber_g: 30,
};

// Exact colors from macros_today.html
const MACROS = {
  kcal: { label: 'Calories', emoji: '🔥', bar: '#e07b39', text: '#e07b39' },
  protein_g: { label: 'Protein', emoji: '💪', bar: '#3a8fd1', text: '#3a8fd1' },
  carbs_g: { label: 'Carbs', emoji: '🍞', bar: '#d4a017', text: '#d4a017' },
  fat_g: { label: 'Fat', emoji: '🫒', bar: '#c0392b', text: '#c0392b' },
  fiber_g: { label: 'Fiber', emoji: '🌾', bar: '#27ae60', text: '#27ae60' },
};

interface MacroSummaryProps {
  entries: FoodEntry[];
}

function getSmartMessage(
  name: string,
  value: number,
  goal: number,
  percentage: number,
  hour: number
): { text: string; status: 'ok' | 'warn' | 'over' } {
  const remaining = goal - value;
  
  // Over target
  if (remaining < 0) {
    if (name === 'kcal') return { text: `❌ ${Math.abs(remaining)} over target — maintenance calories hit`, status: 'over' };
    return { text: `❌ ${Math.abs(remaining)}g over target`, status: 'over' };
  }
  
  // Protein - special handling for cuts
  if (name === 'protein_g') {
    if (percentage < 50 && hour >= 12) {
      return { text: `⚠️ ${remaining}g still needed — prioritize protein in remaining meals`, status: 'warn' };
    }
    if (percentage < 30) {
      return { text: `⚠️ Muscle loss risk — prioritize protein!`, status: 'warn' };
    }
    return { text: `${remaining}g remaining`, status: 'ok' };
  }
  
  // Calories - time-based
  if (name === 'kcal') {
    if (percentage < 50 && hour >= 18) {
      return { text: `⚠️ You're under-fueled for the day — don't skip meals to cut`, status: 'warn' };
    }
    return { text: `${remaining} kcal remaining`, status: 'ok' };
  }
  
  // Carbs - warn if way over
  if (name === 'carbs_g' && percentage > 100) {
    return { text: `❌ ${Math.abs(remaining)}g over target`, status: 'over' };
  }
  
  // Default
  if (percentage > 80) {
    return { text: `${remaining}g remaining — getting close`, status: 'warn' };
  }
  return { text: `${remaining}g remaining`, status: 'ok' };
}

export function MacroSummary({ entries }: MacroSummaryProps) {
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

  return (
    <div className="mb-6">
      {/* Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {macrosList.map(({ name, value }) => {
          const config = MACROS[name];
          const unit = name === 'kcal' ? '' : 'g';
          return (
            <div key={name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: config.text }}>
                {Math.round(value)}{unit}
              </div>
              <div className="text-xs text-black dark:text-white mt-1">
                {config.emoji} {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">📊 Progress vs. Goal</h3>
        <div className="space-y-4">
          {macrosList.map(({ name, value, goal }) => {
            const config = MACROS[name];
            const percentage = Math.min((value / goal) * 100, 100);
            const message = getSmartMessage(name, value, goal, (value / goal) * 100, currentHour);
            const unit = name === 'kcal' ? '' : 'g';

            return (
              <div key={name}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-black dark:text-white">
                    {config.emoji} {config.label}
                  </span>
                  <span className="text-black dark:text-white">
                    {Math.round(value)} / {goal}{unit}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${percentage}%`, backgroundColor: config.bar }}
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
      </div>
    </div>
  );
}
