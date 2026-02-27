'use client';

import { useState, useEffect, useCallback } from 'react';
import { PasswordGate } from './components/PasswordGate';
import { DatePicker } from './components/DatePicker';
import { FoodInput } from './components/FoodInput';
import { FoodTable } from './components/FoodTable';
import { MacroSummary } from './components/MacroSummary';
import { supabase, FoodEntry } from '@/lib/supabase';

function NutritionTracker() {
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
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <PasswordGate>
      <NutritionTracker />
    </PasswordGate>
  );
}
