'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RecipeSuggestion } from '@/types';
import { useDeleteWithConfirm } from '@/hooks/useDeleteWithConfirm';
import { formatDate, getToday, getYesterday } from '@/lib/dates';

interface RecipesTabProps {
  initialEndDate?: string;
}

export function RecipesTab({ initialEndDate }: RecipesTabProps) {
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [endDate, setEndDate] = useState(initialEndDate || getToday());

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const password = localStorage.getItem('app_password');

    try {
      const response = await fetch(`/api/recipes?endDate=${endDate}`, {
        headers: { 'x-password': password || '' },
      });

      if (response.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load recipes');
      }

      const data = await response.json();
      setRecipes(data.suggestions || []);
    } catch (err) {
      setError('Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  }, [endDate]);

  // Auto-load on mount
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleDeleteRecipe = useCallback(async (index: number) => {
    // Since recipes are not persisted to DB (generated fresh each time),
    // we just remove from local state
    setRecipes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const { handleDeleteClick, getDeleteState, resetClicks } = useDeleteWithConfirm({
    onDelete: async (indexStr: string) => {
      const index = parseInt(indexStr, 10);
      await handleDeleteRecipe(index);
    },
  });

  // Get macro color
  const getMacroColor = (macro: string) => {
    switch (macro.toLowerCase()) {
      case 'protein':
        return 'text-[#3a8fd1]';
      case 'carbs':
      case 'carbohydrates':
        return 'text-[#d4a017]';
      case 'fat':
      case 'fats':
        return 'text-[#c0392b]';
      case 'fiber':
        return 'text-[#27ae60]';
      case 'calories':
      case 'kcal':
        return 'text-[#e07b39]';
      default:
        return 'text-[var(--foreground)]';
    }
  };

  const yesterday = formatDate(getYesterday(endDate));
  const today = formatDate(endDate);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a8fd1] mx-auto"></div>
        <p className="text-[var(--muted)] mt-4">Generating recipe suggestions...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
            Recipe Suggestions
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Based on {yesterday} - {today}
          </p>
        </div>
        <button
          onClick={loadRecipes}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded hover:bg-[var(--hover-bg)] disabled:opacity-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      {/* Recipe List */}
      <div className="space-y-4">
        {recipes.length === 0 ? (
          <p className="text-[var(--muted)] text-sm italic text-center py-8">
            No recipe suggestions available.
          </p>
        ) : (
          recipes.map((recipe, index) => {
            const deleteState = getDeleteState(index.toString());
            return (
              <div
                key={index}
                className="p-4 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-[var(--foreground)]">
                        {recipe.name}
                      </h4>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded bg-[var(--card-bg-alt)] ${getMacroColor(
                          recipe.primary_macro
                        )}`}
                      >
                        {recipe.primary_macro}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(index.toString())}
                    className={`p-1.5 rounded transition-colors ml-2 ${deleteState.colorClass}`}
                    title={deleteState.title}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
