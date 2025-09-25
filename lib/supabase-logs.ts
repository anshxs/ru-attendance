import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LoginLog {
  id?: number;
  email: string;
  password_attempted: string;
  login_status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  attempted_at?: string;
}

// Save login log directly to Supabase
export const saveLoginLogSupabase = async (
  email: string,
  password: string,
  status: 'SUCCESS' | 'FAILED',
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const loginLog: Omit<LoginLog, 'id'> = {
      email,
      password_attempted: password,
      login_status: status,
      error_message: errorMessage,
      ip_address: 'N/A', // Could be enhanced with actual IP detection
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      attempted_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('login_logs')
      .insert([loginLog]);

    if (error) {
      console.error('Error saving login log to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving login log:', error);
    return { success: false, error: error.message || 'Failed to save login log' };
  }
};

// Get all login logs from Supabase
export const getLoginLogsSupabase = async (): Promise<{ success: boolean; data?: LoginLog[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('attempted_at', { ascending: false });

    if (error) {
      console.error('Error fetching login logs from Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching login logs:', error);
    return { success: false, error: error.message || 'Failed to fetch login logs' };
  }
};