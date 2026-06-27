import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_HOODA_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = import.meta.env.VITE_HOODA_SERVICE_ROLE_KEY as string;

export const hooda = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
