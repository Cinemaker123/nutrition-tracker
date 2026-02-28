'use client';

import { useState, useCallback } from 'react';

interface UseDeleteWithConfirmOptions {
  onDelete: (id: string) => Promise<void>;
}

export function useDeleteWithConfirm({ onDelete }: UseDeleteWithConfirmOptions) {
  const [deleteClicks, setDeleteClicks] = useState<Record<string, number>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  const handleDeleteClick = useCallback(async (id: string) => {
    const clicks = (deleteClicks[id] || 0) + 1;
    setDeleteClicks((prev) => ({ ...prev, [id]: clicks }));

    if (clicks >= 2) {
      setIsDeleting((prev) => ({ ...prev, [id]: true }));
      try {
        await onDelete(id);
        // Reset click count after successful delete
        setDeleteClicks((prev) => {
          const newClicks = { ...prev };
          delete newClicks[id];
          return newClicks;
        });
      } catch (error) {
        // Reset click count on error
        setDeleteClicks((prev) => {
          const newClicks = { ...prev };
          delete newClicks[id];
          return newClicks;
        });
      } finally {
        setIsDeleting((prev) => {
          const newDeleting = { ...prev };
          delete newDeleting[id];
          return newDeleting;
        });
      }
    }
  }, [deleteClicks, onDelete]);

  const getDeleteState = useCallback((id: string) => {
    const clicks = deleteClicks[id] || 0;
    return {
      clicks,
      isDeleting: isDeleting[id] || false,
      colorClass: clicks === 0 
        ? 'text-gray-400 hover:text-orange-400' 
        : 'text-red-500 hover:text-red-600',
      title: clicks === 0 ? 'Click to delete' : 'Click again to confirm delete',
    };
  }, [deleteClicks, isDeleting]);

  const resetClicks = useCallback(() => {
    setDeleteClicks({});
  }, []);

  return {
    handleDeleteClick,
    getDeleteState,
    resetClicks,
  };
}
