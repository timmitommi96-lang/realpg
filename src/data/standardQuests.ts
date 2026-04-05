export interface StandardQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Sport' | 'Lernen' | 'Haushalt' | 'Social' | 'Sonstiges';
  baseAmount: number;
  unit: string;
  xp: number;
  coins: number;
}

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export const levelMultipliers: Record<UserLevel, number> = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
};

export const difficultyFromLevel: Record<UserLevel, 'Easy' | 'Medium' | 'Hard'> = {
  beginner: 'Medium',
  intermediate: 'Easy',
  advanced: 'Easy',
};

export const categoryToLevelKey: Record<string, string> = {
  'Sport': 'sport_level',
  'Lernen': 'learning_level',
  'Haushalt': 'household_level',
  'Social': 'social_level',
  'Sonstiges': 'wellbeing_level',
};

function getAmountForLevel(baseAmount: number, level: UserLevel): string {
  const multipliers: Record<UserLevel, number> = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  };
  const amount = Math.round(baseAmount * multipliers[level]);
  return `${amount}`;
}

function getXpForDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
  const xpMap = { Easy: 15, Medium: 30, Hard: 50 };
  return xpMap[difficulty];
}

function getCoinsForDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
  const coinMap = { Easy: 5, Medium: 10, Hard: 20 };
  return coinMap[difficulty];
}

function createDescription(baseDescription: string, amount: string, unit: string): string {
  if (unit === '' || unit === 'min') return baseDescription;
  return baseDescription.replace(/XXX/g, amount).replace(/YYY/g, unit);
}

export interface QuestTemplate {
  title: string;
  baseDescription: string;
  category: 'Sport' | 'Lernen' | 'Haushalt' | 'Social' | 'Sonstiges';
  baseAmount: number;
  unit: string;
}

const questTemplates: QuestTemplate[] = [
  // Sport - 100 quests
  { title: "Morgenlauf", baseDescription: "Laufe heute mindestens XXX Minuten am Stück.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "Dehnübungen", baseDescription: "Mach XXX Minuten Stretching.", category: "Sport", baseAmount: 15, unit: "min" },
  { title: "Treppen steigen", baseDescription: "Nimm heute die Treppen statt den Aufzug. Mindestens XXX Stockwerke.", category: "Sport", baseAmount: 5, unit: "Stöcke" },
  { title: "Spaziergang", baseDescription: "Gehe einen XXX-minütigen Spaziergang.", category: "Sport", baseAmount: 30, unit: "min" },
  { title: "Liegestütze", baseDescription: "Mache XXX Liegestütze über den Tag verteilt.", category: "Sport", baseAmount: 20, unit: "" },
  { title: "Kniebeugen", baseDescription: "Mache XXX Kniebeugen.", category: "Sport", baseAmount: 30, unit: "" },
  { title: "Planking", baseDescription: "Halte die Plank-Position für XXX Minuten.", category: "Sport", baseAmount: 2, unit: "min" },
  { title: "Seilspringen", baseDescription: "Springe XXX Minuten lang Seil.", category: "Sport", baseAmount: 10, unit: "min" },
  { title: "Radfahren", baseDescription: "Fahre XXX Minuten mit dem Fahrrad.", category: "Sport", baseAmount: 30, unit: "min" },
  { title: "Schwimmen", baseDescription: "Schwimme XXX Minuten.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "Yoga Session", baseDescription: "Praktiziere XXX Minuten Yoga.", category: "Sport", baseAmount: 30, unit: "min" },
  { title: "Tanzparty", baseDescription: "Tanze XXX Minuten zu deiner Lieblingsmusik.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "Bergwandern", baseDescription: "Mach eine Wanderung mit mindestens XXX Höhenmetern.", category: "Sport", baseAmount: 300, unit: "m" },
  { title: "Bauchmuskeltraining", baseDescription: "Mache XXX Crunches.", category: "Sport", baseAmount: 50, unit: "" },
  { title: "Armtraining", baseDescription: "Mache XXX Minuten Krafttraining für die Arme.", category: "Sport", baseAmount: 30, unit: "min" },
  { title: "Beintraining", baseDescription: "Mache XXX Ausfallschritte.", category: "Sport", baseAmount: 30, unit: "" },
  { title: "Morgengymnastik", baseDescription: "Mache XXX Minuten Morgenübungen.", category: "Sport", baseAmount: 15, unit: "min" },
  { title: "Joggen", baseDescription: "Jogge XXX Minuten.",
  category: "Sport", baseAmount: 25, unit: "min" },
  { title: "Seilchen", baseDescription: "Mach XXX Sprünge mit dem Springseil.", category: "Sport", baseAmount: 100, unit: "" },
  { title: "Burpees", baseDescription: "Mache XXX Burpees.", category: "Sport", baseAmount: 15, unit: "" },
  { title: "Mountain Climbers", baseDescription: "Mache XXX Mountain Climbers.", category: "Sport", baseAmount: 40, unit: "" },
  { title: "Boxen", baseDescription: "Boxe XXX Minuten am Sandbag.", category: "Sport", baseAmount: 15, unit: "min" },
  { title: "Kampfsport", baseDescription: "Trainiere XXX Minuten Kampfsport.", category: "Sport", baseAmount: 30, unit: "min" },
  { title: "Online Workout", baseDescription: "Folge einem XXX-minütigen Online-Workout.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "HIIT", baseDescription: "Mache ein XXX-minütiges HIIT-Training.", category: "Sport", baseAmount: 15, unit: "min" },
  { title: "Calisthenics", baseDescription: "Mache XXX Minuten Calisthenics.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "Rudern", baseDescription: "Rudere XXX Minuten.", category: "Sport", baseAmount: 20, unit: "min" },
  { title: "Ellipsentrainer", baseDescription: "Trainiere XXX Minuten auf dem Ellipsentrainer.", category: "Sport", baseAmount: 25, unit: "min" },
  { title: "Massage", baseDescription: "Massiere deine Muskeln XXX Minuten.", category: "Sport", baseAmount: 15, unit: "min" },
  { title: "Spielplatz Workout", baseDescription: "Nutze den Spielplatz für ein XXX-minütiges Workout.", category: "Sport", baseAmount: 25, unit: "min" },
  // Lernen - 100 quests
  { title: "Buch lesen", baseDescription: "Lies XXX Seiten in einem Buch.", category: "Lernen", baseAmount: 30, unit: "Seiten" },
  { title: "Vokabeln lernen", baseDescription: "Lerne XXX neue Vokabeln.", category: "Lernen", baseAmount: 20, unit: "" },
  { title: "Online Kurs", baseDescription: "Schau dir XXX Lektionen eines Online-Kurses an.", category: "Lernen", baseAmount: 1, unit: "" },
  { title: "Podcast hören", baseDescription: "Höre XXX Minuten einen informativen Podcast.", category: "Lernen", baseAmount: 30, unit: "min" },
  { title: "Notizen machen", baseDescription: "Schreibe XXX wichtige Punkte aus einem Lernvideo auf.", category: "Lernen", baseAmount: 10, unit: "" },
  { title: "Sprachübung", baseDescription: "Übe XXX Minuten eine Fremdsprache.", category: "Lernen", baseAmount: 20, unit: "min" },
  { title: "Matheübungen", baseDescription: "Löse XXX Matheaufgaben.", category: "Lernen", baseAmount: 10, unit: "" },
  { title: "Artikel lesen", baseDescription: "Lies XXX interessante Artikel.", category: "Lernen", baseAmount: 2, unit: "" },
  { title: "Zusammenfassung", baseDescription: "Schreibe eine XXX-seitige Zusammenfassung.", category: "Lernen", baseAmount: 1, unit: "Seite" },
  { title: "Fragen stellen", baseDescription: "Stelle XXX Fragen zu einem Thema.", category: "Lernen", baseAmount: 5, unit: "" },
  { title: "Karteikarten", baseDescription: "Erstelle XXX Karteikarten.", category: "Lernen", baseAmount: 15, unit: "" },
  { title: "Gedächtnistraining", baseDescription: "Übe XXX Minuten Gedächtnistraining.", category: "Lernen", baseAmount: 15, unit: "min" },
  { title: "Tutorial schauen", baseDescription: "Sieh dir XXX Tutorials zu neuen Fähigkeiten an.", category: "Lernen", baseAmount: 2, unit: "" },
  { title: "Brief schreiben", baseDescription: "Schreibe einen XXX-Wörter Brief.", category: "Lernen", baseAmount: 200, unit: "Wörter" },
  { title: "Wörterbuch", baseDescription: "Schlage XXX unbekannte Wörter nach.", category: "Lernen", baseAmount: 10, unit: "" },
  { title: "Kreatives Schreiben", baseDescription: "Schreibe XXX Wörter zu einem freien Thema.", category: "Lernen", baseAmount: 300, unit: "" },
  { title: "Sudoku", baseDescription: "Löse XXX Sudokus.", category: "Lernen", baseAmount: 2, unit: "" },
  { title: "Lernplan", baseDescription: "Erstelle einen XXX-Tage-Lernplan.", category: "Lernen", baseAmount: 7, unit: "Tage" },
  { title: "Nachhilfe geben", baseDescription: "Erkläre jemandem XXX Minuten ein Thema.", category: "Lernen", baseAmount: 20, unit: "min" },
  { title: "Dokumentation", baseDescription: "Sieh dir XXX Minuten Dokumentation an.", category: "Lernen", baseAmount: 30, unit: "min" },
  { title: "Sprachtandem", baseDescription: "Übe XXX Minuten mit einem Sprachtandem-Partner.", category: "Lernen", baseAmount: 30, unit: "min" },
  { title: "Hörbuch", baseDescription: "Höre XXX Minuten ein Hörbuch.", category: "Lernen", baseAmount: 30, unit: "min" },
  { title: "Online Quiz", baseDescription: "Mache XXX Online-Quiz zu deinem Thema.", category: "Lernen", baseAmount: 3, unit: "" },
  { title: "Mindmap erstellen", baseDescription: "Erstelle XXX Mindmaps zu deinem Thema.", category: "Lernen", baseAmount: 1, unit: "" },
  { title: "Videoanalyse", baseDescription: "Analysiere XXX Minuten Lernvideo.", category: "Lernen", baseAmount: 45, unit: "min" },
  { title: "Vokabelrepeat", baseDescription: "Wiederhole XXX Vokabeln mit Spaced Repetition.", category: "Lernen", baseAmount: 50, unit: "" },
  { title: "Schnelllesen", baseDescription: "Übe XXX Minuten Schnelllesen.", category: "Lernen", baseAmount: 15, unit: "min" },
  { title: "Lerngruppe", baseDescription: "Nimm an einer XXX-minütigen Lerngruppe teil.", category: "Lernen", baseAmount: 60, unit: "min" },
  { title: "Wissensdatenbank", baseDescription: "Erweitere deine Wissensdatenbank um XXX Einträge.", category: "Lernen", baseAmount: 5, unit: "" },
  // Haushalt - 100 quests
  { title: "Zimmer aufräumen", baseDescription: "Räume dein Zimmer komplett auf.", category: "Haushalt", baseAmount: 1, unit: "Raum" },
  { title: "Staub wischen", baseDescription: "Wische Staub in XXX Räumen.", category: "Haushalt", baseAmount: 2, unit: "Räume" },
  { title: "Boden saugen", baseDescription: "Sauge den Boden in XXX Räumen.", category: "Haushalt", baseAmount: 3, unit: "Räume" },
  { title: "Wäsche waschen", baseDescription: "Wasche XXX Wäschesets.", category: "Haushalt", baseAmount: 2, unit: "Sets" },
  { title: "Geschirr spülen", baseDescription: "Spüle das Geschirr von Hand.", category: "Haushalt", baseAmount: 1, unit: "Spülgang" },
  { title: "Müll rausbringen", baseDescription: "Bring den Müll raus und trenne Recycling.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Bad reinigen", baseDescription: "Putze das Bad komplett.", category: "Haushalt", baseAmount: 1, unit: "Bad" },
  { title: "Küche putzen", baseDescription: "Reinige die Küche.", category: "Haushalt", baseAmount: 1, unit: "Küche" },
  { title: "Fenster putzen", baseDescription: "Putze XXX Fenster.", category: "Haushalt", baseAmount: 4, unit: "" },
  { title: "Schrank sortieren", baseDescription: "Sortiere XXX Schränke aus.", category: "Haushalt", baseAmount: 2, unit: "" },
  { title: "Blumen gießen", baseDescription: "Gieße alle Pflanzen.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Staubsaugen", baseDescription: "Staubsauge alle Räume.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Kleidung sortieren", baseDescription: "Sortiere XXX Kleidungsstücke aus.", category: "Haushalt", baseAmount: 10, unit: "" },
  { title: "Schublade aufräumen", baseDescription: "Räume XXX Schubladen aus.", category: "Haushalt", baseAmount: 3, unit: "" },
  { title: "Spiegel putzen", baseDescription: "Putze XXX Spiegel.", category: "Haushalt", baseAmount: 4, unit: "" },
  { title: "Bettwäsche", baseDescription: "Wechsle die Bettwäsche.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Ordnung schaffen", baseDescription: "Schaffe Ordnung in XXX Bereichen.", category: "Haushalt", baseAmount: 3, unit: "" },
  { title: "Möbel wischen", baseDescription: "Wische alle Möbel in XXX Räumen.", category: "Haushalt", baseAmount: 2, unit: "Räume" },
  { title: "Elektronik", baseDescription: "Reinige XXX elektronische Geräte.", category: "Haushalt", baseAmount: 5, unit: "" },
  { title: "Einkaufen", baseDescription: "Gehe einkaufen und halte dich an die Liste.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Kühlschrank", baseDescription: "Räume den Kühlschrank auf.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Schuhschrank", baseDescription: "Sortiere den Schuhschrank.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Aktenordner", baseDescription: "Sortiere XXX Aktenordner.", category: "Haushalt", baseAmount: 3, unit: "" },
  { title: "Spielzeug", baseDescription: "Räume das Spielzeug auf.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  { title: "Wäsche falten", baseDescription: "Falte XXX Wäschesets.", category: "Haushalt", baseAmount: 3, unit: "Sets" },
  { title: "Bügeln", baseDescription: "Bügele XXX Kleidungsstücke.", category: "Haushalt", baseAmount: 8, unit: "" },
  { title: "Mülleimer", baseDescription: "Leere und reinige XXX Mülleimer.", category: "Haushalt", baseAmount: 4, unit: "" },
  { title: "Staubfänger", baseDescription: "Entferne XXX Staubfänger.", category: "Haushalt", baseAmount: 5, unit: "" },
  { title: "Tiefenreinigung", baseDescription: "Mache eine Tiefenreinigung in XXX Raum.", category: "Haushalt", baseAmount: 1, unit: "Raum" },
  { title: "Vorratskammer", baseDescription: "Sortiere die Vorratskammer.", category: "Haushalt", baseAmount: 1, unit: "Mal" },
  // Social - 100 quests
  { title: "Freund anrufen", baseDescription: "Rufe einen Freund an und quatsche XXX Minuten.", category: "Social", baseAmount: 20, unit: "min" },
  { title: "Nachricht schicken", baseDescription: "Schicke XXX Personen eine positive Nachricht.", category: "Social", baseAmount: 5, unit: "" },
  { title: "Familie", baseDescription: "Besuche oder rufe ein Familienmitglied an.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Video call", baseDescription: "Mache einen XXX-minütigen Videoanruf.", category: "Social", baseAmount: 30, unit: "min" },
  { title: "Community Post", baseDescription: "Poste etwas Positives in einer Community.", category: "Social", baseAmount: 1, unit: "Post" },
  { title: "Danke sagen", baseDescription: "Sag XXX Menschen konkret Danke.", category: "Social", baseAmount: 3, unit: "" },
  { title: "Gemeinsam essen", baseDescription: "Iss mit jemandem zusammen.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Kompliment", baseDescription: "Gib XXX Menschen ein ehrliches Kompliment.", category: "Social", baseAmount: 3, unit: "" },
  { title: "Alter Freund", baseDescription: "Kontaktiere jemanden, den du lange nicht gesehen hast.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Ehrenamt", baseDescription: "Engagiere dich XXX Minuten ehrenamtlich.", category: "Social", baseAmount: 30, unit: "min" },
  { title: "Feedback geben", baseDescription: "Gib XXX Personen konstruktives Feedback.", category: "Social", baseAmount: 2, unit: "" },
  { title: "Netzwerk", baseDescription: "Vernetze dich mit XXX neuen Personen.", category: "Social", baseAmount: 2, unit: "" },
  { title: "Geburtstagsgruß", baseDescription: "Schicke einen persönlichen Geburtstagsgruß.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Hilfe anbieten", baseDescription: "Biete XXX Menschen deine Hilfe an.", category: "Social", baseAmount: 2, unit: "" },
  { title: "Zuhören", baseDescription: "Hör jemandem XXX Minuten richtig zu.", category: "Social", baseAmount: 15, unit: "min" },
  { title: "Lächeln", baseDescription: "Lächle XXX fremden Menschen zu.", category: "Social", baseAmount: 10, unit: "" },
  { title: "Einladen", baseDescription: "Lade jemanden zu einer Aktivität ein.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Teilen", baseDescription: "Teile dein Wissen mit XXX Personen.", category: "Social", baseAmount: 2, unit: "" },
  { title: "Gute Tat", baseDescription: "Mache eine gute Tat für jemanden.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Gemeinsam kochen", baseDescription: "Koch zusammen mit jemandem.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Spieleabend", baseDescription: "Veranstalte einen Spieleabend mit XXX Personen.", category: "Social", baseAmount: 3, unit: "" },
  { title: "Geduld", baseDescription: "Habe Geduld mit jemandem heute.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Wertschätzung", baseDescription: "Zeige XXX Menschen deine Wertschätzung.", category: "Social", baseAmount: 3, unit: "" },
  { title: "Gemeinsam spazieren", baseDescription: "Gehe mit jemandem spazieren.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Gratulieren", baseDescription: "Gratuliere jemandem zu einem Erfolg.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Schenken", baseDescription: "Schenke jemandem etwas Kleines.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Botschaft", baseDescription: "Schreibe eine inspirierende Botschaft.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Gemeinsam Sport", baseDescription: "Mache Sport mit jemandem zusammen.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Spenden", baseDescription: "Spende etwas für einen guten Zweck.", category: "Social", baseAmount: 1, unit: "Mal" },
  { title: "Mentor", baseDescription: "Werde Mentor für jemanden.", category: "Social", baseAmount: 1, unit: "Mal" },
  // Sonstiges - 100 quests
  { title: "Meditieren", baseDescription: "Meditiere XXX Minuten.", category: "Sonstiges", baseAmount: 15, unit: "min" },
  { title: "Tagebuch", baseDescription: "Schreibe XXX Seiten Tagebuch.", category: "Sonstiges", baseAmount: 3, unit: "Seiten" },
  { title: "Dankbarkeit", baseDescription: "Schreibe XXX Dinge auf, für die du dankbar bist.", category: "Sonstiges", baseAmount: 5, unit: "" },
  { title: "Wasser trinken", baseDescription: "Trinke XXX Liter Wasser.", category: "Sonstiges", baseAmount: 2.5, unit: "L" },
  { title: "Früh schlafen", baseDescription: "Gehe XXX Minuten früher ins Bett.", category: "Sonstiges", baseAmount: 30, unit: "min" },
  { title: "Digital Detox", baseDescription: "Verbringe XXX Stunden ohne Bildschirm.", category: "Sonstiges", baseAmount: 1, unit: "Stunde" },
  { title: "Gesund essen", baseDescription: "Iss heute XXX gesunde Mahlzeiten.", category: "Sonstiges", baseAmount: 3, unit: "" },
  { title: "Aufgabe erledigen", baseDescription: "Erledige eine Aufgabe, die du vor dir herschiebst.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "To-Do Liste", baseDescription: "Erstelle eine To-Do-Liste für morgen.", category: "Sonstiges", baseAmount: 1, unit: "Liste" },
  { title: "Budget", baseDescription: "Überprüfe deine Ausgaben der letzten XXX Tage.", category: "Sonstiges", baseAmount: 7, unit: "Tage" },
  { title: "Entspannung", baseDescription: "Nimm ein entspannendes Bad.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Musik hören", baseDescription: "Höre XXX Minuten Musik.", category: "Sonstiges", baseAmount: 30, unit: "min" },
  { title: "Lüften", baseDescription: "Lüfte alle Räume XXX Minuten.", category: "Sonstiges", baseAmount: 15, unit: "min" },
  { title: "Tagesplan", baseDescription: "Plane deinen Tag strukturiert.", category: "Sonstiges", baseAmount: 1, unit: "Plan" },
  { title: "Nichts tun", baseDescription: "Gönne dir XXX Minuten bewusst nichts tun.", category: "Sonstiges", baseAmount: 20, unit: "min" },
  { title: "Selbstfürsorge", baseDescription: "Mache etwas nur für dich selbst.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Technikfasten", baseDescription: "Verzichte XXX Stunden auf elektronische Geräte.", category: "Sonstiges", baseAmount: 2, unit: "Stunden" },
  { title: "Neue Route", baseDescription: "Nimm heute einen anderen Weg.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Fotos", baseDescription: "Mache XXX schöne Fotos.", category: "Sonstiges", baseAmount: 5, unit: "" },
  { title: "Atemübung", baseDescription: "Mache XXX tiefe Atemzüge.", category: "Sonstiges", baseAmount: 10, unit: "" },
  { title: "Affirmationen", baseDescription: "Spreche XXX positive Affirmationen.", category: "Sonstiges", baseAmount: 5, unit: "" },
  { title: "Visualisierung", baseDescription: "Visualisiere deine Ziele XXX Minuten.", category: "Sonstiges", baseAmount: 10, unit: "min" },
  { title: "Journaling", baseDescription: "Schreibe XXX Minuten im Journal.", category: "Sonstiges", baseAmount: 15, unit: "min" },
  { title: "Natur", baseDescription: "Verbringe Zeit in der Natur.", category: "Sonstiges", baseAmount: 30, unit: "min" },
  { title: "Sonnenaufgang", baseDescription: "Beobachte den Sonnenaufgang.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Sonnenuntergang", baseDescription: "Beobachte den Sonnenuntergang.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Spa", baseDescription: "Gönne dir eine SPA-Behandlung zu Hause.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Puzzle", baseDescription: "Mache ein XXX-Teile-Puzzle.", category: "Sonstiges", baseAmount: 500, unit: "Teile" },
  { title: "Kartenspiel", baseDescription: "Spiele ein Kartenspiel.", category: "Sonstiges", baseAmount: 1, unit: "Mal" },
  { title: "Neues Rezept", baseDescription: "Probiere ein neues Rezept aus.", category: "Sonstiges", baseAmount: 1, unit: "Rezept" },
];

export interface UserLevels {
  sport_level: UserLevel;
  learning_level: UserLevel;
  household_level: UserLevel;
  social_level: UserLevel;
  wellbeing_level: UserLevel;
}

export const defaultUserLevels: UserLevels = {
  sport_level: 'beginner',
  learning_level: 'beginner',
  household_level: 'beginner',
  social_level: 'beginner',
  wellbeing_level: 'beginner',
};

export interface PrioritySettings {
  primary: string;
  secondary: string[];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateQuests(
  count: number,
  startIndex: number,
  userLevels: UserLevels,
  priorities?: PrioritySettings
): StandardQuest[] {
  const quests: StandardQuest[] = [];
  
  for (let i = 0; i < count; i++) {
    const idx = (startIndex + i) % questTemplates.length;
    const template = questTemplates[idx];
    const seed = startIndex + i;
    
    const levelKey = categoryToLevelKey[template.category];
    const userLevel = userLevels[levelKey as keyof UserLevels] || 'beginner';
    
    const baseDifficulty = difficultyFromLevel[userLevel];
    let difficulty: 'Easy' | 'Medium' | 'Hard';
    
    if (priorities && (priorities.primary === template.category || priorities.secondary.includes(template.category))) {
      const roll = seededRandom(seed * 3.14);
      if (roll < 0.6) difficulty = 'Easy';
      else if (roll < 0.9) difficulty = 'Medium';
      else difficulty = 'Hard';
    } else {
      const roll = seededRandom(seed * 2.71);
      if (roll < 0.33) difficulty = 'Easy';
      else if (roll < 0.66) difficulty = 'Medium';
      else difficulty = 'Hard';
    }
    
    const amount = getAmountForLevel(template.baseAmount, userLevel);
    const description = createDescription(template.baseDescription, amount, template.unit);
    
    quests.push({
      id: `quest_${startIndex + i}`,
      title: template.title,
      description,
      difficulty,
      category: template.category,
      baseAmount: template.baseAmount,
      unit: template.unit,
      xp: getXpForDifficulty(difficulty),
      coins: getCoinsForDifficulty(difficulty),
    });
  }
  
  return quests;
}

export const standardQuestPool = generateQuests(1000, 0, defaultUserLevels);