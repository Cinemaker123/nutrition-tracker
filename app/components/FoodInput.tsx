'use client';

import { useState } from 'react';

interface FoodInputProps {
  onFoodAdded: () => void;
  selectedDate: string;
}

export function FoodInput({ onFoodAdded, selectedDate }: FoodInputProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    const password = localStorage.getItem('app_password');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-password': password || '',
        },
        body: JSON.stringify({ text: text.trim(), date: selectedDate }),
      });
      
      if (response.status === 401) {
        setError('Invalid password. Please refresh and log in again.');
        localStorage.removeItem('app_password');
        window.location.reload();
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze food');
      }
      
      setText('');
      onFoodAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you eat? (e.g., 2 eggs and toast)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '...' : 'Add'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}
