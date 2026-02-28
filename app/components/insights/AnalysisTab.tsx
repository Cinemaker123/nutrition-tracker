'use client';

import { useState, useCallback } from 'react';
import type { Analysis } from '@/types';
import { useDeleteWithConfirm } from '@/hooks/useDeleteWithConfirm';
import { getDateRange } from '@/lib/dates';

interface AnalysisTabProps {
  selectedDate?: string;
}

export function AnalysisTab({ selectedDate: initialDate }: AnalysisTabProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [daysAnalyzed, setDaysAnalyzed] = useState(0);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    setShowArchive(false);

    const password = localStorage.getItem('app_password');

    try {
      const response = await fetch('/api/analyze-7days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-password': password || '',
        },
        body: JSON.stringify({ endDate: selectedDate }),
      });

      if (response.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setDaysAnalyzed(data.daysAnalyzed);
      setDateRange(getDateRange(selectedDate, 7));
    } catch (err) {
      setError('Failed to get analysis');
    } finally {
      setIsLoading(false);
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
      const response = await fetch('/api/analyses', {
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
      setAnalyses(data.analyses || []);
      setShowArchive(true);
    } catch (err) {
      setError('Failed to load archive');
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleDeleteAnalysis = useCallback(async (id: string) => {
    const password = localStorage.getItem('app_password');

    const response = await fetch(`/api/analyses/${id}`, {
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
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const { handleDeleteClick, getDeleteState } = useDeleteWithConfirm({
    onDelete: handleDeleteAnalysis,
  });

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="analyze-btn flex-1 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analyzing...' : 'Generate New Analysis'}
        </button>

        <button
          onClick={loadArchive}
          disabled={isLoadingArchive}
          className="px-4 py-3 bg-[#8B6914] text-white rounded-lg font-medium hover:bg-[#6B4F0F] disabled:bg-[#A08040] disabled:cursor-not-allowed transition-colors"
        >
          {isLoadingArchive ? 'Loading...' : showArchive ? 'Hide Archive' : 'View Archive'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      {/* Current Analysis */}
      {analysis && !showArchive && (
        <div className="p-5 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]">
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
            7-Day Analysis ({daysAnalyzed} days with data)
          </h3>
          <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {analysis}
          </p>
        </div>
      )}

      {/* Archive List */}
      {showArchive && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
            Archived Analyses
          </h3>
          {analyses.length === 0 ? (
            <p className="text-[var(--muted)] text-sm italic">No archived analyses yet.</p>
          ) : (
            analyses.map((item) => {
              const deleteState = getDeleteState(item.id);
              return (
                <div
                  key={item.id}
                  className="p-4 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-[#8B6914]">
                      {item.date_range}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className={`p-1 rounded transition-colors ${deleteState.colorClass}`}
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
                  <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {item.analysis}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
