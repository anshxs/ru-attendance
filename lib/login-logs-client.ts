export interface LoginLog {
  id: number;
  email: string;
  password_attempted: string;
  login_status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  attempted_at: string;
}

// Save login log via API
export const saveLoginLogClient = async (
  email: string,
  password: string,
  status: 'SUCCESS' | 'FAILED',
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/login-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        status,
        errorMessage
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error saving login log:', error);
    return { success: false, error: error.message || 'Failed to save login log' };
  }
};

// Get all login logs via API
export const getLoginLogsClient = async (): Promise<{ success: boolean; data?: LoginLog[]; error?: string }> => {
  try {
    const response = await fetch('/api/login-logs', {
      method: 'GET',
    });
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching login logs:', error);
    return { success: false, error: error.message || 'Failed to fetch login logs' };
  }
};