import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateScript } from './services/geminiService';
import { exportScriptToPDF } from './utils/pdfExporter';
import { HistorySidebar } from './components/HistorySidebar';
import { ApiKeySection } from './components/ApiKeySection';
import type { ScriptData, HistoryItem } from './types';

const App: React.FC = () => {
    // State for API Key
    const [hasApiKey, setHasApiKey] = useState(false);

    // State for the active session
    const [projectName, setProjectName] = useState('');
    const [storyIdea, setStoryIdea] = useState('');
    const [visualStyle, setVisualStyle] = useState('Cinematográfico');
    const [duration, setDuration] = useState('Curta');
    const [videoDurationMinutes, setVideoDurationMinutes] = useState(10);
    const [titleInstruction, setTitleInstruction] = useState('');
    const [descriptionInstruction, setDescriptionInstruction] = useState('');
    const [thumbnailInstruction, setThumbnailInstruction] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scriptData, setScriptData] = useState<ScriptData | null>(null);
    
    // State for history management
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
        setVideoDurationMinutes(10);
        setTitleInstruction('');
        setDescriptionInstruction('');
        setThumbnailInstruction('');
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
            setVideoDurationMinutes(selected.videoDurationMinutes || 10);
            setTitleInstruction(selected.titleInstruction);
            setDescriptionInstruction(selected.descriptionInstruction);
            setThumbnailInstruction(selected.thumbnailInstruction);
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
            setError('Por favor, configure sua chave de API do Gemini primeiro.');
            return;
        }
        if (!storyIdea.trim()) {
            setError('Por favor, descreva sua ideia de história.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setScriptData(null);

        try {
            const newScript = await generateScript(
                storyIdea,
                visualStyle,
                duration,
                titleInstruction,
                descriptionInstruction,
                thumbnailInstruction,
                videoDurationMinutes
            );
            
            setScriptData(newScript);
            
            if (newScript) {
                 const newHistoryItem: HistoryItem = {
                    id: Date.now().toString(),
                    title: projectName.trim() || storyIdea.substring(0, 40) + (storyIdea.length > 40 ? '...' : ''),
                    projectName,
                    storyIdea,
                    visualStyle,
                    duration,
                    videoDurationMinutes,
                    titleInstruction,
                    descriptionInstruction,
                    thumbnailInstruction,
                    scriptData: newScript,
                 };
                 setHistory(prev => [newHistoryItem, ...prev]);
                 setActiveSessionId(newHistoryItem.id);
            }

        } catch (e: any) {
            console.error(e);
            setError(`Falha ao gerar o roteiro: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    }, [hasApiKey, projectName, storyIdea, visualStyle, duration, videoDurationMinutes, titleInstruction, descriptionInstruction, thumbnailInstruction]);

    const handleExport = () => {
        if (scriptData && scriptData.cenas) {
            exportScriptToPDF(scriptData.cenas, storyIdea, visualStyle, duration, videoDurationMinutes);
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
                        <ApiKeySection onKeyStatusChange={setHasApiKey} />
                        <InputSection
                            projectName={projectName}
                            setProjectName={setProjectName}
                            storyIdea={storyIdea}
                            setStoryIdea={setStoryIdea}
                            visualStyle={visualStyle}
                            setVisualStyle={setVisualStyle}
                            duration={duration}
                            setDuration={setDuration}
                            videoDurationMinutes={videoDurationMinutes}
                            setVideoDurationMinutes={setVideoDurationMinutes}
                            titleInstruction={titleInstruction}
                            setTitleInstruction={setTitleInstruction}
                            descriptionInstruction={descriptionInstruction}
                            setDescriptionInstruction={setDescriptionInstruction}
                            thumbnailInstruction={thumbnailInstruction}
                            setThumbnailInstruction={setThumbnailInstruction}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating || !hasApiKey}
                            isResultReady={!!scriptData}
                            onExport={handleExport}
                        />
                        <OutputSection
                            isGenerating={isGenerating}
                            error={error}
                            scriptData={scriptData}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;