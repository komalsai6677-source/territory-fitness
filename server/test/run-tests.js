import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';

import { createEngine, validateMovement } from '../src/engine.js';

await cleanupDb();

await run('validateMovement rejects unrealistic speed spikes', () => {
  const previousLocation = { latitude: 18.9382, longitude: 72.8355 };
  const previousTimestamp = 1000;

  const result = validateMovement(previousLocation, previousTimestamp, {
    latitude: 18.9482,
    longitude: 72.8455,
    timestamp: 2000,
    accuracyMeters: 10,
  });

  assert.equal(result.ok, false);
  assert.match(result.reason, /unrealistic/i);
});

await run('engine registration and login flow returns auth token', async () => {
  const engine = await createEngine();
  const registered = await engine.registerAccount({
    email: 'runner@example.com',
    password: 'strong-pass',
    name: 'Runner',
  });

  assert.ok(registered.token);
  assert.equal(registered.user.name, 'Runner');

  const login = await engine.loginAccount({
    email: 'runner@example.com',
    password: 'strong-pass',
  });

  assert.equal(login.status, 200);
  assert.ok(login.data.token);
});

await run('engine session flow captures tiles and updates leaderboard', async () => {
  const engine = await createEngine();
  const started = await engine.startSession('you', { latitude: 18.9382, longitude: 72.8355 });

  const accepted = await engine.ingestLocation(started.id, {
    latitude: 18.93825,
    longitude: 72.83555,
    timestamp: Date.now() + 7000,
    accuracyMeters: 8,
  });

  assert.equal(accepted.status, 200);
  assert.equal(accepted.data.status, 'active');

  const stopped = await engine.stopSession(started.id);
  assert.equal(stopped.status, 200);
  assert.equal(stopped.data.status, 'finished');

  const leaderboard = engine.getLeaderboard();
  const you = leaderboard.find((entry) => entry.name === 'You');

  assert.ok(you);
  assert.ok(you.tiles >= 125);
});

await run('bootstrap returns nearby runners and territory', async () => {
  const engine = await createEngine();
  const bootstrap = engine.bootstrap('you');

  assert.ok(bootstrap.nearby.length >= 2);
  assert.ok(bootstrap.territory.length >= 4);
  assert.ok(bootstrap.feed.length >= 1);
  assert.ok(bootstrap.challenges.length >= 1);
  assert.ok(bootstrap.chatMessages.length >= 1);
});

await run('group chat message persists through engine', async () => {
  const engine = await createEngine();
  const sent = await engine.sendChatMessage('you', { groupId: 'g1', text: 'Ready for tonight?' });

  assert.equal(sent.status, 201);
  const messages = engine.getChatMessages('you', 'g1');
  assert.ok(messages.some((message) => message.text === 'Ready for tonight?'));
});

console.log('All server tests passed.');

async function run(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

async function cleanupDb() {
  await rm(new URL('../data/db.json', import.meta.url), { force: true });
}
