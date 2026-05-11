// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function createQuestPrompt(goal: string): string {
  return `Erstelle EINE konkrete Quest fuer das Ziel: "${goal}".
Antworte nur JSON:
{
  "title": "...",
  "description": "...",
  "difficulty": "Easy|Medium|Hard",
  "category": "Sport|Lernen|Haushalt|Social|Sonstiges",
  "xp": 15-100,
  "coins": 5-40
}`;
}

function createValidationPrompt(description: string): string {
  return `Pruefe ob das Bild diese Quest zeigt: "${description}".
Antworte nur JSON:
{
  "isValid": true|false,
  "feedback": "Kurzes Feedback auf Deutsch"
}`;
}

async function callGemini(prompt: string, imageBase64?: string) {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('Missing GEMINI_API_KEY');

  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const res = await fetch(`${AI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    if (action === 'generateQuest') {
      const text = await callGemini(createQuestPrompt(payload?.goal ?? 'Motivation'));
      const quest = extractJson(text);
      return new Response(JSON.stringify({ quest }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'validateProof') {
      const text = await callGemini(
        createValidationPrompt(payload?.questDescription ?? ''),
        payload?.base64Image
      );
      const result = extractJson(text) ?? { isValid: true, feedback: 'Quest erledigt!' };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
