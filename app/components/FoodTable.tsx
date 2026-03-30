'use client';

import { FoodEntry } from '@/lib/supabase';
import { AlertTriangle, X } from 'lucide-react';

interface FoodTableProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
  analysisError?: string;
  onError?: (details: string) => void;
}

export function FoodTable({ entries, onDelete, analysisError, onError }: FoodTableProps) {
  // Use monospace font for table
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
    <div className="rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Error Popup */}
      {analysisError && (
        <div className="bg-[var(--card-bg)] border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[var(--foreground)] font-medium text-sm">
                Failed to analyze food
              </p>
              <pre className="text-[var(--muted)] text-xs mt-2 font-mono whitespace-pre-wrap break-words bg-[var(--card-bg-alt)] p-2 rounded overflow-x-auto">
                {analysisError}
              </pre>
            </div>
            {onError && (
              <button
                onClick={() => onError('')}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto bg-[var(--card-bg)]">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-[#2c2c2c] text-white">
              <th className="px-4 py-3 text-left text-sm font-medium">Food</th>
              <th className="px-4 py-3 text-right text-sm font-medium">g</th>
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
              <tr key={entry.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)]">
                <td className="px-4 py-3 text-sm text-[var(--foreground)]">{entry.food}</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.amount_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.kcal}</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.protein_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.carbs_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.fat_g}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{entry.fiber_g}g</td>
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
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--foreground)]">
                  No entries yet. Add your first meal above!
                </td>
              </tr>
            )}
            {entries.length > 0 && (
              <tr className="bg-[var(--card-bg-alt)] font-semibold">
                <td className="px-4 py-3 text-sm text-[var(--foreground)]" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{totals.kcal}</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{Math.round(totals.protein_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{Math.round(totals.carbs_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{Math.round(totals.fat_g)}g</td>
                <td className="px-4 py-3 text-sm text-right text-[var(--foreground)]">{Math.round(totals.fiber_g)}g</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
