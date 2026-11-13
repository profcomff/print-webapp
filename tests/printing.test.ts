import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateFile, validatePages, parsePins } from '../src/utils/printing.ts';
import { get_history, add_history } from '../src/utils/history.ts';
import { isMobile } from '../src/utils/mobile.ts';

test('PDF validation rejects oversized, empty and wrong-format files', async () => {
  assert.match(await validateFile(new File(['plain text'], 'notes.pdf')), /PDF/);
  assert.match(await validateFile(new File([], 'notes.pdf')), /пуст/);
  assert.match(await validateFile({ size: 25_000_001, name: 'notes.pdf' } as File), /25/);
  assert.equal(await validateFile(new File(['%PDF-1.7\ncontent'], 'NOTES.PDF', { type: '' })), '');
});
test('page ranges accept whitespace and reject zero, reversed and malformed ranges', () => {
  for (const value of ['', '1', '1-3, 5', ' 2 - 4, 6 ']) assert.equal(validatePages(value), '');
  for (const value of ['0', '4-2', '1,,3', '-1', 'abc', '1.5']) assert.notEqual(validatePages(value), '');
});
test('QR pins are unique, bounded, and safe to display', () => {
  assert.deepEqual(parsePins('#AB12,AB12,CD34'), ['AB12', 'CD34']);
  assert.deepEqual(parsePins('#'), []);
  assert.deepEqual(parsePins('#bad%20pin'), []);
  assert.equal(parsePins('#' + Array.from({length: 12}, (_, i) => `PIN${i}`).join(',')).length, 10);
});
test('mobile gate includes iPad desktop mode and excludes desktop touch laptops', () => {
  assert.equal(isMobile({ userAgent: 'Mozilla iPhone', platform: 'iPhone', maxTouchPoints: 5 }), true);
  assert.equal(isMobile({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 5 }), true);
  assert.equal(isMobile({ userAgent: 'Windows', platform: 'Win32', maxTouchPoints: 10 }), false);
});
test('corrupt or blocked iframe storage does not break history', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.deepEqual(get_history(broken), []);
  assert.doesNotThrow(() => add_history('AB12', 'file.pdf', broken));
  assert.deepEqual(get_history({getItem: () => '{bad'}), []);
  assert.deepEqual(get_history({getItem: () => '[null,{}, {"pin":"AB12","name":"file.pdf"}]'}), [{pin:'AB12',name:'file.pdf'}]);
});
test('history preserves legacy entries and keeps the last ten unique files', () => {
  let value = '[]';
  const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
  for(let i=0; i<12; i++) add_history(`PIN${i}`, `file${i}.pdf`, storage);
  assert.equal(get_history(storage).length, 10);
  add_history('PIN11', 'renamed.pdf', storage);
  assert.equal(get_history(storage).length, 10);
  assert.equal(get_history(storage).at(-1)?.name, 'renamed.pdf');
});
