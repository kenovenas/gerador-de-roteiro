import React, { useState, useCallback } from 'react';
import type { SeoData, SeoPart } from '../types';
import { Spinner } from './Spinner';

interface SeoSectionProps {
    seoData: SeoData;
    onRegenerate: (part: SeoPart, instructions: string) => void;
    isRegenerating: SeoPart | null;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [textToCopy]);

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-700 rounded-md text-slate-300 hover:bg-slate-600 transition"
            aria-label="Copiar"
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
};

const RegenerateControl: React.FC<{
    partName: SeoPart,
    onGenerate: (part: SeoPart, instructions: string) => void,
    isGenerating: boolean,
}> = ({ partName, onGenerate, isGenerating }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [instructions, setInstructions] = useState('');

    const handleGenerateClick = () => {
        if (instructions.trim()) {
            onGenerate(partName, instructions);
            // setIsEditing(false); // Optionally close on generation
        }
    };

    return (
        <div className="mt-4">
            {!isEditing && (
                 <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-purple-400 hover:text-pink-400 font-semibold transition-colors"
                >
                    Gerar Novamente
                </button>
            )}
            {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input
                        type="text"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="flex-grow bg-slate-700 border border-purple-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        placeholder="Adicionar instruções (ex: mais curtos, tom formal...)"
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !instructions.trim()}
                        className="flex items-center justify-center gap-1 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Spinner /> : null}
                        Gerar
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        disabled={isGenerating}
                        className="text-slate-400 hover:text-white text-sm py-2 px-4 rounded-lg"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    )
};


export const SeoSection: React.FC<SeoSectionProps> = ({ seoData, onRegenerate, isRegenerating }) => {
    return (
        <div className="bg-purple-900/50 p-6 rounded-2xl border border-purple-800 shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Conteúdo para YouTube
            </h2>

            {/* Títulos Sugeridos */}
            <div className="bg-slate-800 p-4 rounded-lg border border-purple-700">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Títulos Sugeridos</h3>
                    <CopyButton textToCopy={seoData.titulos.join('\n')} />
                </div>
                <ul className="space-y-2 list-disc list-inside">
                    {seoData.titulos.map((title, index) => (
                        <li key={index} className="text-slate-300">{title}</li>
                    ))}
                </ul>
                <RegenerateControl partName="titulos" onGenerate={onRegenerate} isGenerating={isRegenerating === 'titulos'} />
            </div>

            {/* Descrição do Vídeo */}
            <div className="bg-slate-800 p-4 rounded-lg border border-purple-700">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Descrição do Vídeo</h3>
                    <CopyButton textToCopy={seoData.descricao} />
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{seoData.descricao}</p>
                 <RegenerateControl partName="descricao" onGenerate={onRegenerate} isGenerating={isRegenerating === 'descricao'} />
            </div>

            {/* Prompts para Thumbnail */}
            <div className="bg-slate-800 p-4 rounded-lg border border-purple-700">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Prompts para Thumbnail</h3>
                    <CopyButton textToCopy={seoData.promptsThumbnail.join('\n\n')} />
                </div>
                <ul className="space-y-2 list-disc list-inside">
                    {seoData.promptsThumbnail.map((prompt, index) => (
                        <li key={index} className="text-slate-300 font-mono text-sm">{prompt}</li>
                    ))}
                </ul>
                 <RegenerateControl partName="promptsThumbnail" onGenerate={onRegenerate} isGenerating={isRegenerating === 'promptsThumbnail'} />
            </div>

            {/* Tags (SEO) */}
            <div className="bg-slate-800 p-4 rounded-lg border border-purple-700">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Tags (SEO)</h3>
                    <CopyButton textToCopy={seoData.tags.join(', ')} />
                </div>
                <div className="flex flex-wrap gap-2">
                    {seoData.tags.map((tag, index) => (
                        <span key={index} className="bg-slate-700 text-pink-300 text-sm font-medium px-3 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                 <RegenerateControl partName="tags" onGenerate={onRegenerate} isGenerating={isRegenerating === 'tags'} />
            </div>
        </div>
    );
};