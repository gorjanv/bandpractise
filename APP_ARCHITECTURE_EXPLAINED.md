# How Your App Works: Complete Architecture Guide

## Overview

Your app is a **Next.js 16 application** using the **App Router** architecture. It's a **full-stack** application with:
- **Server-side rendering** (SSR) for initial page loads
- **Client-side interactivity** for dynamic features
- **API routes** for backend logic
- **Database** (Supabase) for data storage
- **Real-time updates** via Supabase subscriptions

## The Big Picture: Server vs Client

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER (Client)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Components (Client Components)              │    │
│  │  - Dashboard UI                                    │    │
│  │  - Vote Page UI                                    │    │
│  │  - Navigation                                      │    │
│  │  - Modals                                          │    │
│  │  - Styled Components                               │    │
│  │  - AuthContext (React Context)                     │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                  │
│                          │ HTTP Requests                    │
│                          │ (fetch, form submissions)        │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    NEXT.JS SERVER                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Server Components (app/layout.tsx, app/page.tsx) │    │
│  │  - Initial HTML generation                         │    │
│  │  - Metadata generation                             │    │
│  │  - Font loading                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────┐        │
│  │  API Routes (app/api/*)                         │        │
│  │  - /api/songs                                    │        │
│  │  - /api/votes                                    │        │
│  │  - Handles authentication                        │        │
│  │  - Database queries                              │        │
│  └───────────────────────┼───────────────────────┘        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│              SUPABASE (External Service)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - PostgreSQL Database (songs, votes tables)      │    │
│  │  - Authentication Service                         │    │
│  │  - Real-time Subscriptions                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## What Happens When: Request Flow

### 1. Initial Page Load (Server-Side)

```
User visits: https://yourapp.com/

┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Browser Request                                     │
│                                                             │
│ GET / HTTP/1.1                                              │
│ Host: yourapp.com                                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Next.js Server Receives Request                    │
│                                                             │
│ Next.js looks at: app/page.tsx                             │
│                                                             │
│ ❌ But wait! It has 'use client' directive                │
│    This means: "Execute on CLIENT, not server"            │
│                                                             │
│ So Next.js:                                                │
│ 1. Loads app/layout.tsx (Server Component)                │
│ 2. Generates initial HTML shell                            │
│ 3. Sends HTML + JavaScript bundle to browser              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Browser Receives Response                          │
│                                                             │
│ HTML contains:                                             │
│ - <html>, <body> structure                                 │
│ - Links to JavaScript bundles                              │
│ - Font files (Geist Sans, Geist Mono)                     │
│                                                             │
│ Browser then:                                              │
│ 1. Parses HTML                                             │
│ 2. Downloads JavaScript bundles                            │
│ 3. Executes React code (Hydration)                        │
│ 4. Makes page interactive                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Page Hydration (Client-Side)

```
After JavaScript loads:

┌─────────────────────────────────────────────────────────────┐
│ STEP 1: React Hydration                                    │
│                                                             │
│ React "takes over" the HTML and makes it interactive      │
│                                                             │
│ Executes in order:                                         │
│ 1. Providers component (app/layout.tsx)                    │
│    ├── ThemeProvider (styled-components)                   │
│    └── AuthProvider (AuthContext)                          │
│                                                             │
│ 2. Navigation component                                    │
│    - Checks auth state (useAuth())                        │
│    - Renders navigation links                              │
│                                                             │
│ 3. Dashboard page (app/page.tsx)                          │
│    - Checks if user is logged in                          │
│    - Shows auth modal if not logged in                    │
│    - Starts loading songs data                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Authentication Check                               │
│                                                             │
│ AuthContext.tsx (Client Component)                        │
│                                                             │
│ useEffect runs:                                            │
│ 1. Calls supabase.auth.getSession()                       │
│    - Checks localStorage for session token                │
│    - Validates token with Supabase                        │
│    - Returns user object if valid                         │
│                                                             │
│ 2. Sets up listener:                                       │
│    supabase.auth.onAuthStateChange()                      │
│    - Listens for login/logout events                      │
│    - Updates user state automatically                     │
│                                                             │
│ Result: user state is set in React Context                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Data Fetching                                      │
│                                                             │
│ Dashboard component (app/page.tsx)                        │
│                                                             │
│ useEffect runs (if user is logged in):                    │
│ 1. Calls loadSongs() function                             │
│                                                             │
│ 2. Makes API request:                                      │
│    fetch('/api/songs')                                     │
│    │                                                       │
│    └──► Next.js API Route Handler                         │
│         app/api/songs/route.ts                            │
│                                                             │
│ 3. API Route (Server-Side):                               │
│    - Runs on Next.js server                               │
│    - Connects to Supabase database                        │
│    - Queries songs table                                  │
│    - Calculates vote statistics                           │
│    - Returns JSON response                                │
│                                                             │
│ 4. Dashboard receives response:                           │
│    - Updates songs state                                  │
│    - Renders song tiles                                   │
│    - Shows voting UI                                      │
└─────────────────────────────────────────────────────────────┘
```

## Understanding 'use client' vs Server Components

### Server Components (Default in Next.js)

```tsx
// app/layout.tsx - NO 'use client' directive
// This runs on the SERVER

export default function RootLayout({ children }) {
  // ✅ Can access file system
  // ✅ Can use Node.js APIs
  // ✅ Can directly query databases
  // ✅ Runs during SSR (Server-Side Rendering)
  // ❌ Cannot use useState, useEffect
  // ❌ Cannot use browser APIs (window, localStorage)
  // ❌ Cannot use event handlers (onClick, etc.)
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Client Components ('use client')

```tsx
// app/page.tsx - HAS 'use client' directive
// This runs on the CLIENT (browser)

'use client'; // <-- This makes it a Client Component

export default function Dashboard() {
  // ✅ Can use useState, useEffect
  // ✅ Can use browser APIs (localStorage, window)
  // ✅ Can use event handlers (onClick, onChange)
  // ✅ Can use React Context
  // ✅ Can use styled-components
  // ❌ Cannot access file system
  // ❌ Cannot use Node.js APIs
  // ❌ Cannot directly query databases
  
  const { user } = useAuth(); // React Context - client-side
  const [songs, setSongs] = useState([]); // State - client-side
  
  return <div>Dashboard UI</div>;
}
```

## File-by-File Breakdown

### 1. app/layout.tsx (Server Component)

```tsx
// This runs on the SERVER first, then client hydrates it

export default function RootLayout({ children }) {
  // SERVER-SIDE:
  // - Loads fonts (Geist Sans, Geist Mono)
  // - Generates initial HTML structure
  // - Sets up metadata (for SEO)
  
  return (
    <html>
      <body>
        {/* These wrap everything - available globally */}
        <Providers>
          {/* AuthProvider & ThemeProvider */}
          <Navigation />
          {children} {/* This is where pages render */}
        </Providers>
      </body>
    </html>
  );
}
```

**What happens:**
- **Server**: Generates HTML structure with font links
- **Client**: React hydrates and Providers initialize (AuthContext, ThemeProvider)

### 2. app/page.tsx (Client Component)

```tsx
'use client'; // <-- Executes on CLIENT

export default function Dashboard() {
  // CLIENT-SIDE:
  // - Uses React hooks (useState, useEffect)
  // - Uses React Context (useAuth)
  // - Makes API calls (fetch)
  // - Handles user interactions
  
  const { user } = useAuth(); // From AuthContext
  const [songs, setSongs] = useState([]);
  
  useEffect(() => {
    if (user) {
      loadSongs(); // Makes fetch('/api/songs')
    }
  }, [user]);
  
  return <div>Dashboard UI</div>;
}
```

**What happens:**
- **Client**: Component renders, checks auth, fetches data, updates UI

### 3. app/api/songs/route.ts (API Route - Server)

```tsx
// This runs ONLY on the SERVER
// It's an API endpoint, not a component

export async function GET(request: NextRequest) {
  // SERVER-SIDE:
  // - Receives HTTP request
  // - Can access databases
  // - Can use server-only libraries
  // - Returns JSON response
  
  const supabase = createServerClientForRoute(request);
  
  // Query database
  const { data: songs } = await supabase
    .from('songs')
    .select('*');
  
  // Return JSON
  return NextResponse.json(songs);
}
```

**What happens:**
- **Server**: Receives request → queries database → returns JSON
- **Client**: Receives JSON → updates React state → re-renders UI

### 4. contexts/AuthContext.tsx (Client Component)

```tsx
'use client'; // Must be client component (uses hooks)

export function AuthProvider({ children }) {
  // CLIENT-SIDE:
  // - Manages React state (user, session)
  // - Uses browser APIs (Supabase client)
  // - Listens to auth events
  
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Runs on CLIENT when component mounts
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    
    // Listen for auth changes (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**What happens:**
- **Client**: Initializes → checks session → sets up listeners → provides context
- **Server**: Not involved (this is client-side state)

### 5. lib/supabase.ts (Client Library)

```tsx
// This creates a Supabase client for CLIENT-SIDE use
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**What happens:**
- Used by **client components** (AuthContext, components)
- Makes requests from **browser** to Supabase
- Handles authentication (tokens stored in browser localStorage)
- Can subscribe to real-time updates

### 6. lib/supabase-server.ts (Server Library)

```tsx
// This creates a Supabase client for SERVER-SIDE use
export function createServerClientForRoute(request: NextRequest) {
  // SERVER-SIDE:
  // - Uses server-side authentication
  // - Reads cookies/tokens from request
  // - Cannot use localStorage (that's browser-only)
  
  return createServerClient(...);
}
```

**What happens:**
- Used by **API routes** (server-side)
- Reads auth tokens from HTTP request headers
- Makes authenticated requests to Supabase from server
- More secure (credentials never exposed to client)

## Routing: How URLs Work

### File-Based Routing (Next.js App Router)

```
app/
├── layout.tsx          → Wraps all pages
├── page.tsx            → Route: /
├── vote/
│   └── page.tsx        → Route: /vote
└── api/
    └── songs/
        ├── route.ts    → Route: /api/songs (API endpoint)
        └── [songId]/
            └── route.ts → Route: /api/songs/:songId
```

**How it works:**
1. User visits `/vote`
2. Next.js looks for `app/vote/page.tsx`
3. Renders that component
4. Layout wraps it (navigation, providers)

### Client-Side Navigation

```tsx
// components/Navigation.tsx
import Link from 'next/link';

<Link href="/vote">Vote</Link>
```

**What happens:**
- **Client**: Clicking link doesn't reload page
- Next.js fetches `/vote` in background
- Updates URL and renders new page
- Much faster than full page reload!

## Styled-Components: How Styling Works

### Server vs Client for Styling

```tsx
// app/layout.tsx (Server Component)
import { Providers } from '@/components/Providers';

// Providers.tsx (Client Component)
'use client';
import { ThemeProvider } from 'styled-components';

export function Providers({ children }) {
  // ThemeProvider needs to run on CLIENT
  // because styled-components generates CSS at runtime
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
```

**What happens:**
1. **Server**: Generates initial HTML (no styles yet)
2. **Client**: ThemeProvider initializes
3. **Client**: Styled-components injects CSS into `<style>` tag
4. **Client**: Components get styled

### Why Styled-Components Needs Client-Side

```tsx
// components/SongCard/SongCard.styled.ts
export const Card = styled.div`
  background: ${theme.colors.glass.background};
  // This CSS is generated at RUNTIME in the browser
  // Server can't execute template literals with theme
`;
```

**Server limitation:**
- Server generates HTML before JavaScript runs
- Styled-components needs JavaScript to generate CSS
- Therefore: styled-components runs on **client-side only**

## Authentication Flow: Complete Picture

### 1. Initial Load (No User Logged In)

```
┌─────────────────────────────────────────────────────────────┐
│ Browser loads app                                           │
│                                                             │
│ 1. Server: Renders layout.tsx → HTML sent to browser      │
│ 2. Client: React hydrates, Providers initialize           │
│ 3. Client: AuthContext runs useEffect                     │
│ 4. Client: supabase.auth.getSession()                     │
│    - Checks localStorage for token                         │
│    - No token found → user = null                         │
│ 5. Client: Dashboard checks user                          │
│    - user is null → shows AuthModal                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. User Logs In

```
┌─────────────────────────────────────────────────────────────┐
│ User fills login form in AuthModal                         │
│                                                             │
│ 1. Client: User clicks "Sign In"                          │
│ 2. Client: AuthModal calls signIn(email, password)        │
│ 3. Client: AuthContext.signIn() runs                      │
│    - Calls supabase.auth.signInWithPassword()            │
│    - Request goes to Supabase (external)                  │
│ 4. Supabase: Validates credentials                        │
│    - Checks email/password                                │
│    - Creates session token                                │
│    - Stores token in browser localStorage                 │
│ 5. Client: onAuthStateChange event fires                  │
│    - AuthContext updates user state                       │
│    - All components using useAuth() re-render             │
│ 6. Client: Dashboard detects user exists                  │
│    - Hides AuthModal                                      │
│    - Fetches songs data                                   │
│    - Shows dashboard content                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. User Adds a Song

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Add Song" button                              │
│                                                             │
│ 1. Client: Opens AddSongModal                              │
│ 2. Client: User fills form and submits                    │
│ 3. Client: Calls addSong() function (lib/api.ts)          │
│    - Gets auth token from session                         │
│    - Makes POST request to /api/songs                     │
│    - Includes Authorization header                        │
│ 4. Server: API route receives request                     │
│    app/api/songs/route.ts                                 │
│    - Extracts token from Authorization header             │
│    - Validates token with Supabase                        │
│    - Gets user ID from token                              │
│    - Inserts song into database                           │
│    - Returns new song object                              │
│ 5. Client: Receives response                              │
│    - Updates local songs state                            │
│    - New song appears in UI                               │
│ 6. Supabase: Real-time subscription fires                 │
│    - Other users' apps detect new song                    │
│    - Their UIs update automatically                       │
└─────────────────────────────────────────────────────────────┘
```

## Real-Time Updates: Supabase Subscriptions

```tsx
// app/vote/page.tsx
useEffect(() => {
  if (!user) return;

  // Set up real-time subscription
  const subscription = supabase
    .channel('songs_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'songs' },
      () => {
        loadSongs(); // Refetch when songs change
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [user]);
```

**What happens:**
1. **Client**: Sets up WebSocket connection to Supabase
2. **Supabase**: Listens for database changes
3. **Another user**: Adds a song
4. **Supabase**: Sends WebSocket message to all connected clients
5. **Client**: Receives message, refetches songs
6. **Client**: UI updates automatically

## Complete Request Cycle Example

### User Votes on a Song

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Interaction (CLIENT)                          │
│                                                             │
│ User slides rating slider to "8"                           │
│ User types comment: "Great song!"                          │
│ User clicks "Submit Vote"                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: React Event Handler (CLIENT)                       │
│                                                             │
│ SongCard component:                                        │
│ const handleSubmit = () => {                               │
│   onVote(rating, comment);                                 │
│ };                                                          │
│                                                             │
│ Dashboard/VotePage:                                        │
│ const handleVote = async (rating, comment) => {            │
│   await submitVote(songId, rating, comment);              │
│ };                                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: API Call (CLIENT → SERVER)                        │
│                                                             │
│ lib/api.ts:                                                │
│ const response = await fetch('/api/votes', {               │
│   method: 'POST',                                          │
│   headers: {                                               │
│     'Authorization': 'Bearer <token>',                     │
│     'Content-Type': 'application/json'                     │
│   },                                                       │
│   body: JSON.stringify({                                   │
│     songId: '123',                                         │
│     rating: 8,                                             │
│     comment: 'Great song!'                                 │
│   })                                                       │
│ });                                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: API Route Handler (SERVER)                         │
│                                                             │
│ app/api/votes/route.ts:                                    │
│                                                             │
│ export async function POST(request) {                      │
│   // Extract auth token from header                        │
│   const supabase = createServerClientForRoute(request);    │
│   const { data: { user } } = await supabase.auth.getUser();│
│                                                             │
│   // Validate user is authenticated                        │
│   if (!user) return 401 Unauthorized;                     │
│                                                             │
│   // Extract body data                                     │
│   const { songId, rating, comment } = await request.json();│
│                                                             │
│   // Insert into database                                  │
│   await supabase.from('votes').insert({                    │
│     song_id: songId,                                       │
│     user_id: user.id,                                      │
│     rating: rating,                                        │
│     comment: comment                                       │
│   });                                                      │
│                                                             │
│   // Return updated vote stats                             │
│   return NextResponse.json({                               │
│     averageRating: 7.5,                                    │
│     totalVotes: 10                                         │
│   });                                                      │
│ }                                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Database Update (SERVER → SUPABASE)               │
│                                                             │
│ Supabase receives INSERT query                             │
│ - Validates data                                           │
│ - Checks Row Level Security (RLS) policies                │
│ - Inserts vote into votes table                           │
│ - Triggers real-time event                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Response (SERVER → CLIENT)                        │
│                                                             │
│ API route returns JSON:                                    │
│ { averageRating: 7.5, totalVotes: 10 }                    │
│                                                             │
│ Client receives response                                    │
│ - Updates local songs state                                │
│ - Re-renders UI with new vote stats                       │
│ - Shows updated rating                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Real-Time Update (SUPABASE → CLIENTS)             │
│                                                             │
│ Supabase sends WebSocket message to all connected clients  │
│                                                             │
│ Other users' apps:                                         │
│ - Receive subscription event                               │
│ - Automatically refetch songs                              │
│ - See updated vote count                                   │
│                                                             │
│ This happens automatically for ALL connected users!        │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ app/layout.tsx (Server Component)                          │
│                                                             │
│ └── <Providers> (Client Component)                         │
│     ├── <ThemeProvider> (styled-components)                │
│     └── <AuthProvider> (React Context)                     │
│         ├── Manages: user, session state                   │
│         ├── Provides: signIn, signOut functions            │
│         └── Listens: Supabase auth events                  │
│             │                                               │
│             ├── <Navigation> (Client Component)            │
│             │   ├── Uses: useAuth() hook                   │
│             │   ├── Reads: user object from context        │
│             │   └── Renders: User name, sign out button   │
│             │                                               │
│             └── {children} (Page Component)                │
│                 │                                           │
│                 ├── app/page.tsx (Dashboard)               │
│                 │   ├── Uses: useAuth() hook               │
│                 │   ├── State: songs, votesMap             │
│                 │   ├── Effects:                           │
│                 │   │   ├── Loads songs on mount          │
│                 │   │   └── Sets up real-time subscriptions│
│                 │   ├── Functions:                         │
│                 │   │   ├── loadSongs() → fetch('/api/songs')│
│                 │   │   └── handleVote() → fetch('/api/votes')│
│                 │   └── Renders: Song tiles, voting UI    │
│                 │                                           │
│                 └── app/vote/page.tsx                      │
│                     └── Similar pattern                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts Summary

### Server-Side (Next.js Server)
- **What**: Initial HTML generation, API routes, database access
- **When**: On page load, API requests
- **Files**: `app/layout.tsx`, `app/api/**/route.ts`, `lib/supabase-server.ts`
- **Can do**: File system, Node.js APIs, direct database access
- **Cannot do**: useState, useEffect, browser APIs, event handlers

### Client-Side (Browser)
- **What**: React components, interactivity, state management
- **When**: After page loads, user interactions
- **Files**: Most `app/**/page.tsx`, `components/**/*.tsx`, `contexts/**/*.tsx`
- **Can do**: useState, useEffect, browser APIs, event handlers
- **Cannot do**: File system, Node.js APIs, direct database access

### API Routes (Server)
- **What**: Backend endpoints that handle requests
- **When**: Client makes fetch() calls
- **Purpose**: Validate auth, query database, return data
- **Security**: Runs on server, credentials never exposed to client

### Styled-Components (Client)
- **What**: CSS-in-JS styling
- **When**: After React hydration
- **Why client-side**: CSS generated at runtime from JavaScript
- **Theme**: Injected via ThemeProvider (React Context)

### Authentication (Hybrid)
- **Client**: AuthContext manages user state, handles login/logout UI
- **Server**: API routes validate tokens, enforce permissions
- **Supabase**: Stores credentials, validates tokens, manages sessions

### Routing (Next.js)
- **File-based**: File structure determines routes
- **Server**: Initial page load generates HTML
- **Client**: Navigation uses client-side routing (faster, no reload)

## How Everything Connects

```
User opens browser
    │
    ├─► Next.js Server renders layout.tsx (HTML)
    │       │
    │       └─► Browser downloads JavaScript
    │               │
    │               ├─► React hydrates components
    │               │       │
    │               │       ├─► Providers initialize
    │               │       │       ├─► ThemeProvider (styled-components)
    │               │       │       └─► AuthProvider (AuthContext)
    │               │       │               │
    │               │       │               └─► Checks Supabase session
    │               │       │                       │
    │               │       │                       └─► Sets user state
    │               │       │
    │               │       └─► Pages render
    │               │               │
    │               │               ├─► Dashboard checks auth
    │               │               │       │
    │               │               │       ├─► No user? Show login
    │               │               │       │
    │               │               │       └─► User? Fetch songs
    │               │               │               │
    │               │               │               └─► GET /api/songs
    │               │               │                       │
    │               │               │                       └─► API route queries Supabase
    │               │               │                               │
    │               │               │                               └─► Returns songs data
    │               │               │                                       │
    │               │               │                                       └─► Dashboard renders songs
    │               │               │
    │               │               └─► User interacts (clicks, types)
    │               │                       │
    │               │                       └─► Event handlers trigger
    │               │                               │
    │               │                               ├─► Submit vote
    │               │                               │       │
    │               │                               │       └─► POST /api/votes
    │               │                               │               │
    │               │                               │               └─► API route validates & saves
    │               │                               │                       │
    │               │                               │                       └─► Supabase updates database
    │               │                               │                               │
    │               │                               │                               └─► Real-time event fires
    │               │                               │                                       │
    │               │                               │                                       └─► All clients update
    │               │                               │
    │               │                               └─► Add song (similar flow)
    │               │
    │               └─► Styled-components inject CSS
    │                       │
    │                       └─► UI becomes fully styled
    │
    └─► User sees fully interactive app!
```

## Summary

### The Three Layers

1. **Presentation Layer (Client)**
   - React components, UI, interactivity
   - State management (useState, Context)
   - Styled-components (CSS)
   - Event handlers

2. **Application Layer (Server API Routes)**
   - Business logic
   - Authentication validation
   - Data transformation
   - Error handling

3. **Data Layer (Supabase)**
   - Database (PostgreSQL)
   - Authentication service
   - Real-time subscriptions
   - Row Level Security

### The Flow

```
User Action
    ↓
Client Component (React)
    ↓
API Call (fetch)
    ↓
API Route (Next.js Server)
    ↓
Database (Supabase)
    ↓
Response (JSON)
    ↓
Client Component Updates
    ↓
UI Re-renders
```

Your app is a **modern full-stack React application** that leverages:
- **Next.js** for server-side rendering and API routes
- **React** for client-side interactivity
- **Supabase** for database and authentication
- **Styled-components** for styling
- **React Context** for global state (auth)

All working together to create a seamless user experience! 🚀


