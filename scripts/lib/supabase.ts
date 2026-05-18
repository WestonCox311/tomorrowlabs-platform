import './env';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local exists with both values.');
  process.exit(1);
}

// Node 20 lacks native WebSocket — pass ws as the realtime transport.
export const supabase = createClient(url, key, {
  realtime: { transport: ws },
});
