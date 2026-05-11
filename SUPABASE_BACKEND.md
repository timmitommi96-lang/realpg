# RealPG Supabase Backend

## 1) Voraussetzungen
- Supabase CLI installiert
- Docker Desktop (fuer lokale Supabase-Umgebung)
- Projekt hat `.env` mit `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2) Lokales Backend starten
```bash
supabase start
supabase db reset
```

Damit werden die Migrationen unter `supabase/migrations` eingespielt.

## 3) Edge Function deployen
```bash
supabase functions deploy ai-proxy
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_KEY
```

## 4) Cloud Projekt initialisieren
Wenn du direkt auf dein Supabase Cloud Projekt gehen willst:
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy ai-proxy
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_KEY
```

## 5) Smoke-Test (MVP)
1. Registrieren / Einloggen in der App
2. Profil wird automatisch via `ensure_profile` erstellt
3. Quest erstellen (daily/custom) und als `completed` markieren
4. Shop-Item kaufen (`purchase_item`) und Inventar aktualisiert sich
5. Freundschaftsanfrage per Invite-Code senden und annehmen
6. Leaderboard abrufen
7. AI-Funktion aufrufen (`ai-proxy`) fuer Quest/Proof

## 6) Wichtige Tabellen/Funktionen
- Tabellen: `user_profiles`, `quests`, `quest_completions`, `inventory_items`, `user_inventory`, `friend_requests`, `friends`, `activity_feed`
- RPCs: `ensure_profile`, `purchase_item`, `complete_quest`, `send_friend_request`, `accept_friend_request`
- View: `leaderboard`
