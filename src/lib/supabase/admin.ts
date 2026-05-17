import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Service-role client for server-side admin operations.
// Uses createClient (not createServerClient) so the service_role key is
// always the Authorization token — never replaced by the user's session JWT.
// Never import this in client components or expose it to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
