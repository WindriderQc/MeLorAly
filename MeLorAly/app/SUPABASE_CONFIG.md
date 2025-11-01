# Supabase Configuration Guide for MeLorAly

## Email Authentication Setup

### Step 1: Configure Site URL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `efqksigmnktnbwhzwjes`
3. Go to **Authentication** → **URL Configuration**

### Development Environment

**Site URL:**
```
http://192.168.2.79:3012
```

**Redirect URLs:** (Add these to the list)
```
http://192.168.2.79:3012
http://192.168.2.79:3012/auth/callback
http://192.168.2.79:3012/dashboard
```

### Production Environment

**Site URL:**
```
https://nema.meloraly.specialblend.ca
```

**Redirect URLs:** (Add these to the list)
```
https://nema.meloraly.specialblend.ca
https://nema.meloraly.specialblend.ca/auth/callback
https://nema.meloraly.specialblend.ca/dashboard
```

### Step 2: Configure Both Environments

**Option A: Add Both URLs (Recommended for Development)**

Add BOTH development and production URLs to the Redirect URLs list:
- http://192.168.2.79:3012/auth/callback
- https://nema.meloraly.specialblend.ca/auth/callback

Set Site URL to whichever environment you're currently using.

**Option B: Use Separate Supabase Projects**

- Create a separate Supabase project for production
- Use different credentials for dev vs production

### Step 3: Email Template Configuration

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Verify the confirmation URL uses: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`

### Step 4: Update Your .env File

**For Development (.env):**
```
SITE_URL=http://192.168.2.79:3012
NODE_ENV=development
```

**For Production (.env.production):**
```
SITE_URL=https://nema.meloraly.specialblend.ca
NODE_ENV=production
```

## Current Issue Solution

The email is redirecting to `localhost:3000` because the default Site URL in Supabase is set to that port.

**Quick Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Change Site URL to: `http://192.168.2.79:3012`
3. Add to Redirect URLs: `http://192.168.2.79:3012/auth/callback`
4. Click **Save**
5. Test by registering a new account
6. The confirmation email should now have the correct URL

## Notes

- The auth callback route at `/auth/callback` has been added to handle email confirmations
- Make sure to restart your server after updating .env file
- For production deployment, update both Supabase settings AND your .env file
- Keep .env.production.example as a template for production configuration