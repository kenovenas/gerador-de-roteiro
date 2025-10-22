import React from 'react';
import type { HistoryItem } from '../types';

interface HistorySidebarProps {
    history: HistoryItem[];
    activeId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, activeId, onNewChat, onSelectChat, onDeleteChat }) => {
    return (
        <aside className="w-64 bg-slate-800 text-white flex flex-col p-2 border-r border-purple-800 h-full">
            <button
                onClick={onNewChat}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 mb-4"
            >
                + Novo Roteiro
            </button>
            <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-2">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                                activeId === item.id ? 'bg-purple-700' : 'hover:bg-slate-700'
                            }`}
                            onClick={() => onSelectChat(item.id)}
                        >
                            <span className="text-sm truncate flex-1">{item.title}</span>
                             <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering onSelectChat
                                    onDeleteChat(item.id);
                                }}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                aria-label="Deletar roteiro"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};
