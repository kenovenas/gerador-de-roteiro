import React from 'react';
import { ScriptTable } from './ScriptTable';
import { SeoSection } from './SeoSection';
import type { ScriptData } from '../types';

interface OutputSectionProps {
    isGenerating: boolean;
    error: string | null;
    generatedImage: string | null;
    scriptData: ScriptData | null;
}

const LoadingPlaceholder: React.FC<{ text: string }> = ({ text }) => (
    <div className="w-full h-full flex items-center justify-center bg-purple-900/50 border-2 border-dashed border-purple-700 rounded-xl">
        <div className="text-center">
            <div className="animate-pulse text-purple-300">{text}</div>
        </div>
    </div>
);

export const OutputSection: React.FC<OutputSectionProps> = ({ isGenerating, error, generatedImage, scriptData }) => {
    if (!isGenerating && !error && !scriptData) {
        return null;
    }

    return (
        <section className="flex flex-col gap-8">
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                    {error}
                </div>
            )}
            
            <div className="w-full aspect-video rounded-2xl bg-slate-800 border border-purple-800 overflow-hidden shadow-lg">
                {isGenerating && !generatedImage && <LoadingPlaceholder text="Criando um vislumbre do seu filme..." />}
                {generatedImage && <img src={generatedImage} alt="Arte conceitual gerada por IA" className="w-full h-full object-cover" />}
            </div>

            {scriptData && scriptData.cenas ? (
                <>
                    <ScriptTable data={scriptData.cenas} />
                    {scriptData.seo && <SeoSection seoData={scriptData.seo} />}
                </>
            ) : isGenerating ? (
                <div className="w-full h-64 flex items-center justify-center bg-purple-900/50 border-2 border-dashed border-purple-700 rounded-xl">
                    <div className="animate-pulse text-purple-300">Escrevendo seu roteiro...</div>
                </div>
            ) : null}
        </section>
    );
};