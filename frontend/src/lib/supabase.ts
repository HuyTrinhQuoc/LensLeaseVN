import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export async function setSupabaseJWT(jwtToken: string) {
  try {
    const { error } = await supabase.auth.setSession({
      access_token: jwtToken,
      refresh_token: '', // Not needed for custom JWT
    });

    if (error) {
      console.error('Error setting Supabase session:', error);
      return false;
    }

    console.log('Supabase JWT session set successfully');
    return true;
  } catch (err) {
    console.error('Failed to set Supabase JWT:', err);
    return false;
  }
}
