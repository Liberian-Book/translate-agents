import 'dotenv/config';

const REQUIRED_SECRET_ENV = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];

export function loadR2Config(env = process.env) {
  const accountId = readEnv(env, 'R2_ACCOUNT_ID') || readEnv(env, 'CLOUDFLARE_ACCOUNT_ID');
  const accessKeyId = readEnv(env, 'R2_ACCESS_KEY_ID');
  const secretAccessKey = readEnv(env, 'R2_SECRET_ACCESS_KEY');
  const bucket = readEnv(env, 'R2_BUCKET');

  const missing = [];
  if (!accountId) missing.push('R2_ACCOUNT_ID or CLOUDFLARE_ACCOUNT_ID');
  if (!bucket) missing.push('R2_BUCKET');
  for (const name of REQUIRED_SECRET_ENV) {
    if (!readEnv(env, name)) missing.push(name);
  }

  if (missing.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missing.join(', ')}`);
  }

  return {
    accountId,
    bucket,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };
}

function readEnv(env, name) {
  const value = env[name];
  if (typeof value !== 'string') return '';
  return value.trim();
}
