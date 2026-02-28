'use client';

import { FoodEntry } from '@/lib/supabase';

const GOALS = {
  kcal: 2000,
  protein_g: 170,
  carbs_g: 160,
  fat_g: 65,
  fiber_g: 30,
};

interface MacroSummaryProps {
  entries: FoodEntry[];
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

  const macros = [
    { name: 'kcal', label: 'Calories', value: totals.kcal, goal: GOALS.kcal, color: 'bg-orange-500', textColor: 'text-orange-600', unit: '' },
    { name: 'protein_g', label: 'Protein', value: totals.protein_g, goal: GOALS.protein_g, color: 'bg-blue-500', textColor: 'text-blue-600', unit: 'g' },
    { name: 'carbs_g', label: 'Carbs', value: totals.carbs_g, goal: GOALS.carbs_g, color: 'bg-yellow-500', textColor: 'text-yellow-600', unit: 'g' },
    { name: 'fat_g', label: 'Fat', value: totals.fat_g, goal: GOALS.fat_g, color: 'bg-red-500', textColor: 'text-red-600', unit: 'g' },
    { name: 'fiber_g', label: 'Fiber', value: totals.fiber_g, goal: GOALS.fiber_g, color: 'bg-green-500', textColor: 'text-green-600', unit: 'g' },
  ];

  return (
    <div className="mb-6">
      {/* Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {macros.map((macro) => (
          <div key={macro.name} className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${macro.textColor}`}>
              {Math.round(macro.value)}{macro.unit}
            </div>
            <div className="text-xs text-black mt-1">{macro.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4 text-black">Progress vs. Goal</h3>
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
                  <span className="text-black">{macro.label}</span>
                  <span className="text-black">
                    {Math.round(macro.value)} / {macro.goal}{macro.unit}
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
                  {isOver ? `${Math.abs(remaining).toFixed(0)}${macro.unit} over target` :
                   isWarn ? `${remaining.toFixed(0)}${macro.unit} remaining - getting close!` :
                   `${remaining.toFixed(0)}${macro.unit} remaining`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
