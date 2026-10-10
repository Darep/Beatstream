// Playwright helpers for driving a Beatstream instance started by beatstream.sh.
//
// As a module:  import { open, login, refreshLibrary, capture } from '<skill>/scripts/pw.mjs';
// As a CLI:     node pw.mjs <url> <artifacts-dir>
//               logs in as admin, refreshes the library, and captures the result.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = fileURLToPath(new URL('../../../../frontend/package.json', import.meta.url));
const { chromium } = createRequire(frontend)('@playwright/test');

export async function open(url, { width = 1280, height = 800 } = {}) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  return { browser, page, errors };
}

export async function login(page, username = 'admin', password = 'admin') {
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: username }).waitFor();
}

export async function refreshLibrary(page, username = 'admin') {
  await page.getByRole('button', { name: username }).click();
  await page.getByRole('button', { name: 'Refresh media library…' }).click();
  await page.getByText('Done!').waitFor();
}

// Writes <name>.png and <name>.aria.txt into dir.
export async function capture(page, dir, name) {
  mkdirSync(dir, { recursive: true });
  // The first screenshot of a cold headless browser occasionally fails with "Unable to capture screenshot".
  for (let attempt = 1; ; attempt += 1) {
    try {
      await page.screenshot({ path: join(dir, `${name}.png`) });
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      await page.waitForTimeout(500);
    }
  }
  writeFileSync(join(dir, `${name}.aria.txt`), await page.locator('body').ariaSnapshot());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [url, dir] = process.argv.slice(2);
  if (!url || !dir) throw new Error('usage: node pw.mjs <url> <artifacts-dir>');
  const { browser, page, errors } = await open(url);
  try {
    await capture(page, dir, '01-login');
    await login(page);
    await refreshLibrary(page);
    await capture(page, dir, '02-library');
    if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
  } finally {
    await browser.close();
  }
}
