# Missing Database Tables - Fix Instructions

## Issue Summary
The application was failing to load certain pages due to missing database tables in Supabase:
1. **`activity_completions`** - Used by education routes
2. **`contact_requests`** - Used by support and profile routes

Error message: `Could not find the table 'public.activity_completions' in the schema cache`

## Tables Required

### All database tables used by the application:
✅ profiles
✅ families
✅ family_members
✅ children
✅ messages
✅ notifications
✅ invitations
❌ **activity_completions** (MISSING)
❌ **contact_requests** (MISSING)

### Storage Buckets Required:
📦 `child-photos` - For storing children's profile photos (not a database table)

## Fix Instructions

### Option 1: Run the Quick Fix (Recommended)
Run the `missing-tables.sql` file in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/MeLorAly/app/database/missing-tables.sql`
4. Click **Run**

This will create all missing tables with proper RLS policies and indexes.

### Option 2: Re-run Complete Schema
If you want to recreate the entire database from scratch:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/MeLorAly/app/database/schema.sql`
4. Click **Run**

**WARNING**: This will drop and recreate all tables. Only use this for a fresh start!

## What Was Fixed

### Files Modified:
1. **`database/schema.sql`** - Updated to include all missing tables
   - Added `contact_requests` table definition
   - Added RLS policies for new tables
   - Added indexes for performance
   - Added triggers for updated_at

2. **`database/missing-tables.sql`** - NEW FILE
   - Quick fix SQL that can be run independently
   - Uses `IF NOT EXISTS` to avoid conflicts
   - Safe to run multiple times

3. **`server.js`** - Fixed CSRF protection issue
   - Removed CSRF from education route middleware
   
4. **`routes/education.js`** - Added selective CSRF protection
   - CSRF protection now only on routes that need it

### Tables Created:

#### activity_completions
```sql
- id (uuid, primary key)
- activity_id (text)
- child_id (uuid, foreign key)
- family_id (uuid, foreign key)
- user_id (uuid, foreign key)
- completed_at (timestamp)
```

#### contact_requests
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, nullable)
- name (text)
- email (text)
- subject (text)
- message (text)
- status (enum: pending, responded, closed)
- created_at (timestamp)
- updated_at (timestamp)
```

### Storage Bucket Setup

You'll also need to create the `child-photos` storage bucket in Supabase:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `child-photos`
4. Make it **Public** (so photos can be displayed)
5. Set appropriate policies for family members to upload

## Verification

After running the SQL, verify the tables exist:

1. **Database Tables** - In Supabase, go to **Table Editor**
   You should see all these tables:
   - profiles
   - families
   - family_members
   - children
   - activity_completions ✓
   - contact_requests ✓
   - messages
   - notifications
   - invitations

2. **Storage Buckets** - In Supabase, go to **Storage**
   You should see:
   - child-photos ✓

3. **Test the application**:
   - Navigate to `/education` - should work without errors ✓
   - Submit a contact form - should work ✓
   - Upload child photos - should work (requires storage bucket) ✓

## Where These Tables Are Used

### activity_completions
- `routes/education.js` - Lines 50, 151, 225, 257, 311
- Tracks which educational activities children have completed

### contact_requests
- `routes/support.js` - Line 42
- `routes/profile.js` - Line 253
- Stores contact form submissions

### child-photos (Storage Bucket)
- `routes/children.js` - Lines 456, 468
- Stores photos uploaded for children's profiles (avatar images)

## Prevention

The schema.sql file has been updated to include all tables. For future deployments:
1. Always run the complete `schema.sql` when setting up a new environment
2. Check Supabase Table Editor to verify all tables exist
3. Test all routes after database setup

## Status
✅ Schema file updated
✅ Missing tables SQL created  
✅ CSRF protection fixed
⏳ **ACTION REQUIRED**: 
   1. Run `missing-tables.sql` in Supabase SQL Editor
   2. Create `child-photos` storage bucket in Supabase

---
**Last Updated**: November 4, 2025
