import React from 'react';
import { Spinner } from './Spinner';

interface InputSectionProps {
    projectName: string;
    setProjectName: (value: string) => void;
    storyIdea: string;
    setStoryIdea: (value: string) => void;
    visualStyle: string;
    setVisualStyle: (value: string) => void;
    duration: string;
    setDuration: (value: string) => void;
    videoDurationMinutes: number;
    setVideoDurationMinutes: (value: number) => void;
    titleInstruction: string;
    setTitleInstruction: (value: string) => void;
    descriptionInstruction: string;
    setDescriptionInstruction: (value: string) => void;
    thumbnailInstruction: string;
    setThumbnailInstruction: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    isResultReady: boolean;
    onExport: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
    projectName, setProjectName, storyIdea, setStoryIdea, visualStyle, setVisualStyle, duration, setDuration,
    videoDurationMinutes, setVideoDurationMinutes, titleInstruction, setTitleInstruction, descriptionInstruction, setDescriptionInstruction,
    thumbnailInstruction, setThumbnailInstruction, onGenerate, isGenerating, isResultReady, onExport
}) => {
    const visualStyles = ["Cinematográfico", "Hiper-realista", "Ultra Realista em 8k", "Longa animado (Estilo Pixar)", "CGI Ultra-realista", "Estilo Cyberpunk", "Fantasia Épica (Senhor dos Anéis)", "Noir Clássico", "Terror Cósmico (Lovecraft)"];
    const durations = ["Curta", "Média", "Longa", "Vídeo"];

    return (
        <section className="bg-purple-900/50 p-6 md:p-8 rounded-2xl border border-purple-800 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label htmlFor="project-name" className="block text-sm font-medium text-purple-300 mb-2">Nome do Projeto</label>
                    <input
                        id="project-name"
                        type="text"
                        className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        placeholder="Ex: A Vingança do Roteirista"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={isGenerating}
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="story-idea" className="block text-sm font-medium text-purple-300 mb-2">Sua Ideia</label>
                    <textarea
                        id="story-idea"
                        rows={6}
                        className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        placeholder="Descreva a passagem ou história bíblica que você quer transformar em roteiro (ex: A história de Davi e Golias, A parábola do filho pródigo)..."
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

                {duration === 'Vídeo' && (
                     <div className="md:col-span-2">
                        <label htmlFor="video-duration-minutes" className="block text-sm font-medium text-purple-300 mb-2">Duração do Vídeo (minutos)</label>
                        <input
                            id="video-duration-minutes"
                            type="number"
                            min="1"
                            className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Ex: 5"
                            value={videoDurationMinutes}
                            onChange={(e) => setVideoDurationMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            disabled={isGenerating}
                        />
                    </div>
                )}

                <div className="md:col-span-2 space-y-4">
                     <div>
                        <label htmlFor="title-instruction" className="block text-sm font-medium text-purple-300 mb-2">Instruções para Títulos</label>
                        <textarea
                            id="title-instruction"
                            rows={2}
                            className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Ex: Títulos curtos, com no máximo 60 caracteres, que gerem curiosidade..."
                            value={titleInstruction}
                            onChange={(e) => setTitleInstruction(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>
                     <div>
                        <label htmlFor="description-instruction" className="block text-sm font-medium text-purple-300 mb-2">Instruções para Descrição</label>
                        <textarea
                            id="description-instruction"
                            rows={3}
                            className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Ex: Começar com um resumo da história, incluir links para redes sociais e terminar com uma pergunta para o público..."
                            value={descriptionInstruction}
                            onChange={(e) => setDescriptionInstruction(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>
                     <div>
                        <label htmlFor="thumbnail-instruction" className="block text-sm font-medium text-purple-300 mb-2">Instruções para Thumbnail</label>
                        <textarea
                            id="thumbnail-instruction"
                            rows={2}
                            className="w-full bg-slate-800 border border-purple-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Ex: Cores vibrantes, texto grande e legível, mostrar a reação de um personagem..."
                            value={thumbnailInstruction}
                            onChange={(e) => setThumbnailInstruction(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>
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