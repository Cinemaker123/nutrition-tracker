'use client';

import { FoodEntry } from '@/lib/supabase';

interface FoodTableProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

export function FoodTable({ entries, onDelete }: FoodTableProps) {
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

  return (
    <div className="bg-white  rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800  text-white">
              <th className="px-4 py-3 text-left text-sm font-medium">Food</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Amount (g)</th>
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
              <tr key={entry.id} className="border-b border-gray-100  hover:bg-gray-50 ">
                <td className="px-4 py-3 text-sm text-black">{entry.food}</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.amount_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.kcal}</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.protein_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.carbs_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.fat_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{entry.fiber_g}g</td>
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
              <tr className="bg-gray-100  font-semibold">
                <td className="px-4 py-3 text-sm text-black" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-sm text-right text-black">{totals.kcal}</td>
                <td className="px-4 py-3 text-sm text-right text-black">{Math.round(totals.protein_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{Math.round(totals.carbs_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{Math.round(totals.fat_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-black">{Math.round(totals.fiber_g)}g</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
