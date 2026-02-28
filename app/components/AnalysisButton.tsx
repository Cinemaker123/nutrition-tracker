'use client';

import { useState } from 'react';

interface AnalysisButtonProps {
  selectedDate: string;
}

export function AnalysisButton({ selectedDate }: AnalysisButtonProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [daysAnalyzed, setDaysAnalyzed] = useState(0);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError('Failed to get analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing 7 days...' : 'Analyze Last 7 Days'}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      {analysis && (
        <div className="mt-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            7-Day Analysis ({daysAnalyzed} days with data)
          </h3>
          <p className="text-black leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {analysis}
          </p>
        </div>
      )}
    </div>
  );
}
