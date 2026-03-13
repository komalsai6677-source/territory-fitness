import http from 'node:http';

import { verifyToken } from './auth.js';
import { createEngine } from './engine.js';

const PORT = Number(process.env.PORT || 8787);
const engine = await createEngine();

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/auth/register') {
      const body = await readJsonBody(request);
      const authResponse = await engine.registerAccount(body);
      return sendJson(response, 201, authResponse);
    }

    if (request.method === 'POST' && url.pathname === '/auth/login') {
      const body = await readJsonBody(request);
      const result = await engine.loginAccount(body);
      return sendJson(response, result.status, result.error ? { error: result.error } : result.data);
    }

    if (request.method === 'GET' && url.pathname === '/bootstrap') {
      const auth = requireAuth(request);
      return sendJson(response, 200, engine.bootstrap(auth.userId));
    }

    if (request.method === 'GET' && url.pathname === '/leaderboard') {
      return sendJson(response, 200, engine.getLeaderboard());
    }

    if (request.method === 'GET' && url.pathname === '/nearby') {
      const auth = optionalAuth(request);
      return sendJson(response, 200, engine.getNearby(auth?.userId ?? 'you'));
    }

    if (request.method === 'GET' && url.pathname === '/territory') {
      return sendJson(response, 200, engine.getTerritory());
    }

    if (request.method === 'GET' && url.pathname === '/groups') {
      const auth = requireAuth(request);
      return sendJson(response, 200, engine.getGroups(auth.userId));
    }

    if (request.method === 'GET' && url.pathname === '/challenges') {
      const auth = requireAuth(request);
      return sendJson(response, 200, engine.getChallenges(auth.userId));
    }

    if (request.method === 'GET' && url.pathname === '/feed') {
      requireAuth(request);
      return sendJson(response, 200, engine.getFeed());
    }

    if (request.method === 'GET' && url.pathname === '/chat') {
      const auth = requireAuth(request);
      return sendJson(response, 200, engine.getChatMessages(auth.userId, url.searchParams.get('groupId') ?? undefined));
    }

    if (request.method === 'POST' && url.pathname === '/follow') {
      const auth = requireAuth(request);
      const body = await readJsonBody(request);
      const result = await engine.followUser(auth.userId, body.targetUserId);
      return sendJson(response, 200, result);
    }

    if (request.method === 'POST' && url.pathname === '/chat') {
      const auth = requireAuth(request);
      const body = await readJsonBody(request);
      const result = await engine.sendChatMessage(auth.userId, body);
      return sendJson(response, result.status, result.error ? { error: result.error } : result.data);
    }

    if (request.method === 'POST' && url.pathname === '/sessions/start') {
      const auth = requireAuth(request);
      const body = await readJsonBody(request);
      const session = await engine.startSession(auth.userId, body.location, body.mode);
      return sendJson(response, 201, session);
    }

    const locationMatch = url.pathname.match(/^\/sessions\/([^/]+)\/location$/);
    if (request.method === 'POST' && locationMatch) {
      requireAuth(request);
      const body = await readJsonBody(request);
      const result = await engine.ingestLocation(locationMatch[1], body);
      return sendJson(response, result.status, result.error ? { error: result.error } : result.data);
    }

    const stopMatch = url.pathname.match(/^\/sessions\/([^/]+)\/stop$/);
    if (request.method === 'POST' && stopMatch) {
      requireAuth(request);
      const result = await engine.stopSession(stopMatch[1]);
      return sendJson(response, result.status, result.error ? { error: result.error } : result.data);
    }

    sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(response, error.statusCode, { error: error.message });
      return;
    }

    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown server error.' });
  }
});

server.listen(PORT, () => {
  console.log(`Territory Fitness server listening on http://localhost:${PORT}`);
});

function requireAuth(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authorization token is required.');
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = verifyToken(token);

  if (!payload?.userId) {
    throw new HttpError(401, 'Authorization token is invalid.');
  }

  return payload;
}

function optionalAuth(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  return verifyToken(token);
}

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Content-Type', 'application/json');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode);
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      try {
        const rawBody = Buffer.concat(chunks).toString() || '{}';
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(new HttpError(400, 'Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
