import React, { useState, useCallback } from 'react';
import type { SeoData } from '../types';

interface SeoSectionProps {
    seoData: SeoData;
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
            className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-md text-slate-300 hover:bg-slate-600 transition"
            aria-label="Copiar"
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
};


export const SeoSection: React.FC<SeoSectionProps> = ({ seoData }) => {
    return (
        <div className="bg-purple-900/50 p-6 rounded-2xl border border-purple-800 shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Conteúdo para YouTube
            </h2>

            {/* Títulos Sugeridos */}
            <div className="relative bg-slate-800 p-4 rounded-lg border border-purple-700">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Títulos Sugeridos</h3>
                <ul className="space-y-2 list-disc list-inside">
                    {seoData.titulos.map((title, index) => (
                        <li key={index} className="text-slate-300">{title}</li>
                    ))}
                </ul>
                <CopyButton textToCopy={seoData.titulos.join('\n')} />
            </div>

            {/* Descrição do Vídeo */}
            <div className="relative bg-slate-800 p-4 rounded-lg border border-purple-700">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Descrição do Vídeo</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{seoData.descricao}</p>
                <CopyButton textToCopy={seoData.descricao} />
            </div>

            {/* Prompts para Thumbnail */}
            <div className="relative bg-slate-800 p-4 rounded-lg border border-purple-700">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Prompts para Thumbnail</h3>
                <ul className="space-y-2 list-disc list-inside">
                    {seoData.promptsThumbnail.map((prompt, index) => (
                        <li key={index} className="text-slate-300 font-mono text-sm">{prompt}</li>
                    ))}
                </ul>
                 <CopyButton textToCopy={seoData.promptsThumbnail.join('\n\n')} />
            </div>

            {/* Tags (SEO) */}
            <div className="relative bg-slate-800 p-4 rounded-lg border border-purple-700">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Tags (SEO)</h3>
                <div className="flex flex-wrap gap-2">
                    {seoData.tags.map((tag, index) => (
                        <span key={index} className="bg-slate-700 text-pink-300 text-sm font-medium px-3 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                 <CopyButton textToCopy={seoData.tags.join(', ')} />
            </div>
        </div>
    );
};