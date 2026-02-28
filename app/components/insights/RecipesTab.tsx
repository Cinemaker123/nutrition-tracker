'use client';

import { useState, useCallback } from 'react';
import type { RecipeSuggestion } from '@/types';
import { useDeleteWithConfirm } from '@/hooks/useDeleteWithConfirm';
import { formatDate, getToday, getYesterday } from '@/lib/dates';

interface ArchivedRecipe {
  id: string;
  created_at: string;
  date_range: string;
  suggestions: RecipeSuggestion[];
  based_on_dates: string[];
}

interface RecipesTabProps {
  initialEndDate?: string;
}

export function RecipesTab({ initialEndDate }: RecipesTabProps) {
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [endDate] = useState(initialEndDate || getToday());
  const [isSaving, setIsSaving] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedRecipes, setArchivedRecipes] = useState<ArchivedRecipe[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setShowArchive(false);

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
      setHasGenerated(true);
    } catch (err) {
      setError('Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  }, [endDate]);

  const handleSaveToArchive = async () => {
    if (!recipes.length) return;

    setIsSaving(true);
    const password = localStorage.getItem('app_password');
    const yesterday = getYesterday(endDate);
    const dateRange = `${formatDate(yesterday)} - ${formatDate(endDate)}`;

    try {
      const response = await fetch('/api/recipes/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-password': password || '',
        },
        body: JSON.stringify({
          date_range: dateRange,
          suggestions: recipes,
          based_on_dates: [yesterday, endDate],
        }),
      });

      if (response.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      // Clear current recipes after saving
      setRecipes([]);
      setHasGenerated(false);
    } catch (err) {
      setError('Failed to save recipes');
    } finally {
      setIsSaving(false);
    }
  };

  const loadArchive = async () => {
    if (showArchive) {
      setShowArchive(false);
      return;
    }

    setIsLoadingArchive(true);
    setError('');
    const password = localStorage.getItem('app_password');

    try {
      const response = await fetch('/api/recipes/archive', {
        headers: { 'x-password': password || '' },
      });

      if (response.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load archive');
      }

      const data = await response.json();
      setArchivedRecipes(data.recipes || []);
      setShowArchive(true);
    } catch (err) {
      setError('Failed to load archive');
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleDeleteRecipe = useCallback(async (index: number) => {
    setRecipes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDeleteArchivedRecipe = useCallback(async (id: string) => {
    const password = localStorage.getItem('app_password');

    const response = await fetch(`/api/recipes/archive/${id}`, {
      method: 'DELETE',
      headers: { 'x-password': password || '' },
    });

    if (response.status === 401) {
      setError('Invalid password');
      throw new Error('Invalid password');
    }

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    // Remove from local state
    setArchivedRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const { handleDeleteClick, getDeleteState } = useDeleteWithConfirm({
    onDelete: async (indexStr: string) => {
      const index = parseInt(indexStr, 10);
      await handleDeleteRecipe(index);
    },
  });

  const {
    handleDeleteClick: handleArchiveDeleteClick,
    getDeleteState: getArchiveDeleteState,
  } = useDeleteWithConfirm({
    onDelete: handleDeleteArchivedRecipe,
  });

  // Copy recipe to clipboard
  const [copiedRecipe, setCopiedRecipe] = useState<string | null>(null);
  
  const handleCopyRecipe = async (recipe: RecipeSuggestion) => {
    const text = `${recipe.name} (${recipe.primary_macro})\n${recipe.description}`;
    const recipeKey = `${recipe.name}-${recipe.description}`;
    
    // Check if Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedRecipe(recipeKey);
        setTimeout(() => setCopiedRecipe(null), 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
        fallbackCopy(text, recipeKey);
      }
    } else {
      // Fallback for mobile browsers without Clipboard API
      fallbackCopy(text, recipeKey);
    }
  };
  
  const fallbackCopy = (text: string, recipeKey: string) => {
    // Create temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    
    try {
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        setCopiedRecipe(recipeKey);
        setTimeout(() => setCopiedRecipe(null), 1500);
      }
    } catch (err) {
      document.body.removeChild(textarea);
      console.error('Fallback copy failed:', err);
    }
  };

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

  // Show archive
  if (showArchive) {
    return (
      <div>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowArchive(false)}
            className="analyze-btn w-full h-[46px] bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            Back to Recipes
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
            Archived Recipes
          </h3>
          {archivedRecipes.length === 0 ? (
            <p className="text-[var(--muted)] text-sm italic">
              No archived recipes yet.
            </p>
          ) : (
            archivedRecipes.map((archive) => (
              <div
                key={archive.id}
                className="p-4 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-[#3a8fd1]">
                    {archive.date_range}
                  </span>
                  <button
                    onClick={() => handleArchiveDeleteClick(archive.id)}
                    className={`p-1 rounded transition-colors ${getArchiveDeleteState(archive.id).colorClass}`}
                    title={getArchiveDeleteState(archive.id).title}
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
                <div className="space-y-3">
                  {archive.suggestions.map((recipe, idx) => {
                    const recipeKey = `${recipe.name}-${recipe.description}`;
                    const isCopied = copiedRecipe === recipeKey;
                    return (
                    <div
                      key={idx}
                      className="p-3 bg-[var(--card-bg-alt)] rounded border border-[var(--border-color)]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--foreground)] text-sm">
                              {recipe.name}
                            </h4>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded bg-[var(--card-bg)] ${getMacroColor(
                                recipe.primary_macro
                              )}`}
                            >
                              {recipe.primary_macro}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--muted)]">
                            {recipe.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyRecipe(recipe)}
                          className={`p-1.5 rounded transition-colors ml-2 ${
                            isCopied ? 'text-green-500' : 'text-gray-400 hover:text-[#3a8fd1]'
                          }`}
                          title="Copy to clipboard"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Show initial state with generate button
  if (!hasGenerated) {
    return (
      <div>
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={loadRecipes}
            disabled={isLoading}
            className="w-full h-[46px] bg-[#3a8fd1] text-white rounded-lg font-medium hover:bg-[#2d7bc4] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? 'Generating...' : 'Generate Recipe Suggestions'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSaveToArchive}
              disabled={isSaving || !recipes.length}
              className="flex-1 h-[46px] bg-[#27ae60] text-white rounded-lg font-medium hover:bg-[#219653] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSaving ? 'Saving...' : 'Save to Archive'}
            </button>
            <button
              onClick={loadArchive}
              disabled={isLoadingArchive}
              className="flex-1 h-[46px] bg-[#8B6914] text-white rounded-lg font-medium hover:bg-[#6B4F0F] disabled:bg-[#A08040] disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoadingArchive ? 'Loading...' : 'View Archive'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
            Recipe Suggestions
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Based on {yesterday} - {today}
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}
      </div>
    );
  }

  // Loading state
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
      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={loadRecipes}
          disabled={isLoading}
          className="w-full h-[46px] bg-[#3a8fd1] text-white rounded-lg font-medium hover:bg-[#2d7bc4] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? 'Generating...' : 'Generate New Recipes'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSaveToArchive}
            disabled={isSaving || !recipes.length}
            className="flex-1 h-[46px] bg-[#27ae60] text-white rounded-lg font-medium hover:bg-[#219653] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSaving ? 'Saving...' : 'Save to Archive'}
          </button>
          <button
            onClick={loadArchive}
            disabled={isLoadingArchive}
            className="flex-1 h-[46px] bg-[#8B6914] text-white rounded-lg font-medium hover:bg-[#6B4F0F] disabled:bg-[#A08040] disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoadingArchive ? 'Loading...' : 'View Archive'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
          Recipe Suggestions
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          Based on {yesterday} - {today}
        </p>
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
