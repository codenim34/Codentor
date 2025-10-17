"use client";

import dynamic from 'next/dynamic';

// Dynamically import KanbanBoard with no SSR to avoid React 18 StrictMode issues with react-beautiful-dnd
const KanbanBoard = dynamic(() => import('./KanbanBoard'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col">
          <div className="rounded-t-xl border-t border-x p-4 bg-gray-800/50 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="rounded-b-xl border-b border-x p-4 min-h-[500px] bg-gray-800/50">
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
});

export default function KanbanBoardWrapper(props) {
  return <KanbanBoard {...props} />;
}

