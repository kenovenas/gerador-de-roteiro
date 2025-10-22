import React, { useState, useCallback } from 'react';
import type { ScriptScene } from '../types';

interface ScriptTableProps {
    data: ScriptScene[];
}

export const ScriptTable: React.FC<ScriptTableProps> = ({ data }) => {
    const [imageCopyText, setImageCopyText] = useState('Copiar Todos os Prompts de Imagem');
    const [videoCopyText, setVideoCopyText] = useState('Copiar Todos os Prompts de Vídeo');

    const handleCopyPrompts = useCallback((type: 'image' | 'video') => {
        const prompts = data
            .flatMap(scene => scene.detalhes.map(detail => type === 'image' ? detail.promptImagem : detail.promptVideo))
            .join('\n\n');

        navigator.clipboard.writeText(prompts).then(() => {
            if (type === 'image') {
                setImageCopyText('Copiado!');
                setTimeout(() => setImageCopyText('Copiar Todos os Prompts de Imagem'), 2000);
            } else {
                setVideoCopyText('Copiado!');
                setTimeout(() => setVideoCopyText('Copiar Todos os Prompts de Vídeo'), 2000);
            }
        }).catch(err => {
            console.error('Failed to copy prompts: ', err);
        });
    }, [data]);


    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <button
                    onClick={() => handleCopyPrompts('image')}
                    className="flex-1 bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    {imageCopyText}
                </button>
                <button
                    onClick={() => handleCopyPrompts('video')}
                    className="flex-1 bg-slate-700 text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                >
                    {videoCopyText}
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-purple-800">
                <table className="min-w-full divide-y divide-purple-800">
                    <thead className="bg-purple-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                História
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                Falas
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                Prompt de Imagem
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                Prompt de Vídeo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-purple-900/50 divide-y divide-purple-800">
                        {data.map((scene, sceneIndex) => (
                            <React.Fragment key={`scene-${sceneIndex}`}>
                                <tr className="bg-purple-900">
                                    <td colSpan={4} className="px-6 py-3 text-sm font-bold text-pink-400">
                                        {scene.cena}
                                    </td>
                                </tr>
                                {scene.detalhes.map((detail, detailIndex) => (
                                    <tr key={`detail-${sceneIndex}-${detailIndex}`} className="even:bg-purple-900/30">
                                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 align-top">
                                            {detail.descricaoHistoria}
                                        </td>
                                        {detailIndex === 0 && (
                                            <td rowSpan={scene.detalhes.length} className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 align-top border-l border-purple-800">
                                                {scene.falas}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-pre-wrap text-xs text-slate-400 font-mono align-top border-l border-purple-800">
                                            {detail.promptImagem}
                                        </td>
                                        <td className="px-6 py-4 whitespace-pre-wrap text-xs text-slate-400 font-mono align-top border-l border-purple-800">
                                            {detail.promptVideo}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};