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

export interface SeoData {
  titulos: string[];
  descricao: string;
  promptsThumbnail: string[];
  tags: string[];
}

export interface ScriptData {
  personagens: Character[];
  cenas: ScriptScene[];
  seo: SeoData;
}

export interface HistoryItem {
  id: string;
  title: string;
  projectName: string;
  storyIdea: string;
  visualStyle: string;
  duration: string;
  titleInstruction: string;
  descriptionInstruction: string;
  thumbnailInstruction: string;
  scriptData: ScriptData | null;
  generatedImage: string | null;
}