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

    console.log('Inserting new user data:', { email, hasProfile: !!userProfile });

    const { error: insertError } = await supabase
      .from('user_data')
      .insert([newUserData]);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('User data inserted successfully');
    return { success: true, alreadyExists: false };
  } catch (error: any) {
    console.error('Error saving user data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save user data' 
    };
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