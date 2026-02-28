'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addDays = (dateStr: string, days: number): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const goToPreviousDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  const isToday = selectedDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToPreviousDay}
        className="p-2 rounded-lg hover:bg-gray-100  transition-colors"
        title="Previous day"
      >
        <ChevronLeft className="w-5 h-5 text-black" />
      </button>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold text-black">
          {formatDate(selectedDate)}
        </h2>
        {!isToday && (
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          >
            Go to today
          </button>
        )}
      </div>
      
      <button
        onClick={goToNextDay}
        className="p-2 rounded-lg hover:bg-gray-100  transition-colors"
        title="Next day"
      >
        <ChevronRight className="w-5 h-5 text-black" />
      </button>
    </div>
  );
}
