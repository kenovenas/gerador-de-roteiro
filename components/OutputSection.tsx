import React from 'react';
import { ScriptTable } from './ScriptTable';
import { SeoSection } from './SeoSection';
import type { ScriptData } from '../types';

interface OutputSectionProps {
    isGenerating: boolean;
    error: string | null;
    scriptData: ScriptData | null;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ isGenerating, error, scriptData }) => {
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