
import { GoogleGenAI, Type } from "@google/genai";
import type { ScriptData, SeoPart } from '../types';

// Função auxiliar para obter a chave da API e inicializar o cliente
const getAiClient = () => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
        throw new Error("A chave de API do Gemini não foi configurada. Por favor, adicione-a na seção de configuração.");
    }
    return new GoogleGenAI({ apiKey });
};

const baseInstruction = `Você é um roteirista mestre e especialista em marketing para YouTube. Sua tarefa é gerar um pacote completo de conteúdo. A saída DEVE ser um único objeto JSON, e NADA MAIS.

**REGRA DE OURO DA CONSISTÊNCIA (A MAIS IMPORTANTE):**
Para garantir que os personagens principais tenham uma aparência consistente, a descrição visual detalhada (o "DNA do personagem") criada na seção "personagens" DEVE SER OBRIGATORIAMENTE INCLUÍDA em CADA "promptImagem" e "promptVideo" em que o personagem aparecer. Não pode haver exceções. A falha em incluir esta descrição exata resultará em um roteiro inconsistente e inútil.

Este objeto JSON deve ter três chaves de nível superior: "personagens", "cenas" e "seo".

1.  "personagens": Um array de objetos para os personagens PRINCIPAIS. Cada objeto deve ter:
    *   "nome" (string).
    *   "descricao" (string): Crie uma descrição visual EXTREMAMENTE detalhada do personagem EM INGLÊS. Esta é a 'âncora' de consistência (o "DNA"). Ex: 'a man with short black hair, piercing blue eyes, a faint scar on his left cheek, wearing a worn brown leather jacket over a grey t-shirt, and dark jeans'.

2.  "cenas": Um array de objetos, onde cada objeto de cena tem "cena" (string), "falas" (string), e "detalhes" (um array de objetos).
    *   **REGRA DAS FALAS (NARRADOR E CONCISÃO MÁXIMA):** O campo "falas" é OBRIGATÓRIO para cada cena. Se nenhum personagem estiver falando, use um "NARRADOR". A CONCISÃO É CRÍTICA. Cada 'detalhe' dentro de uma cena representa um take visual de aproximadamente 4 segundos. A fala correspondente a UMA CENA INTEIRA deve ser dimensionada para a sua duração total. A regra é: **NÃO MAIS DE 12 PALAVRAS POR 'DETALHE'**. Por exemplo, se uma cena tem 3 objetos 'detalhes', o campo "falas" para essa cena inteira NÃO PODE EXCEDER 36 palavras (3 * 12). Se tiver 2 'detalhes', o limite é 24 palavras. Esta é uma restrição rígida. As falas devem ser extremamente curtas, impactantes e projetadas para serem ditas confortavelmente dentro do tempo visual da cena.
    *   Cada objeto em "detalhes" representa uma ÚNICA AÇÃO e deve ter "descricaoHistoria" (string), "promptImagem" (string EM INGLÊS), e "promptVideo" (string EM INGLÊS).
    *   **REFORÇO DA REGRA DE OURO:** Para CADA "promptImagem" e "promptVideo", se um personagem da seção "personagens" estiver presente, você DEVE injetar a "descricao" completa e exata dele no prompt.
        *   Exemplo de prompt CORRETO: 'A medium shot of (a man with short black hair, piercing blue eyes, a faint scar on his left cheek, wearing a worn brown leather jacket over a grey t--shirt, and dark jeans) looking worriedly at the rain outside a cafe window.'
        *   Exemplo de prompt INCORRETO: 'A medium shot of John looking worriedly...' -> ISTO ESTÁ ERRADO porque não contém a descrição completa do "DNA" do personagem.
    *   O prompt de vídeo DEVE começar com um ângulo de câmera e incluir diálogos no formato 'NOME DO PERSONAGEM: fale em português brasileiro: "A fala aqui."'.

3.  "seo": Um objeto contendo material de marketing para o YouTube, baseado na história.
    *   "titulos" (array de 5 strings): Crie 5 títulos de vídeo impactantes e que gerem curiosidade.
    *   "descricao" (string): Escreva uma descrição de vídeo bem elaborada. Comece com um resumo da história, depois adicione um parágrafo genérico incentivando a interação e finalize com uma Chamada Para Ação (CTA) clara, pedindo para se inscrever, curtir e comentar.
    *   "promptsThumbnail" (array de 3 strings): Crie 3 prompts de imagem detalhados (EM INGLÊS) para gerar uma thumbnail de vídeo clicável. Pense em contraste, emoção e clareza.
    *   "tags" (array de strings): Gere uma lista de tags de SEO relevantes para o YouTube, incluindo temas gerais e específicos da história.

REGRAS ESPECIAIS PARA ROTEIROS DE VÍDEO:
1.  É ESSENCIAL que o roteiro contenha diálogos e falas consistentes do início ao fim.
2.  AS CENAS FINAIS (últimas 2 ou 3) DEVEM OBRIGATORIAMENTE incluir uma chamada para ação (call to action), pedindo ao público para se inscrever, deixar 'like' e ativar notificações.
3.  **CONTAGEM DE CENAS É A PRIORIDADE MÁXIMA E INEGOCIÁVEL:** Se for solicitado um roteiro de vídeo, a instrução sobre o número de cenas (10 por minuto) TEM PRECEDÊNCIA ABSOLUTA sobre qualquer outra diretriz de estilo ou conteúdo. O número de objetos no array 'cenas' DEVE ser exatamente o número solicitado.`;

const biblicalSystemInstruction = `**DIRETRIZ FUNDAMENTAL OBRIGATÓRIA: BASE BÍBLICA**
Todas as histórias, personagens e eventos gerados DEVEM ser estritamente baseados em passagens da Bíblia Sagrada. A fidelidade ao texto bíblico é a prioridade máxima. É expressamente PROIBIDO inventar eventos, diálogos, personagens ou elementos fantásticos que não tenham base direta nas Escrituras. O objetivo é dramatizar as histórias bíblicas, não criar ficção nova.
${baseInstruction}`;

const infantilSystemInstruction = `**DIRETRIZ FUNDAMENTAL OBRIGATÓRIA: CONTO INFANTIL**
Você é um contador de histórias mágico para crianças. Todas as histórias devem ser adequadas para o público infantil, com linguagem simples, personagens cativantes e uma moral positiva e clara no final. EVITE violência, temas assustadores ou complexos. O objetivo é criar contos de fadas ou fábulas encantadoras que ensinem e divirtam.
${baseInstruction}`;

const getSystemInstruction = (theme: string) => {
    switch (theme) {
        case 'História Bíblica':
            return biblicalSystemInstruction;
        case 'Conto de Fadas Infantil':
            return infantilSystemInstruction;
        default:
            return baseInstruction; // Instrução genérica para outros temas
    }
};

const handleApiError = (error: unknown) => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        let userFriendlyMessage = error.message;
        // Attempt to parse a more specific error message from the API response
        try {
            // Error messages from the API are often stringified JSON within the `message` property
            const apiError = JSON.parse(userFriendlyMessage);
            if (apiError?.error?.message) {
                if (apiError.error.code === 503 || apiError.error.status === "UNAVAILABLE") {
                    userFriendlyMessage = "O modelo de IA está sobrecarregado. Tente novamente mais tarde.";
                } else {
                    userFriendlyMessage = apiError.error.message;
                }
            }
        } catch (e) {
            // Not a JSON error, which is fine. The original message will be used.
        }
        throw new Error(userFriendlyMessage);
    }
    throw new Error("Ocorreu um erro desconhecido ao se comunicar com a API.");
};


export const generateScript = async (
    storyIdea: string,
    theme: string,
    visualStyle: string,
    duration: string,
    titleInstruction: string,
    descriptionInstruction: string,
    thumbnailInstruction: string,
    videoDurationMinutes: number
): Promise<ScriptData> => {
    const ai = getAiClient();
    
    let userQuery: string;
    const baseQuery = `Premissa da história: ${storyIdea}. Tema: ${theme}. Estilo visual: ${visualStyle}.`;
    const seoInstructions = `
Instruções para Títulos: ${titleInstruction || 'Padrão: gerar curiosidade e ser impactante.'}
Instruções para Descrição: ${descriptionInstruction || 'Padrão: resumir a história e adicionar CTA.'}
Instruções para Thumbnail: ${thumbnailInstruction || 'Padrão: cores vibrantes, mostrar emoção.'}
`;

    if (duration === 'Vídeo') {
        const numScenes = Math.max(videoDurationMinutes * 10, 10);
        userQuery = `Gere um roteiro para um vídeo. REQUISITO ESTRITO E PRIORIDADE MÁXIMA: A duração do vídeo é de ${videoDurationMinutes} minutos e o roteiro DEVE conter EXATAMENTE ${numScenes} cenas no total (10 cenas por minuto). Esta é uma regra inegociável e a principal instrução para esta tarefa. ${baseQuery} ${seoInstructions}`;
    } else {
        const durationQuery = `Duração: ${duration}.`;
        userQuery = `Gere um roteiro de filme e o conteúdo SEO correspondente. ${baseQuery} ${durationQuery} ${seoInstructions}`;
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
        const systemInstruction = getSystemInstruction(theme);
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
       handleApiError(error);
       throw error; // Re-throw to be caught by the UI
    }
};

export const regenerateSeoPart = async (
    part: SeoPart,
    storyIdea: string,
    scriptData: ScriptData,
    instructions: string
): Promise<Partial<ScriptData['seo']>> => {
    const ai = getAiClient();
    const systemInstruction = `Você é um especialista em marketing para YouTube. Sua tarefa é regenerar UMA parte específica do conteúdo de SEO para um vídeo, com base em novas instruções. Forneça a saída APENAS como um objeto JSON contendo a chave solicitada.`;

    const userQuery = `O roteiro é sobre: "${storyIdea}".
    
Instrução para regeneração: "${instructions}"

Regenere a seguinte parte do SEO: "${part}".

Contexto do roteiro existente (para sua referência):
${JSON.stringify({ personagens: scriptData.personagens, cenas: scriptData.cenas.slice(0, 3) })}
`;
    
    let responseSchema: any;
    switch (part) {
        case 'titulos':
            responseSchema = { type: Type.OBJECT, properties: { titulos: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["titulos"] };
            break;
        case 'descricao':
            responseSchema = { type: Type.OBJECT, properties: { descricao: { type: Type.STRING } }, required: ["descricao"] };
            break;
        case 'promptsThumbnail':
            responseSchema = { type: Type.OBJECT, properties: { promptsThumbnail: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["promptsThumbnail"] };
            break;
        case 'tags':
            responseSchema = { type: Type.OBJECT, properties: { tags: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["tags"] };
            break;
        default:
            throw new Error("Parte de SEO inválida para regeneração.");
    }

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
        return JSON.parse(jsonText) as Partial<ScriptData['seo']>;
    } catch (error) {
        handleApiError(error);
        throw error; // Re-throw to be caught by the UI
    }
};
