import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
}
// Public client for user-facing operations
export const supabase = createClient(supabaseUrl, supabaseKey);
// Admin client for service operations (if service role key is available)
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : supabase;
export async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1);
        if (error)
            throw error;
        console.log('✓ Supabase connection successful');
        return true;
    }
    catch (error) {
        console.error('✗ Supabase connection failed:', error);
        return false;
    }
}
//# sourceMappingURL=supabase.js.map