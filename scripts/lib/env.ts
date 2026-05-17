import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local into process.env (does not override existing env vars)
const envPath = join(process.cwd(), '.env.local');
try {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // .env.local not present — rely on actual environment variables
}
