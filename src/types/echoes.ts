export type EncounterMood =
  | "reflective"
  | "tired"
  | "guarded"
  | "fearful"
  | "hopeful"
  | "resilient"
  | "solemn";

export type UncertaintyLevel = "grounded" | "interpretive" | "speculative";

export type AmbientProfile = "railroad-camp" | "field-ward" | "harbor-hall";

export type PersonaSource = {
  id: string;
  title: string;
  creator: string;
  year: string;
  snippet: string;
  context: string;
};

export type PersonaRecord = {
  slug: string;
  name: string;
  shortLabel: string;
  role: string;
  era: string;
  location: string;
  introLine: string;
  disclosure: string;
  sceneDescription: string;
  accentColor: string;
  accentGlow: string;
  sceneWash: string;
  historicalImageUrl?: string;
  historicalImageSourceUrl?: string;
  voiceId?: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
  ambientProfile: AmbientProfile;
  starterPrompts: string[];
  sourcePackets: PersonaSource[];
};

export type EncounterSourceAttribution = PersonaSource & {
  relevance: string;
};

export type EncounterMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  mood?: EncounterMood;
  uncertaintyLevel?: UncertaintyLevel;
  audioUrl?: string;
  sources?: EncounterSourceAttribution[];
};

export type EncounterReply = {
  message: EncounterMessage;
};
