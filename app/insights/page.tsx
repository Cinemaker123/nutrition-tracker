'use client';

import { useRouter } from 'next/navigation';
import { ThemeProvider } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';
import { PasswordGate } from '../components/PasswordGate';
import { InsightsTabs } from '../components/insights/InsightsTabs';
import { RecipesTab } from '../components/insights/RecipesTab';
import { AnalysisTab } from '../components/insights/AnalysisTab';
import { ChevronLeft } from 'lucide-react';

function InsightsPage() {
  const router = useRouter();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--muted)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Tracker</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Insights</h1>
        <p className="text-[var(--muted)] mt-1">
          AI-powered recipe suggestions and nutrition analysis
        </p>
      </div>

      {/* Tabs */}
      <InsightsTabs
        recipesContent={<RecipesTab />}
        analysisContent={<AnalysisTab />}
      />
    </div>
  );
}

export default function InsightsPageWrapper() {
  return (
    <ThemeProvider>
      <PasswordGate>
        <InsightsPage />
      </PasswordGate>
    </ThemeProvider>
  );
}
