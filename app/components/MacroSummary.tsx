'use client';

import { FoodEntry } from '@/lib/supabase';

const GOALS = {
  calories: 2000,
  protein: 170,
  carbs: 160,
  fat: 65,
  fiber: 30,
};

interface MacroSummaryProps {
  entries: FoodEntry[];
}

export function MacroSummary({ entries }: MacroSummaryProps) {
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: acc.fiber + entry.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const macros = [
    { name: 'kcal', label: 'Calories', value: totals.calories, goal: GOALS.calories, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { name: 'protein', label: 'Protein', value: totals.protein, goal: GOALS.protein, color: 'bg-blue-500', textColor: 'text-blue-600', unit: 'g' },
    { name: 'carbs', label: 'Carbs', value: totals.carbs, goal: GOALS.carbs, color: 'bg-yellow-500', textColor: 'text-yellow-600', unit: 'g' },
    { name: 'fat', label: 'Fat', value: totals.fat, goal: GOALS.fat, color: 'bg-red-500', textColor: 'text-red-600', unit: 'g' },
    { name: 'fiber', label: 'Fiber', value: totals.fiber, goal: GOALS.fiber, color: 'bg-green-500', textColor: 'text-green-600', unit: 'g' },
  ];

  return (
    <div className="mb-6">
      {/* Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {macros.map((macro) => (
          <div key={macro.name} className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${macro.textColor}`}>
              {Math.round(macro.value)}{macro.unit || ''}
            </div>
            <div className="text-xs text-gray-500 mt-1">{macro.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Progress vs. Goal</h3>
        <div className="space-y-4">
          {macros.map((macro) => {
            const percentage = Math.min((macro.value / macro.goal) * 100, 100);
            const remaining = macro.goal - macro.value;
            const isOver = remaining < 0;
            const isWarn = remaining > 0 && remaining < macro.goal * 0.2;
            const isOk = remaining >= macro.goal * 0.2;

            return (
              <div key={macro.name}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{macro.label}</span>
                  <span>
                    {Math.round(macro.value)} / {macro.goal}{macro.unit || ''}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${macro.color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${
                  isOver ? 'text-red-600 font-semibold' :
                  isWarn ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {isOver ? `${Math.abs(remaining).toFixed(0)}${macro.unit || ''} over target` :
                   isWarn ? `${remaining.toFixed(0)}${macro.unit || ''} remaining - getting close!` :
                   `${remaining.toFixed(0)}${macro.unit || ''} remaining`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
