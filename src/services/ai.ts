import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Sport' | 'Lernen' | 'Haushalt' | 'Social' | 'Sonstiges';
  xp: number;
  coins: number;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyD-0O7zeLQTRuZIPQKUF8VdB4p761RKSjA";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const aiService = {
  async generateDailyQuests(userProfile: any): Promise<GeneratedQuest[]> {
    const prompt = `
Du bist der Game-Master von "RealPG", der besten Self-Improvement App der Welt. 
Generiere 5-7 maßgeschneiderte Real-Life Quests basierend auf diesem Helden-Profil:

Helden-Profil:
- Name: ${userProfile.nickname || "Held"}
- Alter: ${userProfile.age || "Unbekannt"}
- Hauptziel: ${userProfile.primary_goal || "Selbstverbesserung"}
- Hobbys: ${userProfile.hobbies || "Allgemein"}
- Quest-Intensität: ${userProfile.quest_level || "Mittelschwer"}
- Verfügbare Zeit: ${userProfile.daily_time || "30 Min"} pro Tag

Regeln:
1. Sei kreativ, motivierend und humorvoll.
2. Kategorien: Sport, Lernen, Haushalt, Social, Sonstiges.
3. XP/Münzen basierend auf Intensität:
   - Ganz leicht: 10 XP, 3 Münzen
   - Mittelschwer: 25 XP, 8 Münzen
   - Hardcore: 50 XP, 15 Münzen

Antworte NUR im JSON-Format als Array:
[{"title": "...", "description": "...", "difficulty": "Easy/Medium/Hard", "category": "Sport/Lernen/Haushalt/Social/Sonstiges", "xp": 0, "coins": 0}]
`.trim();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to generate quests:', error);
      return [];
    }
  },

  async validateProof(base64Image: string, questDescription: string): Promise<{ isValid: boolean; feedback: string }> {
    if (!base64Image) {
      return { isValid: false, feedback: "Wo ist das Foto? 😉" };
    }

    if (!GEMINI_API_KEY) {
      return { isValid: true, feedback: "Quest erledigt! 🚀 Sehr gut gemacht!" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Schau dir das Foto an. Der User sagt, er hat damit die Quest "${questDescription}" erledigt.

Sei locker, motivierend und feiere den User ein bisschen. Wenn das Foto auch nur ansatzweise zeigt, dass der User sich Mühe gegeben hat, lass es gelten.

Antworte NUR im JSON-Format:
{"isValid": true/false, "feedback": "Ein begeisterter, lockerer Satz als Feedback"}
`.trim();

    try {
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{"isValid": true, "feedback": "Quest erledigt! 🚀"}';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to validate proof:', error);
      return { isValid: true, feedback: "Quest erledigt! 🚀 Sehr gut gemacht!" };
    }
  },

  async generateCustomQuest(goal: string): Promise<GeneratedQuest | null> {
    const prompt = `
Du bist der Game-Master von "RealPG". Der User möchte eine eigene Quest erstellen.

User-Wunsch: "${goal}"

Erstelle eine passende Quest mit:
- title: Kurzer, knackiger Titel
- description: Motivierende Beschreibung (2-3 Sätze)
- difficulty: Easy/Medium/Hard (basierend auf dem Wunsch)
- category: Sport/Lernen/Haushalt/Social/Sonstiges
- xp: 10-50 (basierend auf Schwierigkeit)
- coins: 3-15 (basierend auf Schwierigkeit)

Antworte NUR im JSON-Format:
{"title": "...", "description": "...", "difficulty": "Easy/Medium/Hard", "category": "...", "xp": 0, "coins": 0}
`.trim();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to generate custom quest:', error);
      return null;
    }
  },
};
