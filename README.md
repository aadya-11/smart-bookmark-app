## Overview

Smart Bookmark is a simple, private, real-time bookmark manager built using **Next.js (App Router)** and **Supabase**.  
Users can securely log in with Google, store personal bookmarks, and see updates instantly across multiple tabs.

This project focuses on building a clean, production-style full-stack application with authentication, secure data access, and real-time synchronization.

---
## Features

- Google OAuth login (Supabase Auth)
- Add bookmark (Title + URL)
- Private bookmarks per user (Row Level Security)
- Delete bookmarks
- Real-time sync across multiple tabs
- Clean, minimal, responsive UI
- Custom favicon & polished UX
### Extra Improvements (Beyond Requirements)

- URL validation with auto-normalization (`google.com` → `https://google.com`)
- Keyboard-first UX (Press **Enter** to add bookmark)

- Improved input validation to prevent malformed data

---
## Tech Stack

**Frontend**
- Next.js (App Router)
- React

**Backend**
- Supabase (Auth, Database, Realtime)

**Database**
- PostgreSQL (via Supabase)

**Styling**
- CSS Modules

**Deployment**
- Vercel

---## Database Design

**Table:** `bookmarks`

| Column      | Type      | Description |
|------------|----------|-------------|
| id         | uuid     | Primary key |
| created_at | timestamp| Auto-created |
| title      | text     | Bookmark title |
| url        | text     | Bookmark URL |
| user_id    | uuid     | Owner |

---

## Security (Row Level Security)

RLS ensures users can only access their own bookmarks:
## Problems Faced & What I Learned

### First Time Using Supabase
This was my first experience using Supabase. Understanding the dashboard, authentication flow, and Row Level Security took some time.

**Learned:** Auth flow, RLS behavior, and realtime subscriptions.

---

### First Deployment Experience
This was my first time deploying a full-stack application using GitHub and Vercel.

**Learned:** How production differs from local, and how environment variables must be configured in deployment.

---

### OAuth Redirect Issue
After deployment, login redirected incorrectly due to mismatched redirect URL configuration.

**Solution:** Updated Supabase Auth URL configuration to match production domain.

---

### Missing Environment Variables
App worked locally but failed during Vercel build.

**Solution:** Added required environment variables in Vercel dashboard.

---

### Multiple Deployment Confusion
Multiple deployments caused confusion about which project was active.

**Learned:** Importance of environment and deployment clarity.

---

### Input Validation Improvement
Users could insert invalid URLs initially.

**Solution:** Implemented URL normalization and validation to prevent malformed data.

---