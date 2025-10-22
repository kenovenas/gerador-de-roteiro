export interface Character {
  nome: string;
  descricao: string;
}

export interface SceneDetail {
  descricaoHistoria: string;
  promptImagem: string;
  promptVideo: string;
}

export interface ScriptScene {
  cena: string;
  falas: string;
  detalhes: SceneDetail[];
}

export interface ScriptData {
  personagens: Character[];
  cenas: ScriptScene[];
}

export interface HistoryItem {
  id: string;
  title: string;
  storyIdea: string;
  visualStyle: string;
  duration: string;
  scriptData: ScriptData | null;
  generatedImage: string | null;
}
