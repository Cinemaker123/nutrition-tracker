'use client';

import { FoodEntry } from '@/lib/supabase';

interface FoodTableProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

export function FoodTable({ entries, onDelete }: FoodTableProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-3 text-left text-sm font-medium">Food</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
              <th className="px-4 py-3 text-right text-sm font-medium">kcal</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Protein</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Carbs</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Fat</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Fiber</th>
              <th className="px-4 py-3 text-center text-sm font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{entry.food_name}</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.amount}</td>
                <td className="px-4 py-3 text-sm text-right">{entry.calories}</td>
                <td className="px-4 py-3 text-sm text-right">{entry.protein}g</td>
                <td className="px-4 py-3 text-sm text-right">{entry.carbs}g</td>
                <td className="px-4 py-3 text-sm text-right">{entry.fat}g</td>
                <td className="px-4 py-3 text-sm text-right">{entry.fiber}g</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-black">
                  No entries yet. Add your first meal above!
                </td>
              </tr>
            )}
            {entries.length > 0 && (
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-sm text-right">{totals.calories}</td>
                <td className="px-4 py-3 text-sm text-right">{totals.protein.toFixed(1)}g</td>
                <td className="px-4 py-3 text-sm text-right">{totals.carbs.toFixed(1)}g</td>
                <td className="px-4 py-3 text-sm text-right">{totals.fat.toFixed(1)}g</td>
                <td className="px-4 py-3 text-sm text-right">{totals.fiber.toFixed(1)}g</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
