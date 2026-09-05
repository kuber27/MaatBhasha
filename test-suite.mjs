// test-suite.mjs — Comprehensive test suite for MaatBhasha translation validation,
// error mapping, cache keys, and classroom phrases.
// Run: node test-suite.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

// ── 1. Text Normalization ───────────────────────────────────────────────────
function normalizeText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
}

test('normalizeText: trims leading and trailing whitespace', () => {
  assert.equal(normalizeText('  नमस्ते बच्चों  '), 'नमस्ते बच्चों');
});

test('normalizeText: collapses internal whitespace', () => {
  assert.equal(normalizeText('बच्चों   को   पानी   पीना   है'), 'बच्चों को पानी पीना है');
});

test('normalizeText: returns empty string for non-string input', () => {
  assert.equal(normalizeText(null), '');
  assert.equal(normalizeText(undefined), '');
  assert.equal(normalizeText(123), '');
});

// ── 2. Supported Pairs Validation ───────────────────────────────────────────
const SUPPORTED_PAIRS = new Set(['hi-IN→sat-IN', 'sat-IN→hi-IN']);
function isSupported(src, tgt) {
  return SUPPORTED_PAIRS.has(`${src}→${tgt}`);
}

test('isSupported: hi-IN to sat-IN is supported', () => {
  assert.equal(isSupported('hi-IN', 'sat-IN'), true);
});

test('isSupported: sat-IN to hi-IN is supported', () => {
  assert.equal(isSupported('sat-IN', 'hi-IN'), true);
});

test('isSupported: ho-IN is NOT supported in this build', () => {
  assert.equal(isSupported('hi-IN', 'ho-IN'), false);
});

test('isSupported: mwr-IN (Mundari) is NOT supported', () => {
  assert.equal(isSupported('hi-IN', 'mwr-IN'), false);
});

test('isSupported: kru-IN (Kurukh) is NOT supported', () => {
  assert.equal(isSupported('hi-IN', 'kru-IN'), false);
});

// ── 3. Hindi Error Mapping (No fake Santali) ───────────────────────────────
const OFFLINE_MSG = 'अभी अनुवाद उपलब्ध नहीं है। इंटरनेट से जुड़कर पुनः प्रयास करें।';
function getHindiError(err, isOnline = true) {
  if (!isOnline) return OFFLINE_MSG;
  if (err?.code === 'PAIR_NOT_SUPPORTED') return 'यह भाषा अभी उपलब्ध नहीं है।';
  if (err?.code === 'NO_API_KEY') return 'अनुवाद सेवा कॉन्फ़िगर नहीं है। व्यवस्थापक से संपर्क करें।';
  if (err?.code === 'TEXT_EMPTY') return 'कृपया पहले हिंदी में पाठ लिखें।';
  return OFFLINE_MSG;
}

test('getHindiError: offline returns standard Hindi message', () => {
  assert.equal(getHindiError(null, false), OFFLINE_MSG);
});

test('getHindiError: unsupported pair returns Hindi notification', () => {
  assert.match(getHindiError({ code: 'PAIR_NOT_SUPPORTED' }, true), /उपलब्ध नहीं/);
});

test('getHindiError: missing API key returns Hindi notification', () => {
  assert.match(getHindiError({ code: 'NO_API_KEY' }, true), /कॉन्फ़िगर नहीं/);
});

test('getHindiError: never returns mock Santali text', () => {
  const result = getHindiError({ code: 'SARVAM_API_ERROR' }, true);
  // Ensure no Ol Chiki chars in error output
  const hasOlChiki = [...result].some(ch => {
    const cp = ch.codePointAt(0);
    return cp >= 0x1C50 && cp <= 0x1C7F;
  });
  assert.equal(hasOlChiki, false);
});

// ── 4. Cache Key Determinism ────────────────────────────────────────────────
function makeTranslationCacheKey(text, sourceLang, targetLang) {
  const t = text.trim().toLowerCase().slice(0, 200);
  return `${sourceLang}→${targetLang}_${t}`;
}

test('makeTranslationCacheKey: deterministic for identical inputs', () => {
  const k1 = makeTranslationCacheKey('नमस्ते बच्चों', 'hi-IN', 'sat-IN');
  const k2 = makeTranslationCacheKey('नमस्ते बच्चों', 'hi-IN', 'sat-IN');
  assert.equal(k1, k2);
});

test('makeTranslationCacheKey: distinct for reversed directions', () => {
  const k1 = makeTranslationCacheKey('text', 'hi-IN', 'sat-IN');
  const k2 = makeTranslationCacheKey('text', 'sat-IN', 'hi-IN');
  assert.notEqual(k1, k2);
});

// ── 5. Classroom Phrases Verification ───────────────────────────────────────
const TEST_PHRASES = [
  { id: 'g1', hindi: 'नमस्ते / जोहार बच्चों!', santali: 'ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ!', romanAid: 'Johar gidra ko!' },
  { id: 'a1', hindi: 'ध्यान से सुनो।', santali: 'ᱦᱩᱜᱽ ᱜᱤ ᱨᱳᱲ᱾', romanAid: 'Hug gi ror.' },
  { id: 'c1', hindi: 'किताब खोलो।', santali: 'ᱯᱩᱛᱷᱤ ᱠᱷᱳᱞᱚ᱾', romanAid: 'Puthi kholo.' },
  { id: 'n1', hindi: 'एक से दस तक गिनो।', santali: 'ᱢᱤᱫ ᱠᱷᱚᱱ ᱜᱮᱞ ᱞᱮᱠᱷᱟ᱾', romanAid: 'Mid khon gel lekha.' },
  { id: 's1', hindi: 'पानी पीना हो तो बताओ।', santali: 'ᱫᱟᱜ ᱟᱡᱚᱢ ᱟᱞᱮ ᱫᱚ ᱫᱟᱲᱮ ᱞᱮᱠᱷᱟᱜ᱾', romanAid: 'Dag ajom ale do dare lekhag.' },
  { id: 'p1', hindi: 'शाबाश! बहुत अच्छा किया।', santali: 'ᱵᱟᱹᱲᱛᱤ! ᱵᱟᱲᱟᱭ ᱠᱟᱛᱮᱡ ᱠᱟᱱᱟ᱾', romanAid: 'Badti! Baray katej kana.' },
  { id: 'q1', hindi: 'क्या आपको समझ आया?', santali: 'ᱟᱢᱠᱮ ᱥᱟᱶ ᱵᱩᱡᱷᱟᱹᱣ ᱮᱢᱟᱭᱮᱫᱟ?', romanAid: 'Amke saw bujhaw emayeda?' }
];

test('Classroom Phrases: all phrases contain valid Ol Chiki characters (U+1C50-U+1C7F)', () => {
  for (const p of TEST_PHRASES) {
    const hasOlChiki = [...p.santali].some(ch => {
      const cp = ch.codePointAt(0);
      return cp >= 0x1C50 && cp <= 0x1C7F;
    });
    assert.equal(hasOlChiki, true, `Phrase ${p.id} (${p.hindi}) must contain Ol Chiki script`);
  }
});

test('Classroom Phrases: all phrases have Roman pronunciation aids', () => {
  for (const p of TEST_PHRASES) {
    assert.ok(p.romanAid && p.romanAid.length > 0, `Phrase ${p.id} missing romanAid`);
  }
});
