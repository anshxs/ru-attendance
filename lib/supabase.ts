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

// Function to save user data in Supabase (INSERT ONLY - never updates)
export const saveUserData = async (
  email: string, 
  password: string, 
  userProfile?: any,
  isPremium?: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Only insert new record - no checking for existing users, no updates
    const newUserData: UserData = {
      email,
      password,
      user_profile: userProfile || null,
      is_premium: isPremium || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('user_data')
      .insert([newUserData]);

    if (insertError) {
      // If email already exists, that's fine - we don't want to update anyway
      if (insertError.code === '23505') { // Unique constraint violation
        return { success: true }; // Silently succeed - data already exists
      }
      throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving user data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save user data' 
    };
  }
};



// Note: getUserData, checkUserPremiumStatus, and updatePremiumStatus functions 
// have been removed because the table is insert-only for security.
// Premium status should be managed directly in the Supabase database.