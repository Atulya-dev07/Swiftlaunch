/**
 * KeywordExtractor — extracts nouns and proper nouns from OCR text using compromise NLP.
 *
 * Cleans OCR artifacts and filters out common UI chrome words to produce
 * high-signal contextual search queries.
 */

import nlp from 'compromise';

const UI_NOISE_WORDS = new Set([
  'file',
  'files',
  'edit',
  'view',
  'help',
  'window',
  'windows',
  'ok',
  'cancel',
  'apply',
  'close',
  'save',
  'open',
  'tools',
  'tool',
  'selection',
  'find',
  'terminal',
  'output',
  'debug',
  'run',
  'options',
  'option',
  'settings',
  'setting',
  'preferences',
  'preference',
  'toggle',
  'search',
  'menu',
  'tab',
  'tabs',
  'next',
  'previous',
  'prev',
  'back',
  'forward',
  'exit',
  'quit',
  'minimize',
  'maximize',
  'restore',
  'default',
  'delete',
  'remove',
  'cut',
  'copy',
  'paste',
  'undo',
  'redo',
  'select',
  'all',
  'zoom',
  'format',
  'insert',
  'navigate',
  'go',
  'layout',
  'explorer',
  'taskbar',
  'desktop',
  'untitled',
  'untitled-1',
  'button',
  'icon',
  'click',
  'press',
  'enter',
  'esc',
  'alt',
  'ctrl',
  'shift'
]);

/**
 * Clean raw OCR text by stripping garbage characters, isolated symbols,
 * and normalizing whitespace.
 */
function cleanOcrText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/[^\w\s.,;:/\-_()@#]/g, ' ') // remove weird OCR artifacts
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract meaningful keywords (nouns, proper nouns, terms) from OCR text.
 * Caps output to around 40 deduplicated items.
 */
export function extractKeywords(rawText: string, maxKeywords: number = 40): string[] {
  const cleaned = cleanOcrText(rawText);
  if (!cleaned) return [];

  const doc = nlp(cleaned);

  // Extract proper nouns and general nouns
  const properNouns: string[] = doc.properNouns().out('array');
  const nouns: string[] = doc.nouns().out('array');

  const combined = [...properNouns, ...nouns];
  const uniqueKeywords: string[] = [];
  const seen = new Set<string>();

  for (const item of combined) {
    // Break compound phrases or clean word
    const words = item
      .toLowerCase()
      .split(/[\s/_.,-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !/^\d+$/.test(w)); // Filter out purely numeric strings & single chars

    for (const word of words) {
      if (UI_NOISE_WORDS.has(word)) continue;
      if (seen.has(word)) continue;

      seen.add(word);
      uniqueKeywords.push(word);

      if (uniqueKeywords.length >= maxKeywords) {
        return uniqueKeywords;
      }
    }
  }

  return uniqueKeywords;
}

/**
 * Build a unified context query string from raw OCR text.
 */
export function buildContextQuery(rawText: string): string {
  const keywords = extractKeywords(rawText);
  return keywords.join(' ');
}
