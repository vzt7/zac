import { Star, StarOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useFunctions } from './SidebarFunctionsData';

interface FunctionItem {
  id: string;
  title: string;
  description?: string;
  isPinned?: boolean;
  content?: React.ReactNode;
  modalContent?: React.ReactNode;
}

export const SidebarFunctions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FunctionItem | null>(null);

  const functions = useFunctions();
  const [sortedFunctions, setSortedFunctions] = useState<FunctionItem[]>(
    functions || [],
  );

  // 从本地存储加载置顶状态
  useEffect(() => {
    const pinnedStates = JSON.parse(
      localStorage.getItem('pinnedFunctions') || '{}',
    );
    setSortedFunctions(
      functions.map((func) => ({ ...func, isPinned: pinnedStates[func.id] })),
    );
  }, []);

  // 处理置顶切换
  const handlePinToggle = (id: string) => {
    const updatedFunctions = sortedFunctions.map((func) => {
      if (func.id === id) {
        return { ...func, isPinned: !func.isPinned };
      }
      return func;
    });

    // 更新本地存储
    const pinnedStates = updatedFunctions.reduce(
      (acc, func) => {
        acc[func.id] = Boolean(func.isPinned);
        return acc;
      },
      {} as Record<string, boolean>,
    );
    localStorage.setItem('pinnedFunctions', JSON.stringify(pinnedStates));

    // 重新排序：置顶项在前
    const nextSortedFunctions = [
      ...updatedFunctions.filter((f) => f.isPinned),
      ...updatedFunctions.filter((f) => !f.isPinned),
    ];
    setSortedFunctions(nextSortedFunctions);
  };

  return (
    <div className="py-2">
      {sortedFunctions.map((item) => (
        <div
          key={item.id}
          className="card bg-base-200 mb-4 border-2 dark:border-gray-600 border-gary-300 hover:bg-base-300 hover:border-primary transition-colors"
        >
          <div className="card-body p-4">
            <div
              className="flex flex-row justify-between items-start w-full"
              onClick={() => {
                setSelectedItem(item);

                if (item.modalContent) {
                  setIsModalOpen(true);
                }
              }}
            >
              <div
                className={`flex-1 ${item.modalContent ? 'cursor-pointer' : ''}`}
              >
                <h3 className="card-title text-lg">{item.title}</h3>
                {item.description && (
                  <p className="text-sm opacity-70">{item.description}</p>
                )}
              </div>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => handlePinToggle(item.id)}
              >
                {item.isPinned ? (
                  <Star
                    size={20}
                    className="text-warning"
                    fill="oklch(var(--wa))"
                  />
                ) : (
                  <StarOff size={20} />
                )}
              </button>
            </div>
            {item.content && item.content}
          </div>
        </div>
      ))}

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{selectedItem.title}</h3>
            <div className="py-4 min-h-[200px]">
              {selectedItem.modalContent}
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          >
            <button>Close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};
