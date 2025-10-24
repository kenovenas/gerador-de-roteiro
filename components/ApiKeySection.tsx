import React, { useState, useEffect } from 'react';

interface ApiKeySectionProps {
    onKeyStatusChange: (hasKey: boolean) => void;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({ onKeyStatusChange }) => {
    const [apiKey, setApiKey] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            setApiKey(savedKey);
            setIsKeySaved(true);
            onKeyStatusChange(true);
        } else {
            onKeyStatusChange(false);
        }
    }, [onKeyStatusChange]);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('gemini-api-key', apiKey);
            setIsKeySaved(true);
            onKeyStatusChange(true);
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey('');
        setIsKeySaved(false);
        onKeyStatusChange(false);
    };
    
    const EyeIcon = ({ closed }: { closed?: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {closed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-3.59-3.59m0 0l-3.59 3.59" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
            )}
        </svg>
    );

    return (
        <section className="bg-slate-800 p-4 rounded-lg border border-purple-800 shadow-md">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Configuração da Chave de API do Gemini</h3>
            {!isKeySaved ? (
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-slate-700 border border-purple-700 rounded-lg p-2 pr-10 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            placeholder="Cole sua chave de API aqui"
                        />
                         <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white" aria-label={showKey ? "Esconder chave" : "Mostrar chave"}>
                            <EyeIcon closed={!showKey} />
                        </button>
                    </div>
                    <button onClick={handleSaveKey} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Salvar Chave
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <p className="text-green-400">Sua chave de API está salva e pronta para uso.</p>
                    <button onClick={handleClearKey} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Remover Chave
                    </button>
                </div>
            )}
             <p className="text-xs text-slate-500 mt-2">
                Sua chave de API é armazenada apenas no seu navegador e nunca é enviada para nossos servidores.
            </p>
        </section>
    );
};