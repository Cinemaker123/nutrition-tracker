'use client';

import { useState } from 'react';

interface InsightsTabsProps {
  recipesContent: React.ReactNode;
  analysisContent: React.ReactNode;
}

export function InsightsTabs({ recipesContent, analysisContent }: InsightsTabsProps) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'analysis'>('recipes');

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex rounded-lg overflow-hidden mb-6">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'recipes'
              ? 'bg-[#3a8fd1] text-white'
              : 'bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          Recipes
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'analysis'
              ? 'bg-gray-700 text-white'
              : 'bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
          }`}
        >
          Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'recipes' ? recipesContent : analysisContent}
      </div>
    </div>
  );
}
