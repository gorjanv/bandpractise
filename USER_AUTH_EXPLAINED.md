# How Users Are Created and Stored

## Overview

Users are **NOT stored in your custom tables**. They are managed entirely by **Supabase Auth** and stored in Supabase's built-in authentication system.

## Where Users Are Stored

### 1. **Supabase Auth System** (`auth.users` table)

When a user signs up, Supabase Auth automatically creates an entry in the `auth.users` table. This table is **managed by Supabase** and you don't create it manually.=

**Location**: Supabase Dashboard → Authentication → Users

**What's stored there:**
- `id` (UUID) - Unique user identifier
- `email` - User's email address
- `encrypted_password` - Hashed password (never plain text)
- `user_metadata` (JSON) - Custom data like `name`
- `created_at` - Account creation timestamp
- `email_confirmed_at` - When email was verified (if email confirmation is enabled)
- And other Supabase Auth fields

**Example user in `auth.users`:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "user_metadata": {
    "name": "John Doe"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 2. **Your App Tables** (songs and votes)

Your custom tables **reference** users but don't store user data directly:

**`songs` table:**
- `user_id` (UUID) → References `auth.users(id)`
- `added_by_name` (TEXT) → Display name (from `user_metadata.name`)

**`votes` table:**
- `user_id` (UUID) → References `auth.users(id)`
- `voter_name` (TEXT) → Display name

These are **foreign key relationships**, not duplicate user storage.

## How User Creation Works

### Step-by-Step Sign Up Process

1. **User fills out form** (`components/AuthModal.tsx`)
   - Enters: Email, Password, Name
   - Clicks "Sign Up"

2. **Your app calls `signUp()`** (`contexts/AuthContext.tsx`)
   ```typescript
   supabase.auth.signUp({
     email: "john@example.com",
     password: "securepassword123",
     options: {
       data: {
         name: "John Doe"  // Stored in user_metadata
       }
     }
   })
   ```

3. **Supabase Auth handles everything:**
   - ✅ Validates email format
   - ✅ Hashes the password (bcrypt)
   - ✅ Creates user in `auth.users` table
   - ✅ Stores name in `user_metadata`
   - ✅ Generates unique UUID for the user
   - ✅ Sends confirmation email (if enabled)
   - ✅ Returns session token

4. **Your app receives:**
   - `User` object with:
     - `id` (UUID)
     - `email`
     - `user_metadata.name`
   - `Session` object (access token)
   - **Never receives the password** (not even hashed)

5. **When user adds a song/vote:**
   - Your API routes get `user.id` from the session
   - Stores `user_id` in `songs` or `votes` table
   - Uses `user.user_metadata.name` for display name

## Database Structure

```
┌─────────────────────────────────┐
│     Supabase Auth System        │
│  (Managed by Supabase)          │
│                                 │
│  auth.users table:              │
│  - id (UUID)                    │
│  - email                        │
│  - encrypted_password           │
│  - user_metadata {name: "..."}  │
│  - created_at                   │
└─────────────────────────────────┘
           │
           │ user_id references auth.users(id)
           │
           ▼
┌─────────────────────────────────┐
│      Your App Tables            │
│                                 │
│  songs table:                   │
│  - id                           │
│  - user_id → auth.users(id)     │
│  - added_by_name                │
│  - title, artist, etc.          │
│                                 │
│  votes table:                   │
│  - id                           │
│  - user_id → auth.users(id)     │
│  - voter_name                   │
│  - song_id, rating, comment     │
└─────────────────────────────────┘
```

## How to View Users in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. You'll see all registered users with:
   - Email
   - User ID (UUID)
   - Creation date
   - Metadata (including the name)

## Important Points

### ✅ What You DON'T Need to Do:
- ❌ Create a users table
- ❌ Handle password hashing
- ❌ Manage authentication tokens
- ❌ Store passwords anywhere

### ✅ What Supabase Handles:
- ✅ User registration
- ✅ Password hashing and storage
- ✅ Session management
- ✅ Email verification
- ✅ Password reset flows
- ✅ JWT token generation

### ✅ What Your App Does:
- ✅ Calls `supabase.auth.signUp()` to register users
- ✅ Stores user's `id` (UUID) in your tables when they add songs/votes
- ✅ Uses `user.user_metadata.name` for display names
- ✅ Validates authentication before allowing actions

## Example Flow

**User signs up:**
```
1. User: "Sign me up! Email: john@example.com, Password: secret123, Name: John"
2. Your app → supabase.auth.signUp() → Supabase Auth
3. Supabase creates:
   - auth.users row with id: "abc-123-def-456"
   - Stores hashed password
   - Stores name in user_metadata
4. User adds a song:
   - Your API gets user.id = "abc-123-def-456"
   - Inserts into songs: { user_id: "abc-123-def-456", added_by_name: "John", ... }
```

**User signs in later:**
```
1. User: "Sign me in! Email: john@example.com, Password: secret123"
2. Your app → supabase.auth.signInWithPassword() → Supabase Auth
3. Supabase validates credentials
4. Returns session with user.id = "abc-123-def-456"
5. Your app uses this ID for all operations
```

## Security Benefits

1. **Passwords never touch your code** - Supabase handles everything
2. **User data is isolated** - Stored in Supabase's secure auth system
3. **UUIDs are used** - Hard to guess or enumerate
4. **RLS policies work** - `auth.uid()` automatically refers to the authenticated user's ID

## Summary

- **Users are stored in**: `auth.users` table (Supabase's built-in auth system)
- **Your tables store**: `user_id` references that link to `auth.users(id)`
- **User creation happens**: Automatically when `supabase.auth.signUp()` is called
- **You never see passwords**: They're hashed and stored securely by Supabase
- **To view users**: Go to Supabase Dashboard → Authentication → Users

