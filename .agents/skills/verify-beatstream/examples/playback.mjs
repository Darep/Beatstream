// Worked example: drives features/playback.md and writes captures plus notes.txt.
// node .agents/skills/verify-beatstream/examples/playback.mjs <URL> <ARTIFACTS>/playback
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { capture, login, open, refreshLibrary } from '../scripts/pw.mjs';

const [url, dir] = process.argv.slice(2);
const { browser, page, errors } = await open(url);
const notes = [];
const audio = () => page.locator('#audio').evaluate((a) => ({ paused: a.paused, t: a.currentTime, volume: a.volume }));
const current = () => page.getByText('Current song:').locator('..').innerText();
async function until(fn, label) {
  for (let i = 0; i < 40; i += 1) {
    if (await fn()) return;
    await page.waitForTimeout(250);
  }
  throw new Error(`timed out: ${label}`);
}
const play = async (action, label) => {
  const response = page.waitForResponse((r) => r.url().includes('/api/songs/play'));
  await action();
  notes.push(`${label}: /api/songs/play -> ${(await response).status()}`);
};

try {
  await login(page);
  await refreshLibrary(page);
  await capture(page, dir, '01-before');

  await play(() => page.locator('#slickgrid .slick-row').filter({ hasText: 'Demo B' }).dblclick(), 'dblclick Demo B');
  await until(async () => !(await audio()).paused, 'playing');
  notes.push(`after dblclick: ${await current()} ${JSON.stringify(await audio())}`);
  await capture(page, dir, '02-playing');

  await page.locator('#play-pause').click();
  await until(async () => (await audio()).paused, 'paused');
  notes.push(`after pause: ${JSON.stringify(await audio())}`);
  await capture(page, dir, '03-paused');

  await play(() => page.locator('#next').click(), 'next');
  notes.push(`after next: ${await current()}`);
  await play(() => page.locator('#prev').click(), 'prev');
  notes.push(`after prev: ${await current()}`);

  await page.locator('#slickgrid .slick-row').filter({ hasText: 'Demo A' }).locator('.slick-cell').first().click();
  await play(() => page.keyboard.press('Enter'), 'Enter on Demo A');
  notes.push(`after Enter: ${await current()}`);
  await page.locator('#play-pause').click();
  await until(async () => (await audio()).paused, 'paused');

  const seek = await page.getByRole('slider').nth(1).locator('..').boundingBox();
  await page.mouse.click(seek.x + seek.width / 2, seek.y + seek.height / 2);
  await page.waitForTimeout(300);
  notes.push(`after seek 50%: ${JSON.stringify(await audio())} elapsed=${await page.locator('.elapsed').innerText()}`);

  const vol = await page.getByRole('slider').nth(0).locator('..').boundingBox();
  await page.mouse.click(vol.x + vol.width * 0.1, vol.y + vol.height / 2);
  notes.push(`after volume 10%: ${JSON.stringify(await audio())}`);

  await page.locator('#repeat').click();
  await page.locator('#shuffle').click();
  notes.push(
    `toggles: ${await page.locator('#repeat').getAttribute('class')} "${await page.locator('#repeat').innerText()}" / ` +
      `${await page.locator('#shuffle').getAttribute('class')} "${await page.locator('#shuffle').innerText()}"`,
  );
  await capture(page, dir, '04-after-controls');
  if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
} finally {
  writeFileSync(join(dir, 'notes.txt'), `${notes.join('\n')}\n`);
  await browser.close();
}
