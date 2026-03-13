import crypto from 'node:crypto';

const SECRET = process.env.TERRITORY_APP_SECRET ?? 'territory-fitness-dev-secret';

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt);
  return `${salt}:${derivedKey}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [salt, expected] = storedHash.split(':');
  const derivedKey = await scryptAsync(password, salt);
  return crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(expected, 'hex'));
}

export function createToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifyToken(token) {
  const [body, signature] = token.split('.');
  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
}

function sign(body) {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString('hex'));
    });
  });
}
