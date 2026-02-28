'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { PasswordGate } from './components/PasswordGate';
import { DatePicker } from './components/DatePicker';
import { FoodInput } from './components/FoodInput';
import { FoodTable } from './components/FoodTable';
import { MacroSummary } from './components/MacroSummary';
import { supabase, FoodEntry } from '@/lib/supabase';
import { AnalysisButton } from './components/AnalysisButton';
import { Lightbulb } from 'lucide-react';

function NutritionTracker() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => 
    new Date().toISOString().split('T')[0]
  );
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('entry_date', selectedDate)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries(data || []);
    }
    
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting entry:', error);
    } else {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => router.push('/insights')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          Insights
        </button>
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto pt-4">
        {/* Date Navigation */}
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Food Input */}
        <FoodInput onFoodAdded={fetchEntries} selectedDate={selectedDate} />

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-black mt-2">Loading...</p>
          </div>
        ) : (
          <>
            {/* Macro Summary */}
            <MacroSummary entries={entries} />

            {/* Food Table */}
            <FoodTable entries={entries} onDelete={handleDelete} />

            {/* 7-Day Analysis */}
            <AnalysisButton selectedDate={selectedDate} />
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <PasswordGate>
        <NutritionTracker />
      </PasswordGate>
    </ThemeProvider>
  );
}
