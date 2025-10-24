import React from 'react';

export const Header: React.FC = () => (
    <header className="text-center">
        <h2 className="text-sm font-bold tracking-widest text-purple-400 uppercase">Roteiro Prime</h2>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 my-2">
            Gerador de Roteiros com IA
        </h1>
        <p className="text-md sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Transforme passagens bíblicas em roteiros completos, prontos para produção.
        </p>
    </header>
);