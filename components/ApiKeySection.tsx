import React, { useState, useEffect } from 'react';

interface ApiKeySectionProps {
    onKeyStatusChange: (hasKey: boolean) => void;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({ onKeyStatusChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [isKeySaved, setIsKeySaved] = useState(false);

    useEffect(() => {
        const key = localStorage.getItem('geminiApiKey');
        const hasKey = !!key;
        setIsKeySaved(hasKey);
        onKeyStatusChange(hasKey);
    }, [onKeyStatusChange]);

    const handleSave = () => {
        if (inputValue.trim()) {
            localStorage.setItem('geminiApiKey', inputValue.trim());
            setIsKeySaved(true);
            onKeyStatusChange(true);
            setInputValue(''); // Limpa o campo por segurança
        }
    };

    const handleRemove = () => {
        localStorage.removeItem('geminiApiKey');
        setIsKeySaved(false);
        onKeyStatusChange(false);
    };

    return (
         <section className="bg-slate-800/50 p-4 rounded-xl border border-purple-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-purple-300">Chave de API do Gemini</h3>
                <span className={`text-sm font-bold px-2 py-1 rounded ${isKeySaved ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {isKeySaved ? 'Salva' : 'Não Configurada'}
                </span>
            </div>
             <p className="text-sm text-slate-400 mb-4">
                Sua chave é armazenada localmente no seu navegador.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                {isKeySaved ? (
                    <>
                        <input
                            type="password"
                            disabled
                            value="****************************"
                            className="flex-grow w-full bg-slate-900 border border-purple-800 rounded-lg p-2 text-slate-400 cursor-not-allowed font-mono tracking-widest"
                            aria-label="Chave de API configurada e oculta"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={handleRemove} 
                                className="w-full sm:w-auto bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors"
                            >
                                Remover
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            type="password"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Cole sua chave de API aqui..."
                            className="flex-grow w-full bg-slate-700 border border-purple-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            aria-label="Chave de API do Gemini"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={handleSave} 
                                disabled={!inputValue.trim()} 
                                className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Salvar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
