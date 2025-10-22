import { GoogleGenAI, Type } from "@google/genai";
import type { ScriptData } from '../types';

const getAiClient = () => {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        throw new Error("Chave de API do Gemini não encontrada. Por favor, adicione-a nas configurações.");
    }
    return new GoogleGenAI({ apiKey });
};

const generateImage = async (storyIdea: string, visualStyle: string): Promise<string> => {
    const ai = getAiClient();
    const userPrompt = `Uma imagem espetacular e cinematográfica em 16:9, no estilo de um pôster de filme. Estilo visual: ${visualStyle}. Baseado na premissa: "${storyIdea}". Se houver qualquer texto visível na imagem (como o título do filme), ele deve estar em português.`;
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: userPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("Nenhuma imagem foi gerada pela API.");
    } catch (error) {
        console.error("Error in generateImage:", error);
        if (error instanceof Error) {
             throw new Error(`Falha ao gerar imagem da API: ${error.message}`);
        }
        throw new Error("Falha ao gerar imagem da API.");
    }
};

const generateScript = async (storyIdea: string, visualStyle: string, duration: string): Promise<ScriptData> => {
    const ai = getAiClient();
    const systemInstruction = `Você é um roteirista mestre. Sua tarefa é gerar um roteiro de filme estruturado. A saída DEVE ser um único objeto JSON, e NADA MAIS.
Este objeto JSON deve ter duas chaves de nível superior: "personagens" e "cenas".

1.  A chave "personagens" deve ser um array de objetos. Cada objeto representa um personagem principal e deve conter duas chaves:
    *   "nome" (string): O nome do personagem.
    *   "descricao" (string): Uma descrição física MUITO detalhada do personagem EM INGLÊS para garantir a consistência visual. Inclua rosto, cabelo, roupas, tipo de corpo, etc.

2.  A chave "cenas" deve ser um array de objetos, onde cada objeto representa uma CENA e deve ter as chaves "cena" e "falas".
    *   Adicionalmente, cada objeto de cena DEVE conter uma chave "detalhes", que é um array de objetos.
    *   CADA objeto dentro de "detalhes" representa uma ÚNICA FRASE ou AÇÃO da história da cena.
    *   Cada um desses objetos de detalhe DEVE ter EXATAMENTE as seguintes chaves: "descricaoHistoria", "promptImagem", e "promptVideo".

CRÍTICO PARA CONSISTÊNCIA: Ao escrever o "promptImagem" e "promptVideo" (ambos em INGLÊS), você DEVE OBRIGATORIAMENTE usar as descrições exatas da chave "personagens" sempre que um personagem aparecer. Por exemplo: 'A medium shot of (a man with short black hair, a scar over his left eye, wearing a worn leather jacket) looking at the city skyline.'

O prompt de vídeo DEVE começar com um ângulo de câmera. IMPORTANTE para o áudio: a música de fundo deve ser sutil e o seu volume deve ser baixo (aproximadamente 20%) para que os diálogos sejam sempre claros. Se houver falas, inclua-as no final do prompt de vídeo no formato 'NOME DO PERSONAGEM: fale em português brasileiro: "A fala aqui entre aspas".'`;
    
    let userQuery: string;
    if (duration === '10 minutos de vídeo') {
        userQuery = `Gere um roteiro com exatamente 100 cenas para um vídeo de 10 minutos no estilo ${visualStyle}, baseado na seguinte premissa: ${storyIdea}.`;
    } else {
        userQuery = `Gere um roteiro de duração ${duration} para um filme no estilo ${visualStyle}, baseado na seguinte premissa: ${storyIdea}.`;
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          personagens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING },
                descricao: { type: Type.STRING }
              },
              required: ["nome", "descricao"]
            }
          },
          cenas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cena: { type: Type.STRING },
                falas: { type: Type.STRING },
                detalhes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      descricaoHistoria: { type: Type.STRING },
                      promptImagem: { type: Type.STRING },
                      promptVideo: { type: Type.STRING }
                    },
                    required: ["descricaoHistoria", "promptImagem", "promptVideo"]
                  }
                }
              },
              required: ["cena", "falas", "detalhes"]
            }
          }
        },
        required: ["personagens", "cenas"]
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userQuery,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScriptData;
    } catch (error) {
        console.error("Error in generateScript:", error);
         if (error instanceof Error) {
             throw new Error(`Falha ao analisar o roteiro da resposta da API: ${error.message}`);
        }
        throw new Error("Falha ao analisar o roteiro da resposta da API.");
    }
};

export const generateScriptAndImage = async (storyIdea: string, visualStyle: string, duration: string) => {
    const [imageResult, scriptResult] = await Promise.allSettled([
        generateImage(storyIdea, visualStyle),
        generateScript(storyIdea, visualStyle, duration)
    ]);
    return { imageResult, scriptResult };
};
