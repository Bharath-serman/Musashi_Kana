import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Warning: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing. " +
    "Admin operations will fail or fall back to the anonymous key."
  );
}

// Create a server-only client using the service role key to bypass RLS.
// Falls back to anon key if service key is missing (for safety).
export const supabaseService = createClient(
  supabaseUrl || '',
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
