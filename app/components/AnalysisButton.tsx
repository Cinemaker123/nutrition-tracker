'use client';

import { useState } from 'react';
import type { Analysis } from '@/types';
import { getDateRange } from '@/lib/dates';

interface AnalysisButtonProps {
  selectedDate: string;
}

export function AnalysisButton({ selectedDate }: AnalysisButtonProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [daysAnalyzed, setDaysAnalyzed] = useState(0);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [deleteClicks, setDeleteClicks] = useState<Record<string, number>>({});

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    setAnalysis(null);

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

  const handleSaveToArchive = async () => {
    if (!analysis || !dateRange) return;

    setIsSaving(true);
    const password = localStorage.getItem('app_password');

    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-password': password || '',
        },
        body: JSON.stringify({ date_range: dateRange, analysis }),
      });

      if (response.status === 401) {
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      // Clear analysis after saving
      setAnalysis(null);
    } catch (err) {
      setError('Failed to save analysis');
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
      setDeleteClicks({}); // Reset click counts
      setShowArchive(true);
    } catch (err) {
      setError('Failed to load archive');
    } finally {
      setIsLoadingArchive(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    const clicks = (deleteClicks[id] || 0) + 1;
    setDeleteClicks({ ...deleteClicks, [id]: clicks });

    if (clicks >= 2) {
      // Actually delete
      const password = localStorage.getItem('app_password');
      
      try {
        const response = await fetch(`/api/analyses/${id}`, {
          method: 'DELETE',
          headers: { 'x-password': password || '' },
        });

        if (response.status === 401) {
          setError('Invalid password');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to delete');
        }

        // Remove from local state
        setAnalyses(analyses.filter(a => a.id !== id));
        const newClicks = { ...deleteClicks };
        delete newClicks[id];
        setDeleteClicks(newClicks);
      } catch (err) {
        setError('Failed to delete analysis');
      }
    }
  };

  const getTrashColor = (id: string) => {
    const clicks = deleteClicks[id] || 0;
    if (clicks === 0) return 'text-gray-400 hover:text-orange-400';
    return 'text-red-500 hover:text-red-600';
  };

  return (
    <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
      <div className="flex gap-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="analyze-btn flex-1 py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analyzing 7 days...' : 'Analyze Last 7 Days'}
        </button>
        
        <button
          onClick={loadArchive}
          disabled={isLoadingArchive}
          className="px-4 py-4 bg-[#8B6914] text-white rounded-lg font-medium hover:bg-[#6B4F0F] disabled:bg-[#A08040] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          title="View Archive"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m21.5 21.5-7.1-7.1"/>
            <path d="M17 9.5a7.5 7.5 0 1 0-15 0 7.5 7.5 0 0 0 15 0Z"/>
            <path d="M6.5 8.5h3"/>
            <path d="M6.5 11.5h5"/>
          </svg>
          {isLoadingArchive ? 'Loading...' : 'Archive'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      {analysis && (
        <div className="mt-6 p-5 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              7-Day Analysis ({daysAnalyzed} days with data)
            </h3>
            <button
              onClick={handleSaveToArchive}
              disabled={isSaving}
              className="text-xs px-3 py-1.5 bg-[#8B6914] text-white rounded hover:bg-[#6B4F0F] disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save to Archive'}
            </button>
          </div>
          <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {analysis}
          </p>
        </div>
      )}

      {showArchive && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
            Archived Analyses
          </h3>
          {analyses.length === 0 ? (
            <p className="text-[var(--muted)] text-sm italic">No archived analyses yet.</p>
          ) : (
            analyses.map((item) => {
              const clickCount = deleteClicks[item.id] || 0;
              return (
                <div 
                  key={item.id} 
                  className="p-4 bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--border-color)]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-[#8B6914]">{item.date_range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(item.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className={`p-1 rounded transition-colors ${getTrashColor(item.id)}`}
                        title={clickCount === 0 ? 'Click to delete' : 'Click again to confirm delete'}
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
