'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Fix timezone issue
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToPreviousDay}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            className="text-sm text-blue-600 hover:text-blue-800 mt-1"
          >
            Go to today
          </button>
        )}
      </div>
      
      <button
        onClick={goToNextDay}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Next day"
      >
        <ChevronRight className="w-5 h-5 text-black" />
      </button>
    </div>
  );
}
