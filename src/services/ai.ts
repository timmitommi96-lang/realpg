import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Sport' | 'Lernen' | 'Haushalt' | 'Social' | 'Sonstiges';
  xp: number;
  coins: number;
}

// DeepSeek for text-based tasks
const DEEPSEEK_API_KEY = "sk-0f5ee2214288410f8d82e9c2ddf77591";
const DEEPSEEK_API_URL = "https://api.deepseek.com";

// Google Gemini for image validation
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const aiService = {
  /**
   * Generates daily quests using DeepSeek
   */
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
      const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'Du bist ein hilfreicher Assistent.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) return [];
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to generate quests:', error);
      return [];
    }
  },

  /**
   * Validates quest proof using Google Gemini Vision
   */
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
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to validate proof:', error);
      return { isValid: true, feedback: "Konnte das Bild nicht genau prüfen, aber du siehst aus wie ein Gewinner! Quest erledigt! 🚀" };
    }
  },

  /**
   * Generates custom quest using DeepSeek
   */
  async generateCustomQuest(userGoal: string): Promise<GeneratedQuest | null> {
    const prompt = `
Du bist der Game-Master von "RealPG". Der User möchte eine maßgeschneiderte Quest zu folgendem Ziel:
"${userGoal}"

Erstelle eine kreative, motivierende Quest, die dieses Ziel unterstützt.
Antworte NUR im JSON-Format:
{"title": "...", "description": "...", "difficulty": "Easy/Medium/Hard", "category": "Sport/Lernen/Haushalt/Social/Sonstiges", "xp": 0, "coins": 0}

XP und Münzen basierend auf Schwierigkeit:
- Easy: 15 XP, 5 Münzen
- Medium: 30 XP, 10 Münzen
- Hard: 50 XP, 20 Münzen
`.trim();

    try {
      const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'Du bist ein hilfreicher Assistent.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to generate custom quest:', error);
      return null;
    }
  }
};