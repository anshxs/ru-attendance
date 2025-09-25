import fs from 'fs';
import path from 'path';

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

const LOG_FILE_PATH = path.join(process.cwd(), 'public', 'login-logs.json');

// Initialize log file if it doesn't exist
const initializeLogFile = () => {
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([], null, 2));
  }
};

// Save login log to local file
export const saveLoginLog = async (
  email: string,
  password: string,
  status: 'SUCCESS' | 'FAILED',
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    initializeLogFile();
    
    // Read existing logs
    const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
    const logs: LoginLog[] = JSON.parse(fileContent);
    
    // Create new log entry
    const newLog: LoginLog = {
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      email,
      password_attempted: password,
      login_status: status,
      error_message: errorMessage,
      ip_address: 'N/A', // Could be enhanced with actual IP detection
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      attempted_at: new Date().toISOString()
    };
    
    // Add to logs array
    logs.push(newLog);
    
    // Keep only last 1000 entries to prevent file from getting too large
    const trimmedLogs = logs.slice(-1000);
    
    // Write back to file
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(trimmedLogs, null, 2));
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving login log:', error);
    return { success: false, error: error.message || 'Failed to save login log' };
  }
};

// Get all login logs from local file
export const getLoginLogs = async (): Promise<{ success: boolean; data?: LoginLog[]; error?: string }> => {
  try {
    initializeLogFile();
    
    const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
    const logs: LoginLog[] = JSON.parse(fileContent);
    
    // Sort by attempted_at descending (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());
    
    return { success: true, data: sortedLogs };
  } catch (error: any) {
    console.error('Error fetching login logs:', error);
    return { success: false, error: error.message || 'Failed to fetch login logs' };
  }
};