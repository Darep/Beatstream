import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { expect, test } from '@playwright/test';

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const runId = `${process.pid}-${Date.now()}`;
const containerName = `beatstream-e2e-${runId}`;
const imageName = `beatstream:e2e-${runId}`;

let baseUrl: string;
let musicDirectory: string;

async function docker(...args: string[]) {
  const { stdout } = await execFileAsync('docker', args, {
    cwd: repoRoot,
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout.trim();
}

async function waitForServer(url: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The container is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Beatstream did not become ready at ${url}`);
}

function createWavFixture() {
  const sampleRate = 8_000;
  const samples = sampleRate * 5;
  const bytesPerSample = 2;
  const dataLength = samples * bytesPerSample;
  const wav = Buffer.alloc(44 + dataLength);

  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataLength, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * bytesPerSample, 28);
  wav.writeUInt16LE(bytesPerSample, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataLength, 40);

  for (let sample = 0; sample < samples; sample += 1) {
    const value = Math.sin((2 * Math.PI * 440 * sample) / sampleRate) * 3_000;
    wav.writeInt16LE(value, 44 + sample * bytesPerSample);
  }

  return wav;
}

test.beforeAll(async () => {
  const temporaryRoot = join(repoRoot, 'tmp');
  await mkdir(temporaryRoot, { recursive: true });
  musicDirectory = await mkdtemp(join(temporaryRoot, 'beatstream-e2e-'));
  const wav = createWavFixture();
  await Promise.all([
    writeFile(join(musicDirectory, 'fixture-a.wav'), wav),
    writeFile(join(musicDirectory, 'fixture-b.wav'), wav),
  ]);

  await docker('build', '--file', 'Dockerfile.hub', '--tag', imageName, '.');
  await docker(
    'run',
    '--detach',
    '--name',
    containerName,
    '--publish',
    '127.0.0.1::8080',
    '--volume',
    `${musicDirectory}:/music:ro`,
    imageName,
  );

  const portOutput = await docker('port', containerName, '8080/tcp');
  const port = portOutput.match(/:(\d+)$/)?.[1];
  if (!port) throw new Error(`Could not determine Beatstream port from: ${portOutput}`);

  baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);
});

test.afterEach(async ({ browserName: _browserName }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const logs = await docker('logs', containerName).catch((error) => String(error));
    await testInfo.attach('beatstream.log', { body: Buffer.from(logs), contentType: 'text/plain' });
  }
});

test.afterAll(async () => {
  await docker('rm', '--force', containerName).catch(() => undefined);
  await docker('image', 'rm', '--force', imageName).catch(() => undefined);
  if (musicDirectory) await rm(musicDirectory, { recursive: true, force: true });
});

test('login, index, play, search, and logout', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await test.step('reject invalid credentials', async () => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('wrong');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  await test.step('log in and index a real audio file', async () => {
    await page.locator('input[name="password"]').fill('admin');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('button', { name: 'admin' })).toBeVisible();
    await expect(page.getByText('No songs in playlist.')).toBeVisible();

    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('button', { name: 'Refresh media library…' }).click();
    await expect(page.getByText('Done!')).toBeVisible();
    await expect(page.getByText('2 songs', { exact: true })).toBeVisible();
    await expect(page.locator('#slickgrid .slick-row')).toHaveCount(2);
  });

  await test.step('sort, multi-select, activate, and pause indexed songs', async () => {
    const artistHeader = page.locator('#slickgrid .slick-header-column').filter({ hasText: 'Artist' });
    await expect(artistHeader.locator('.slick-sort-indicator')).toHaveClass(/slick-sort-indicator-asc/);
    await artistHeader.click();
    await expect(artistHeader.locator('.slick-sort-indicator')).toHaveClass(/slick-sort-indicator-desc/);

    const rows = page.locator('#slickgrid .slick-row');
    await rows.nth(0).locator('.slick-cell').first().click();
    await rows
      .nth(1)
      .locator('.slick-cell')
      .first()
      .click({ modifiers: ['Control'] });
    await expect(
      page.locator('#slickgrid .slick-row').filter({ has: page.locator('.slick-cell.selected') }),
    ).toHaveCount(2);

    const audioResponsePromise = page.waitForResponse((response) => response.url().includes('/api/songs/play'));
    await page.locator('#slickgrid .slick-row').filter({ hasText: 'fixture-b.wav' }).dblclick();

    const audioResponse = await audioResponsePromise;
    expect(audioResponse.status()).toBe(206);
    await expect(page.getByText('Current song:').locator('..')).toContainText('fixture-b.wav');
    await expect.poll(() => page.locator('#audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(false);

    const seekbarThumb = page.getByRole('slider').nth(1);
    const seekbar = seekbarThumb.locator('..');
    const seekbarBox = await seekbar.boundingBox();
    if (!seekbarBox) throw new Error('Could not find the seekbar');

    await page.locator('#audio').evaluate((audio: HTMLAudioElement) => {
      audio.pause();
      audio.currentTime = 0;
    });
    await page.mouse.move(seekbarBox.x, seekbarBox.y + seekbarBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(seekbarBox.x + seekbarBox.width * 0.8, seekbarBox.y + seekbarBox.height / 2);
    await expect(page.locator('#audio')).toHaveJSProperty('currentTime', 0);
    await seekbarThumb.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
    await expect(page.locator('.elapsed')).toHaveText('00:00');
    await seekbarThumb.evaluate((thumb) => thumb.releasePointerCapture(1));
    await page.mouse.up();
    await page.locator('#audio').evaluate((audio: HTMLAudioElement) => audio.play());

    const keyboardAudioResponsePromise = page.waitForResponse((response) => response.url().includes('/api/songs/play'));
    await page
      .locator('#slickgrid .slick-row')
      .filter({ hasText: 'fixture-a.wav' })
      .locator('.slick-cell')
      .first()
      .click();
    await page.keyboard.press('Enter');
    expect((await keyboardAudioResponsePromise).status()).toBe(206);
    await expect(page.getByText('Current song:').locator('..')).toContainText('fixture-a.wav');

    await page.locator('#play-pause').click();
    await expect.poll(() => page.locator('#audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  });

  await test.step('filter and restore the library', async () => {
    await page.getByPlaceholder('Find songs').fill('not-in-the-library');
    await expect(page.getByText('No songs found.')).toBeVisible();
    await page.getByRole('button', { name: 'clear' }).click();
    await expect(page.getByText('No songs found.')).toBeHidden();
    await expect(page.getByText('2 songs', { exact: true })).toBeVisible();
  });

  await test.step('log out cleanly', async () => {
    await page.getByRole('button', { name: 'admin' }).click();
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });

  expect(pageErrors).toEqual([]);
});
