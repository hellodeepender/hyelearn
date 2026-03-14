// TODO: Install @supabase/supabase-js and configure client
// import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Placeholder export until Supabase is configured
export { supabaseUrl, supabaseAnonKey };
