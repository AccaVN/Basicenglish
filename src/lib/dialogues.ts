import rawDialogues from "../../data/dialogues.json";

export type DialogueTurn = {
  speaker: string;
  en: string;
  vi: string;
};

export type Dialogue = {
  title: string;
  situation: string;
  turns: DialogueTurn[];
};

// Scripted dialogues ported from english-toeic300. These are fixed scripts,
// not free-form AI conversations: the learner always plays speaker B and
// speaks the reply that is already shown on screen.
export const DIALOGUES: Dialogue[] = (rawDialogues as Array<Record<string, unknown>>).map((d) => ({
  title: String(d.title ?? ""),
  situation: String(d.situation ?? ""),
  turns: (Array.isArray(d.turns) ? d.turns : []).map((t) => {
    const turn = t as Record<string, unknown>;
    return {
      speaker: String(turn.speaker ?? ""),
      en: String(turn.en ?? ""),
      vi: String(turn.vi ?? ""),
    };
  }),
}));
