import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeneratedQuest {
  cloudId?: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Sport' | 'Lernen' | 'Haushalt' | 'Social' | 'Sonstiges';
  xp: number;
  coins: number;
}

const QUEST_TEMPLATES = [
  { category: 'Sport', templates: [
    { title: '10 Minuten Stretching', description: 'Mach 10 Minuten leichtes Stretching um deinen Körper zu lockern.', difficulty: 'Easy' as const, xp: 15, coins: 5 },
    { title: '15 Kniebeugen', description: 'Mache 15 Kniebeugen um deine Beinmuskeln zu stärken.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: '20 Liegestütze', description: 'Schaffe 20 Liegestütze in maximal 3 Sätzen.', difficulty: 'Medium' as const, xp: 30, coins: 12 },
    { title: '10 Minuten Yoga', description: 'Folge einem 10-minütigen Yoga-Video oder App.', difficulty: 'Easy' as const, xp: 25, coins: 10 },
    { title: '30 Minuten Spaziergang', description: 'Gehe mindestens 30 Minuten spazieren an der frischen Luft.', difficulty: 'Easy' as const, xp: 35, coins: 15 },
    { title: '100 Sprünge', description: 'Mache 100 Sprünge (Seilspringen oder Jumping Jacks).', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Plank 60 Sekunden', description: 'Halte die Plank-Position für mindestens 60 Sekunden.', difficulty: 'Medium' as const, xp: 35, coins: 15 },
    { title: '15 Minuten HIIT', description: 'Mache ein 15-minütiges HIIT-Training.', difficulty: 'Hard' as const, xp: 60, coins: 25 },
    { title: '50 Squats', description: 'Mache 50 Squats um deine Beine zu trainieren.', difficulty: 'Medium' as const, xp: 45, coins: 20 },
    { title: 'Armübungen 5 Min', description: 'Mache 5 Minuten Armübungen mit oder ohne Gewichte.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
  ]},
  { category: 'Lernen', templates: [
    { title: '30 Minuten lesen', description: 'Lies 30 Minuten in einem Buch oder E-Book.', difficulty: 'Easy' as const, xp: 30, coins: 12 },
    { title: 'Vokabeln lernen', description: 'Lerne 10 neue Vokabeln oder Begriffe.', difficulty: 'Easy' as const, xp: 25, coins: 10 },
    { title: 'Tutorial schauen', description: 'Schau dir ein Tutorial zu einem Thema deiner Wahl an (15+ Min).', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Notizen überarbeiten', description: 'Gehe deine letzten Notizen durch und strukturiere sie.', difficulty: 'Medium' as const, xp: 35, coins: 15 },
    { title: 'Online-Kurs', description: 'Mache mindestens eine Lektion in einem Online-Kurs.', difficulty: 'Medium' as const, xp: 50, coins: 20 },
    { title: 'Mindmap erstellen', description: 'Erstelle eine Mindmap zu einem Thema das du lernst.', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Flashcards nutzen', description: 'Wiederhole 20 Flashcards zu einem Thema.', difficulty: 'Easy' as const, xp: 25, coins: 10 },
    { title: 'Sprach-App 10 Min', description: 'Übe 10 Minuten mit einer Sprachlern-App.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'YouTube Edu-Video', description: 'Sieh dir ein informatives Bildungs-Video auf YouTube an.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Zusammenfassung schreiben', description: 'Schreibe eine Zusammenfassung von 200+ Wörtern zu einem Thema.', difficulty: 'Medium' as const, xp: 45, coins: 18 },
  ]},
  { category: 'Haushalt', templates: [
    { title: 'Zimmer aufräumen', description: 'Räume dein Zimmer oder einen Bereich komplett auf.', difficulty: 'Easy' as const, xp: 30, coins: 12 },
    { title: 'Geschirr spülen', description: 'Spüle alle schmutzigen Teller und Besteck.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Staub wischen', description: 'Wische alle Oberflächen in einem Raum ab.', difficulty: 'Easy' as const, xp: 25, coins: 10 },
    { title: 'Boden saugen', description: 'Sauge den Boden in mindestens 2 Räumen.', difficulty: 'Medium' as const, xp: 35, coins: 15 },
    { title: 'Wäsche waschen', description: 'Wasche, trockne und/oder falte deine Wäsche.', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Müll rausbringen', description: 'Bring den Müll raus und wechsle die Beutel.', difficulty: 'Easy' as const, xp: 15, coins: 5 },
    { title: 'Bad putzen', description: 'Putze das Badezimmer (Toilette, Waschbecken, Spiegel).', difficulty: 'Hard' as const, xp: 55, coins: 25 },
    { title: 'Küche reinigen', description: 'Reinige die Küche: Arbeitsplatte, Herd, Spüle.', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Bett machen', description: 'Mach dein Bett und wechsle ggf. die Bettwäsche.', difficulty: 'Easy' as const, xp: 10, coins: 5 },
    { title: 'Schreibtisch organisieren', description: 'Organisiere deinen Schreibtisch und entsorge Papierkram.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
  ]},
  { category: 'Social', templates: [
    { title: 'Freund anrufen', description: 'Führe ein Telefonat oder Video-Call mit einem Freund (10+ Min).', difficulty: 'Easy' as const, xp: 35, coins: 15 },
    { title: 'Familie kontaktieren', description: 'Schreibe oder rufe ein Familienmitglied an.', difficulty: 'Easy' as const, xp: 30, coins: 12 },
    { title: 'Neue Person kennenlernen', description: 'Sprich mit jemandem den du noch nicht gut kennst.', difficulty: 'Medium' as const, xp: 50, coins: 20 },
    { title: 'Gruppenaktivität', description: 'Nimm an einer Gruppenaktivität oder Club teil.', difficulty: 'Hard' as const, xp: 70, coins: 30 },
    { title: 'Kompliment geben', description: 'Mache jemandem ein echtes Kompliment heute.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Danke sagen', description: 'Bedanke dich bei jemandem persönlich für etwas.', difficulty: 'Easy' as const, xp: 15, coins: 5 },
    { title: 'Geburtstag planen', description: 'Plane eine Überraschung oder Feier für jemanden.', difficulty: 'Hard' as const, xp: 80, coins: 35 },
    { title: 'Social Media Pause', description: 'Verbringe 2 Stunden ohne Social Media und rede mit echten Menschen.', difficulty: 'Medium' as const, xp: 45, coins: 20 },
    { title: 'Ehrenamt', description: 'Engagiere dich 30+ Minuten für eine gute Sache.', difficulty: 'Hard' as const, xp: 90, coins: 40 },
    { title: 'Gemeinsam kochen', description: 'Koche zusammen mit jemandem ein Gericht.', difficulty: 'Medium' as const, xp: 55, coins: 25 },
  ]},
  { category: 'Sonstiges', templates: [
    { title: 'Meditieren 5 Min', description: 'Meditiere für mindestens 5 Minuten in Ruhe.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Tagebuch schreiben', description: 'Schreibe 3 Dinge auf für die du heute dankbar bist.', difficulty: 'Easy' as const, xp: 25, coins: 10 },
    { title: 'Planung für morgen', description: 'Plane und strukturiere deinen morgigen Tag.', difficulty: 'Easy' as const, xp: 20, coins: 8 },
    { title: 'Budget prüfen', description: 'Überprüfe deine Ausgaben und Einnahmen der letzten Woche.', difficulty: 'Medium' as const, xp: 35, coins: 15 },
    { title: 'Neues Rezept kochen', description: 'Koche ein neues Gericht das du noch nie gemacht hast.', difficulty: 'Medium' as const, xp: 55, coins: 25 },
    { title: 'Kreativ sein', description: 'Male, zeichne oder mach etwas Kreatives für 20+ Minuten.', difficulty: 'Medium' as const, xp: 45, coins: 20 },
    { title: 'Digital aufräumen', description: 'Räume deine Downloads, Fotos oder Dateien auf.', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Neue App lernen', description: 'Lerne eine neue App oder ein Tool zu benutzen.', difficulty: 'Medium' as const, xp: 40, coins: 18 },
    { title: 'Wasser trinken', description: 'Trinke heute mindestens 2 Liter Wasser.', difficulty: 'Easy' as const, xp: 15, coins: 5 },
    { title: '8 Stunden schlafen', description: 'Gehe zeitig ins Bett und schlafe mindestens 8 Stunden.', difficulty: 'Easy' as const, xp: 30, coins: 12 },
  ]},
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateLocalQuest(forcedCategory?: string): GeneratedQuest {
  const category = forcedCategory || getRandomItem(QUEST_TEMPLATES).category;
  const categoryData = QUEST_TEMPLATES.find(c => c.category === category) || getRandomItem(QUEST_TEMPLATES);
  const template = getRandomItem(categoryData.templates);
  
  const difficultyMultiplier = Math.random();
  let xp = template.xp;
  let coins = template.coins;
  
  if (difficultyMultiplier > 0.7) {
    xp = Math.round(xp * 1.5);
    coins = Math.round(coins * 1.5);
  } else if (difficultyMultiplier < 0.3) {
    xp = Math.round(xp * 0.7);
    coins = Math.round(coins * 0.7);
  }
  
  return {
    title: template.title,
    description: template.description,
    difficulty: template.difficulty,
    category: category as GeneratedQuest['category'],
    xp,
    coins,
  };
}

const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

function extractJsonObject(raw: string): any | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function callGemini(prompt: string, imageBase64?: string): Promise<string | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.log('Gemini error:', error);
    return null;
  }
}

async function generateAIQuest(goal: string): Promise<GeneratedQuest | null> {
  const prompt = `Erstelle genau EINE Quest auf Deutsch zum Ziel "${goal}".
Antworte nur als JSON:
{"title":"...","description":"...","difficulty":"Easy|Medium|Hard","category":"Sport|Lernen|Haushalt|Social|Sonstiges","xp":15-100,"coins":5-40}`;
  const responseText = await callGemini(prompt);
  const questData = responseText ? extractJsonObject(responseText) : null;
  if (questData?.title && questData?.description) {
    return {
      title: String(questData.title).substring(0, 50),
      description: String(questData.description).substring(0, 200),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(questData.difficulty) ? questData.difficulty as GeneratedQuest['difficulty'] : 'Medium',
      category: ['Sport', 'Lernen', 'Haushalt', 'Social', 'Sonstiges'].includes(questData.category) ? questData.category as GeneratedQuest['category'] : 'Sonstiges',
      xp: Math.max(15, Math.min(100, Number(questData.xp) || 30)),
      coins: Math.max(5, Math.min(40, Number(questData.coins) || 15)),
    };
  }

  if (goal) {
    const matched = QUEST_TEMPLATES.find((entry) =>
      goal.toLowerCase().includes(entry.category.toLowerCase())
    );
    if (matched) {
      const template = getRandomItem(matched.templates);
      return {
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        category: matched.category as GeneratedQuest['category'],
        xp: template.xp,
        coins: template.coins,
      };
    }
  }

  return generateLocalQuest();
}

async function validateWithAI(base64Image: string, questDescription: string): Promise<{ isValid: boolean; feedback: string }> {
  const prompt = `Pruefe, ob das Bild diese Quest erfuellt: "${questDescription}".
Antworte nur als JSON:
{"isValid":true|false,"feedback":"Kurzes Feedback auf Deutsch (max 2 Saetze)"}`;
  const responseText = await callGemini(prompt, base64Image);
  const response = responseText ? extractJsonObject(responseText) : null;
  if (response && typeof response.isValid === 'boolean') {
    return {
      isValid: response.isValid,
      feedback: String(response.feedback || 'Gut gemacht!'),
    };
  }

  return { isValid: true, feedback: "Quest erledigt! 🚀 Sehr gut gemacht!" };
}

export const aiService = {
  async generateDailyQuests(userProfile: any): Promise<GeneratedQuest[]> {
    const count = 5;
    const quests: GeneratedQuest[] = [];
    
    const primaryCategory = userProfile?.primary_category || 'Sport';
    const categories = [primaryCategory, ...shuffleArray(['Sport', 'Lernen', 'Haushalt', 'Social', 'Sonstiges'].filter(c => c !== primaryCategory)).slice(0, 4)];
    
    for (let i = 0; i < count; i++) {
      quests.push(generateLocalQuest(categories[i]));
    }
    
    return shuffleArray(quests);
  },

  async validateProof(base64Image: string, questDescription: string): Promise<{ isValid: boolean; feedback: string }> {
    if (!base64Image) {
      return { isValid: false, feedback: "Wo ist das Foto? 😉" };
    }
    
    return validateWithAI(base64Image, questDescription);
  },

  async generateCustomQuest(goal: string): Promise<GeneratedQuest | null> {
    return generateAIQuest(goal);
  },
};
