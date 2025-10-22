import React from 'react';
import { Spinner } from './Spinner';

interface InputSectionProps {
    storyIdea: string;
    setStoryIdea: (value: string) => void;
    visualStyle: string;
    setVisualStyle: (value: string) => void;
    duration: string;
    setDuration: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    isResultReady: boolean;
    onExport: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
    storyIdea, setStoryIdea, visualStyle, setVisualStyle, duration, setDuration, onGenerate, isGenerating, isResultReady, onExport
}) => {
    const visualStyles = ["Cinematográfico", "Hiper-realista", "Ultra Realista em 8k", "Longa animado (Estilo Pixar)", "CGI Ultra-realista", "Estilo Cyberpunk", "Fantasia Épica (Senhor dos Anéis)", "Noir Clássico", "Terror Cósmico (Lovecraft)"];
    const durations = ["Curta", "Média", "Longa", "10 minutos de vídeo"];

    return (
        <section className="bg-purple-900/50 p-6 md:p-8 rounded-2xl border border-purple-800 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="story-idea" className="block text-sm font-medium text-purple-300 mb-2">Sua Ideia</label>
                    <textarea
                        id="story-idea"
                        rows={6}
                        className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        placeholder="Descreva a trama, os personagens e a premissa geral da sua história..."
                        value={storyIdea}
                        onChange={(e) => setStoryIdea(e.target.value)}
                        disabled={isGenerating}
                    />
                </div>
                <div>
                    <label htmlFor="visual-style" className="block text-sm font-medium text-purple-300 mb-2">Estilo Visual</label>
                    <select
                        id="visual-style"
                        className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        value={visualStyle}
                        onChange={(e) => setVisualStyle(e.target.value)}
                        disabled={isGenerating}
                    >
                        {visualStyles.map(style => <option key={style} value={style}>{style}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="story-duration" className="block text-sm font-medium text-purple-300 mb-2">Duração da História</label>
                    <select
                        id="story-duration"
                        className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        disabled={isGenerating}
                    >
                        {durations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isGenerating && <Spinner />}
                    {isGenerating ? 'Gerando...' : 'Gerar Roteiro'}
                </button>
                {isResultReady && (
                    <button
                        onClick={onExport}
                        className="flex-1 bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Exportar para PDF
                    </button>
                )}
            </div>
        </section>
    );
};