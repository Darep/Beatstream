import { expect, test } from '@playwright/test';

import { createLastFMPlaybackTracker } from '../src/utils/LastFMPlayback';

const update = (
  tracker: ReturnType<typeof createLastFMPlaybackTracker>,
  position: number,
  now: number,
  overrides: Partial<Parameters<typeof tracker>[0]> = {},
) => tracker({ duration: 100, now, playbackCount: 1, position, state: 'playing', ...overrides });

test('counts playback progress but not seeks', () => {
  const tracker = createLastFMPlaybackTracker();

  expect(update(tracker, 0, 0).started).toBe(true);
  update(tracker, 10, 10_000);
  update(tracker, 80, 10_100);
  update(tracker, 5, 11_000);
  expect(update(tracker, 44, 50_000).shouldScrobble).toBe(false);
  expect(update(tracker, 45, 51_000).shouldScrobble).toBe(true);
});

test('excludes paused time', () => {
  const tracker = createLastFMPlaybackTracker();

  update(tracker, 0, 0, { duration: 60 });
  update(tracker, 12, 12_000, { duration: 60, state: 'paused' });
  update(tracker, 12, 112_000, { duration: 60, state: 'paused' });
  update(tracker, 12, 112_000, { duration: 60 });
  expect(update(tracker, 29, 129_000, { duration: 60 }).shouldScrobble).toBe(false);
  expect(update(tracker, 30, 130_000, { duration: 60 }).shouldScrobble).toBe(true);
});

test('distinguishes repeated plays of the same track', () => {
  const tracker = createLastFMPlaybackTracker();

  update(tracker, 0, 0);
  expect(update(tracker, 50, 50_000).shouldScrobble).toBe(true);
  expect(update(tracker, 0, 51_000, { playbackCount: 2 }).started).toBe(true);
  expect(update(tracker, 49, 100_000, { playbackCount: 2 }).shouldScrobble).toBe(false);
  expect(update(tracker, 50, 101_000, { playbackCount: 2 }).shouldScrobble).toBe(true);
});

test('requires tracks to be longer than thirty seconds', () => {
  const tracker = createLastFMPlaybackTracker();

  update(tracker, 0, 0, { duration: 30 });
  expect(update(tracker, 30, 30_000, { duration: 30 }).shouldScrobble).toBe(false);
  update(tracker, 0, 31_000, { duration: 31, playbackCount: 2 });
  expect(update(tracker, 15.5, 46_500, { duration: 31, playbackCount: 2 }).shouldScrobble).toBe(true);
});

test('caps the threshold at four minutes', () => {
  const tracker = createLastFMPlaybackTracker();

  update(tracker, 0, 0, { duration: 1_000 });
  expect(update(tracker, 239, 239_000, { duration: 1_000 }).shouldScrobble).toBe(false);
  expect(update(tracker, 240, 240_000, { duration: 1_000 }).shouldScrobble).toBe(true);
});

test('starts counting when Last.fm becomes available during playback', () => {
  const tracker = createLastFMPlaybackTracker();

  const initial = update(tracker, 100, 5_000);

  expect(initial).toEqual({ shouldScrobble: false, started: true });
  expect(update(tracker, 150, 55_000).shouldScrobble).toBe(true);
});

test('waits for restored playback to resume', () => {
  const tracker = createLastFMPlaybackTracker();

  expect(update(tracker, 40, 5_000, { state: 'paused' }).started).toBe(false);
  expect(update(tracker, 40, 6_000).started).toBe(true);
  expect(update(tracker, 90, 56_000).shouldScrobble).toBe(true);
});
