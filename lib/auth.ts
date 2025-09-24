import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://rishiverse-api.rishihood.edu.in/api/v1';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userToken: string;
  sessionToken: string;
  role: string;
  permissions: string[];
}

export interface ResetPasswordRequest {
  email: string;
}

export interface RefreshSessionRequest {
  user_token: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'LECTURE' | 'NOTICE' | 'MESS' | 'CLUB_EVENT';
  allDay: boolean;
  details: {
    courseCode?: string;
    faculty?: string;
    classroom?: string;
    description?: string;
    venue?: string;
    menu?: string;
    club?: string;
  };
}

export interface CreateGatepassRequest {
  outTime: string;
  inTime: string;
  outLocation: string;
  reason: string;
}

export interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: string;
  sections: {
    id: string;
    name: string;
  }[];
}

export interface SemesterData {
  program: {
    name: string;
    code: string;
  };
  semesterNumber: number;
  courses: Course[];
}

export interface AttendanceLecture {
  lectureId: string;
  topic: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  classroom: {
    id: string;
    roomNumber: string;
    building: string;
    floor: number;
  };
  faculty: {
    id: string;
    name: string;
  };
  attendance: {
    status: string;
    markedAt: string;
    concern: string | null;
  };
}

export interface CourseAttendance {
  course: {
    id: string;
    name: string;
    code: string;
    credits: number;
  };
  section: {
    id: string;
    name: string;
  };
  summary: {
    totalLectures: number;
    attendedLectures: number;
    absentLectures: number;
    attendancePercentage: number;
    requiredAttendance: number;
  };
  lectures: AttendanceLecture[];
}

export interface UserProfile {
  enrollmentNo: string;
  fullName: string;
  firstName: string;
  lastName: string;
  ruEmailId: string;
  gender: string;
  bloodGroup: string;
  status: string;
  emailId: string;
  mobileNumber: string;
  hostelNo: string;
  roomNo: string;
  studentPrograms: Array<{
    programBatch: {
      batchNumber: number;
      program: {
        name: string;
      };
    };
  }>;
  educationHistory: Array<{
    type: string;
    instituteName: string;
    boardUniversity: string;
    yearOfPassing: number;
    stream?: string;
  }>;
  [key: string]: any; // For other fields
}

export interface UpdateGatepassRequest {
  id: number;
  action: 'approve' | 'reject';
}

export interface GatepassResponse {
  id: string;
  outTime: string;
  inTime: string;
  outLocation: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gatepass {
  id: string;
  studentId: string;
  outTime: string;
  inTime: string;
  outLocation: string;
  reason: string;
  status: 'CREATED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
}

export interface GatepassListResponse {
  data: Gatepass[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MessMenuItem {
  id: number;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  menuItems: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface MessTimings {
  id: number;
  BREAKFAST: string;
  LUNCH: string;
  SNACKS: string;
  DINNER: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface MessMenuResponse {
  todaysmenu: MessMenuItem[];
  groupedMenu: {
    BREAKFAST: string[];
    LUNCH: string[];
    SNACKS: string[];
    DINNER: string[];
  };
  timings: MessTimings;
}

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication functions
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  
  // Save user data to Supabase after successful login
  try {
    const { saveUserData } = await import('./supabase');
    
    // Set the auth token first so subsequent API calls work
    setAuthToken(response.data.userToken);
    
    // Get user profile data
    let userProfile = null;
    try {
      userProfile = await getUserProfile();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Save to Supabase (only creates new record if user doesn't exist)
    const saveResult = await saveUserData(
      credentials.email, 
      credentials.password, // Storing unencrypted as requested
      userProfile
    );
    
    if (!saveResult.success) {
      console.error('Failed to save user data to Supabase:', saveResult.error);
    }
  } catch (error) {
    console.error('Error during Supabase integration:', error);
    // Don't fail the login if Supabase fails
  }
  
  return response.data;
};

export const resetPasswordRequest = async (email: ResetPasswordRequest): Promise<void> => {
  await apiClient.post('/auth/reset-password/request', email);
};

export const refreshSession = async (userToken: RefreshSessionRequest): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/refresh-session', userToken);
  return response.data;
};

// Calendar functions
export const getCalendarEvents = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  const response = await apiClient.get('/calendar', {
    params: {
      startDate,
      endDate
    }
  });
  return response.data;
};

// Gatepass functions
export const createGatepass = async (gatepassData: CreateGatepassRequest): Promise<GatepassResponse> => {
  const response = await apiClient.post('/gatepass', gatepassData);
  return response.data;
};

export const updateGatepass = async (updateData: UpdateGatepassRequest): Promise<GatepassResponse> => {
  const response = await apiClient.patch('/gatepass', updateData);
  return response.data;
};

// User profile function
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/user');
  return response.data;
};

// Courses and attendance functions
export const getUserCourses = async (studentId: string): Promise<SemesterData> => {
  const response = await apiClient.get(`/students/${studentId}/academics/semesters/-1`);
  return response.data;
};

export const getCourseAttendance = async (studentId: string, courseId: string): Promise<CourseAttendance> => {
  const response = await apiClient.get(`/students/${studentId}/courses/${courseId}/attendance`);
  return response.data;
};

// Get all gatepasses with pagination
export const getAllGatepasses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
}): Promise<GatepassListResponse> => {
  const response = await apiClient.get('/gatepass', { params });
  return response.data;
};

// Get user's own gatepasses
export const getUserGatepasses = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: string;
}): Promise<Gatepass[]> => {
  const response = await apiClient.get('/gatepass/self', { params });
  return response.data;
};

// Get mess menu for a specific date
export const getMessMenu = async (date: string): Promise<MessMenuResponse> => {
  const response = await apiClient.get('/mess', {
    params: { date }
  });
  return response.data;
};

// Token management - Using sessionStorage for temporary storage (clears on browser refresh)
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_token', token);
  }
};

export const getAuthToken = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('auth_token') || undefined;
  }
  return undefined;
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_token');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};