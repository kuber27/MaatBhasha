# PALASH MaatBhasha
### AI-Powered Vernacular Pedagogy · Mother Tongue-Based Primary Education

[![SIH Prototype](https://img.shields.io/badge/Smart%20India%20Hackathon-Prototype-orange)]()
[![Language](https://img.shields.io/badge/Languages-Hindi%20%E2%86%94%20Santali-green)]()

---

## What Is This?

PALASH MaatBhasha is an AI-assisted teaching tool for primary school teachers in Jharkhand's PALASH MTB-MLE programme. It helps Hindi-medium teachers translate lesson content into Santali (Ol Chiki script), display FLN classroom activities, generate printable worksheets, and work with quick classroom phrases — all on low-cost tablets.

---

## Language Support (Truthful)

| Language | Translation | TTS | Status |
|----------|-------------|-----|--------|
| **Santali (sat-IN / Ol Chiki)** | ✅ Hindi ↔ Santali via Sarvam AI | ❌ Odia TTS fallback (Bulbul v3) | **Production** |
| Ho (ho-IN) | ❌ Not yet | ❌ | Language pack in development |
| Mundari (mwr-IN) | ❌ Not yet | ❌ | Language pack in development |
| Kurukh (kru-IN) | ❌ Not yet | ❌ | Language pack in development |
| Odia (od-IN) | ❌ Not yet | ✅ Bulbul v3 | Used as TTS fallback only |

---

## Offline Capability (Truthful)

| Feature | Offline? |
|---------|----------|
| App shell & UI | ✅ After first load |
| Ol Chiki font (NotoSansOlChiki) | ✅ Bundled locally |
| FLN lesson packs (8 packs) | ✅ After sync |
| 30 classroom phrases | ✅ Always |
| Worksheets & flashcards | ✅ After sync |
| Cached recent translations | ✅ IndexedDB |
| Live AI translation (Sarvam) | ❌ Internet required |
| New TTS audio generation | ❌ Internet required |

---

## Architecture

```
frontend/               Vite + React
  src/
    screens/            6 module screens
      ComposeScreen.jsx   Two-pane hi↔sat translator + 30 phrases
      ResultScreen.jsx    Full lesson result (simplified + Santali + audio)
      ClassroomDialogueScreen.jsx  Voice-to-voice (push-to-talk)
      CurriculumHubScreen.jsx      NIPUN Bharat FLN 8 lesson packs
      WorksheetGeneratorScreen.jsx 7 activity types, A4 printable
      OfflineSyncScreen.jsx        Storage stats, sync, offline status
    components/
      MicButton.jsx       STT via Sarvam saaras:v3
      LanguageChips.jsx   Language selector (Santali only available)
      AudioPlayer.jsx     Audio playback with fallback label
    data/
      classroomPhrases.js 30 Hindi↔Santali classroom phrases
      flnCurriculumPacks.js 8 NIPUN Bharat FLN packs (Santali focus)
      tribalDictionary.js Vocabulary reference
    utils/
      offlineDb.js        IndexedDB: flnPacks, customLessons, worksheets,
                          audioCache, syncMeta, translationsCache (v2)
    __tests__/
      translation.test.js Unit tests (normalizeText, pairKey, cache key, 25 phrases)
  public/
    fonts/NotoSansOlChiki-Regular.woff2  Local Ol Chiki font (offline)
    sw.js                Service worker v4

backend/                Node.js + Express
  routes/
    translate.js        POST /api/translate  hi-IN↔sat-IN via Sarvam
    stt.js              POST /api/stt        saaras:v3 speech recognition
    tts.js              POST /api/tts        bulbul:v3 + Odia fallback
    simplify.js         POST /api/simplify   sarvam-105b (grade-appropriate Hindi)
    curriculum.js       POST /api/curriculum/generate
    dialogue.js         POST /api/dialogue/turn (real-time voice bridge)
  .env                  SARVAM_API_KEY (server-side only, never in frontend)
```

---

## Setup

### Prerequisites
- Node.js >= 18
- Sarvam AI API key (https://sarvam.ai/)

### Install & Run
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your real SARVAM_API_KEY
npm install
node server.js          # runs on :3001

# Frontend (new terminal)
cd frontend
npm install
npm run dev -- --force  # runs on :5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SARVAM_API_KEY` | ✅ | Server-side key for Sarvam AI APIs |
| `PORT` | Optional | Backend port (default 3001) |

**Security**: The key is read server-side only. It is never bundled into frontend code, never logged in responses, and never appears in the browser.

---

## Running Tests

```bash
cd frontend
npm test
```

Tests cover: text normalization, language pair validation, error-to-Hindi mapping, cache key generation, and the 25-phrase verified classroom phrase test set.

---

## Sarvam API Endpoints Used

| Endpoint | Model | Purpose |
|----------|-------|---------|
| `POST /translate` | `sarvam-translate:v1` | Hindi ↔ Santali text translation |
| `POST /speech-to-text` | `saaras:v3` | Teacher Hindi voice recognition |
| `POST /text-to-speech` | `bulbul:v3` | Hindi/Odia audio (Santali uses Odia fallback) |
| `POST /v2/chat/completions` | `sarvam-105b` | Grade-appropriate lesson simplification |

---

## Remaining Limitations

### Requires a Santali Language Expert
- All 30 classroom phrases are marked `demo-needs-expert-review`
- All 8 FLN lesson pack Santali translations are marked `contentStatus: 'demo'`
- Roman transliterations are AI-generated and unvalidated
- No Santali benchmark accuracy claimed

### Technical Limitations
- Santali TTS: Sarvam Bulbul v3 does not support Santali (sat-IN). Audio uses Odia as fallback.
- Santali STT: Not yet supported by Sarvam. Student reply mode is beta.
- Ho, Mundari, Kurukh: No Sarvam language codes verified as production-ready. Marked "coming soon."

### For Production Deployment
1. Commission a Santali language expert review of all content
2. Add student device Firestore sync (configure Firebase project)
3. Implement Santali STT when available
4. Add vetted audio recordings for the 30 classroom phrase library

---

## Demo Flow

1. Open http://localhost:5173
2. Type or speak a Hindi lesson phrase in the left pane
3. Watch real-time Santali translation (Ol Chiki) appear in the right pane
4. Click a quick classroom phrase to instantly translate it
5. Click "पूरा पाठ बनाएं" for the full lesson flow (simplify + translate + audio)
6. Navigate to "FLN पाठ योजना" to browse 8 pre-built lesson packs
7. Generate a printable worksheet from any lesson pack
8. Use "ऑफलाइन सिंक" to download packs for offline use
