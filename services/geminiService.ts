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

const generateScript = async (
    storyIdea: string,
    visualStyle: string,
    duration: string,
    titleInstruction: string,
    descriptionInstruction: string,
    thumbnailInstruction: string
): Promise<ScriptData> => {
    const ai = getAiClient();
    const systemInstruction = `Você é um roteirista mestre e especialista em marketing para YouTube. Sua tarefa é gerar um pacote completo de conteúdo. A saída DEVE ser um único objeto JSON, e NADA MAIS.
Este objeto JSON deve ter três chaves de nível superior: "personagens", "cenas" e "seo".

1.  "personagens": Um array de objetos, cada um com "nome" (string) e "descricao" (string MUITO detalhada EM INGLÊS para consistência visual).

2.  "cenas": Um array de objetos, onde cada objeto de cena tem "cena" (string), "falas" (string), e "detalhes" (um array de objetos).
    *   IMPORTANTE: As "falas" de cada cena DEVEM ser concisas, cabendo confortavelmente em 5 segundos de tempo de tela para manter um ritmo rápido e dinâmico.
    *   Cada objeto em "detalhes" representa uma ÚNICA AÇÃO e deve ter "descricaoHistoria" (string), "promptImagem" (string EM INGLÊS), e "promptVideo" (string EM INGLÊS).
    *   CRÍTICO: Os prompts de imagem e vídeo DEVEM usar as descrições exatas dos personagens. Ex: 'A medium shot of (a man with short black hair, wearing a worn leather jacket)...'
    *   O prompt de vídeo DEVE começar com um ângulo de câmera e incluir diálogos no formato 'NOME DO PERSONAGEM: fale em português brasileiro: "A fala aqui."'.

3.  "seo": Um objeto contendo material de marketing para o YouTube, baseado na história.
    *   "titulos" (array de 5 strings): Crie 5 títulos de vídeo impactantes e que gerem curiosidade.
    *   "descricao" (string): Escreva uma descrição de vídeo bem elaborada. Comece com um resumo da história, depois adicione um parágrafo genérico incentivando a interação e finalize com uma Chamada Para Ação (CTA) clara, pedindo para se inscrever, curtir e comentar.
    *   "promptsThumbnail" (array de 3 strings): Crie 3 prompts de imagem detalhados (EM INGLÊS) para gerar uma thumbnail de vídeo clicável. Pense em contraste, emoção e clareza.
    *   "tags" (array de strings): Gere uma lista de tags de SEO relevantes para o YouTube, incluindo temas gerais e específicos da história.

REGRAS ESPECIAIS PARA ROTEIROS DE VÍDEO (10 minutos):
1.  É ESSENCIAL que o roteiro contenha diálogos e falas consistentes do início ao fim.
2.  As CENAS FINAIS (últimas 2 ou 3) DEVEM OBRIGATORIAMENTE incluir uma chamada para ação (call to action), pedindo ao público para se inscrever, deixar 'like' e ativar notificações.`;
    
    let userQuery: string;
    const baseQuery = `Premissa da história: ${storyIdea}. Estilo visual: ${visualStyle}. Duração: ${duration}.`;
    const seoInstructions = `
Instruções para Títulos: ${titleInstruction || 'Padrão: gerar curiosidade e ser impactante.'}
Instruções para Descrição: ${descriptionInstruction || 'Padrão: resumir a história e adicionar CTA.'}
Instruções para Thumbnail: ${thumbnailInstruction || 'Padrão: cores vibrantes, mostrar emoção.'}
`;

    if (duration === '10 minutos de vídeo') {
        userQuery = `Gere um roteiro com exatamente 100 cenas para um vídeo de 10 minutos e o conteúdo SEO correspondente. ${baseQuery} ${seoInstructions}`;
    } else {
        userQuery = `Gere um roteiro de filme e o conteúdo SEO correspondente. ${baseQuery} ${seoInstructions}`;
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
          },
          seo: {
            type: Type.OBJECT,
            properties: {
              titulos: { type: Type.ARRAY, items: { type: Type.STRING } },
              descricao: { type: Type.STRING },
              promptsThumbnail: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["titulos", "descricao", "promptsThumbnail", "tags"]
          }
        },
        required: ["personagens", "cenas", "seo"]
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
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

export const generateScriptAndImage = async (
    storyIdea: string,
    visualStyle: string,
    duration: string,
    titleInstruction: string,
    descriptionInstruction: string,
    thumbnailInstruction: string
) => {
    const [imageResult, scriptResult] = await Promise.allSettled([
        generateImage(storyIdea, visualStyle),
        generateScript(storyIdea, visualStyle, duration, titleInstruction, descriptionInstruction, thumbnailInstruction)
    ]);
    return { imageResult, scriptResult };
};