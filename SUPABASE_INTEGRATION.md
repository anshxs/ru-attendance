# Supabase Integration for User Profile Storage

This integration automatically saves user login credentials and profile information to a Supabase database.

## ⚠️ Security Notice

**WARNING**: This implementation stores passwords in plain text as requested. This is NOT RECOMMENDED for production use and poses significant security risks. Consider using proper password hashing in production environments.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from the project settings

### 2. Set Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

### 3. Create Database Table
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script to create the `user_data` table

### 4. Test the Integration
1. Start your development server: `npm run dev`
2. Log in with any user account
3. The system will automatically save:
   - User email and password (unencrypted)
   - Complete user profile JSON

## What Gets Stored

### User Credentials & Profile (on successful login)
- Email address and password (unencrypted as requested)
- Complete user profile from the API
- Enrollment details, personal information, program info, etc.
- Premium status for feature access

### Login Attempt Logs (every login attempt)
- Email and attempted password
- Login status (SUCCESS/FAILED)
- Error messages for failed attempts
- IP address and user agent information
- Timestamp of attempt

All login attempts are automatically logged for security monitoring and debugging purposes.

## Database Schema

### User Data Table
```sql
user_data {
  id: BIGSERIAL PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  password: TEXT NOT NULL
  user_profile: JSONB
  is_premium: BOOLEAN DEFAULT FALSE
  created_at: TIMESTAMP WITH TIME ZONE
  updated_at: TIMESTAMP WITH TIME ZONE
}
```

### Login Logs Table
```sql
login_logs {
  id: BIGSERIAL PRIMARY KEY
  email: VARCHAR(255) NOT NULL
  password_attempted: TEXT NOT NULL
  login_status: VARCHAR(20) CHECK IN ('SUCCESS', 'FAILED')
  error_message: TEXT
  ip_address: VARCHAR(45)
  user_agent: TEXT
  attempted_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}
```

## Usage

### Automatic Data Collection
User profile data is automatically collected and stored when users log in through the existing login system.

### Manual Profile Sync
You can also trigger manual profile syncing using the `DataSync` component:

```jsx
import { DataSync } from '@/components/data-sync';

// In your component
<DataSync userEmail="user@example.com" />
```

### Accessing Stored Data
```javascript
import { getUserData } from '@/lib/supabase';

const userData = await getUserData('user@example.com');
console.log(userData.user_profile);
console.log(userData.email);
```

## API Functions

### User Data Functions
- `saveUserData(email, password, userProfile?, isPremium?)` - Saves user data (INSERT only)
- `checkUserExists(email)` - Checks if user exists using secure view
- `checkUserPremiumStatus(email)` - Gets user premium status

### Login Logging Functions
- `saveLoginLog(email, password, status, errorMessage?)` - Records login attempts
- `getLoginLogs()` - Retrieves all login logs for admin view (with pagination support)

### Security Features
- Public views for secure data access
- Automatic login attempt logging
- Premium user access control

## Files Modified/Created

### Core Integration
- `lib/supabase.ts` - Supabase configuration and data functions
- `lib/auth.ts` - Modified to integrate with Supabase and login logging
- `supabase-setup.sql` - Database tables and views creation script
- `.env.local.example` - Environment variables template

### UI Components
- `components/data-sync.tsx` - Manual sync component
- `app/login-logs/page.tsx` - Admin interface for viewing login logs
- `components/sidebar.tsx` - Updated to include Login Logs menu

### Features Added
- **Login Logs Dashboard**: View all login attempts with filtering and search
- **Real-time Logging**: Automatic logging of successful and failed login attempts
- **Security Monitoring**: Track suspicious login patterns and failed attempts
- **Admin Interface**: Premium feature for viewing login analytics

## Troubleshooting

1. **Supabase connection fails**: Check your environment variables
2. **Table doesn't exist**: Run the SQL script in Supabase dashboard
3. **Data not saving**: Check browser console for error messages
4. **API calls failing**: Ensure user is authenticated before data collection

## Production Considerations

1. **Security**: Implement proper password hashing
2. **Data Privacy**: Consider data retention policies
3. **Performance**: Add data caching and pagination
4. **Monitoring**: Add logging and error tracking
5. **Backup**: Implement regular database backups