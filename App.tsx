
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateScriptAndImage } from './services/geminiService';
import { exportScriptToPDF } from './utils/pdfExporter';
import { HistorySidebar } from './components/HistorySidebar';
import { ApiKeySection } from './components/ApiKeySection';
import type { ScriptData, HistoryItem } from './types';

const App: React.FC = () => {
    // State for the active session
    const [projectName, setProjectName] = useState('');
    const [storyIdea, setStoryIdea] = useState('');
    const [visualStyle, setVisualStyle] = useState('Cinematográfico');
    const [duration, setDuration] = useState('Curta');
    const [titleInstruction, setTitleInstruction] = useState('');
    const [descriptionInstruction, setDescriptionInstruction] = useState('');
    const [thumbnailInstruction, setThumbnailInstruction] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [scriptData, setScriptData] = useState<ScriptData | null>(null);
    
    // State for history management
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // State for API Key
    const [hasApiKey, setHasApiKey] = useState(false);

    const handleKeyStatusChange = (status: boolean) => {
        setHasApiKey(status);
         if (status && error === 'Por favor, configure sua chave de API do Gemini antes de gerar um roteiro.') {
            setError(null);
        }
    };

    useEffect(() => {
        // Load history from localStorage on initial render
        try {
            const savedHistory = localStorage.getItem('scriptHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    useEffect(() => {
        // Save history to localStorage whenever it changes
        try {
            localStorage.setItem('scriptHistory', JSON.stringify(history));
        } catch(e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);

    const resetActiveState = () => {
        setProjectName('');
        setStoryIdea('');
        setVisualStyle('Cinematográfico');
        setDuration('Curta');
        setTitleInstruction('');
        setDescriptionInstruction('');
        setThumbnailInstruction('');
        setGeneratedImage(null);
        setScriptData(null);
        setError(null);
        setActiveSessionId(null);
    };

    const handleNewChat = () => {
        resetActiveState();
    };
    
    const handleSelectChat = (id: string) => {
        const selected = history.find(item => item.id === id);
        if (selected) {
            setProjectName(selected.projectName || '');
            setStoryIdea(selected.storyIdea);
            setVisualStyle(selected.visualStyle);
            setDuration(selected.duration);
            setTitleInstruction(selected.titleInstruction);
            setDescriptionInstruction(selected.descriptionInstruction);
            setThumbnailInstruction(selected.thumbnailInstruction);
            setGeneratedImage(selected.generatedImage);
            setScriptData(selected.scriptData);
            setActiveSessionId(selected.id);
            setError(null);
        }
    };

    const handleDeleteChat = (idToDelete: string) => {
        setHistory(prev => prev.filter(item => item.id !== idToDelete));
        if (activeSessionId === idToDelete) {
            resetActiveState();
        }
    };


    const handleGenerate = useCallback(async () => {
        if (!hasApiKey) {
            setError('Por favor, configure sua chave de API do Gemini antes de gerar um roteiro.');
            return;
        }
        if (!storyIdea.trim()) {
            setError('Por favor, descreva sua ideia de história.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);
        setScriptData(null);

        try {
            const results = await generateScriptAndImage(
                storyIdea,
                visualStyle,
                duration,
                titleInstruction,
                descriptionInstruction,
                thumbnailInstruction
            );
            
            const newImage = results.imageResult.status === 'fulfilled' ? results.imageResult.value : null;
            const newScript = results.scriptResult.status === 'fulfilled' ? results.scriptResult.value : null;

            setGeneratedImage(newImage);
            setScriptData(newScript);

            if (results.imageResult.status === 'rejected') {
                console.error("Image generation failed:", results.imageResult.reason);
                const reason = results.imageResult.reason as Error;
                setError(`Falha ao gerar a imagem: ${reason.message}. Verificando o roteiro...`);
            }

            if (results.scriptResult.status === 'rejected') {
                console.error("Script generation failed:", results.scriptResult.reason);
                const reason = results.scriptResult.reason as Error;
                setError(`Falha ao gerar o roteiro: ${reason.message}. Tente novamente.`);
            } else if (newScript) {
                 if (!error || error.startsWith('Falha ao gerar a imagem')) setError(null);
                 const newHistoryItem: HistoryItem = {
                    id: Date.now().toString(),
                    title: projectName.trim() || storyIdea.substring(0, 40) + (storyIdea.length > 40 ? '...' : ''),
                    projectName,
                    storyIdea,
                    visualStyle,
                    duration,
                    titleInstruction,
                    descriptionInstruction,
                    thumbnailInstruction,
                    scriptData: newScript,
                    generatedImage: newImage,
                 };
                 setHistory(prev => [newHistoryItem, ...prev]);
                 setActiveSessionId(newHistoryItem.id);
            }

        // FIX: Explicitly typing `e` as `any` to prevent potential parsing errors that might cause the reported scope issues.
        } catch (e: any) {
            console.error(e);
            setError('Ocorreu um erro inesperado. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
        }
    }, [projectName, storyIdea, visualStyle, duration, titleInstruction, descriptionInstruction, thumbnailInstruction, hasApiKey, error]);

    const handleExport = () => {
        if (scriptData && scriptData.cenas) {
            exportScriptToPDF(scriptData.cenas, storyIdea, visualStyle, duration);
        }
    };

    return (
        <div className="flex h-screen">
            <HistorySidebar 
                history={history}
                activeId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
            />
            <div className="flex-1 flex flex-col overflow-y-auto">
                 <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
                    <main className="max-w-7xl mx-auto flex flex-col gap-8">
                        <Header />
                        <ApiKeySection onKeyStatusChange={handleKeyStatusChange} />
                        <InputSection
                            projectName={projectName}
                            setProjectName={setProjectName}
                            storyIdea={storyIdea}
                            setStoryIdea={setStoryIdea}
                            visualStyle={visualStyle}
                            setVisualStyle={setVisualStyle}
                            duration={duration}
                            setDuration={setDuration}
                            titleInstruction={titleInstruction}
                            setTitleInstruction={setTitleInstruction}
                            descriptionInstruction={descriptionInstruction}
                            setDescriptionInstruction={setDescriptionInstruction}
                            thumbnailInstruction={thumbnailInstruction}
                            setThumbnailInstruction={setThumbnailInstruction}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            isResultReady={!!scriptData}
                            onExport={handleExport}
                        />
                        <OutputSection
                            isGenerating={isGenerating}
                            error={error}
                            generatedImage={generatedImage}
                            scriptData={scriptData}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;
