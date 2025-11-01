# Supabase Configuration Guide for MeLorAly

## Email Authentication Setup

### Step 1: Configure Site URL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `efqksigmnktnbwhzwjes`
3. Go to **Authentication** → **URL Configuration**
4. Update the following URLs:

   **Site URL:**
   ```
   http://localhost:3012
   ```

   **Redirect URLs:** (Add these to the list)
   ```
   http://localhost:3012
   http://localhost:3012/auth/callback
   http://localhost:3012/dashboard
   ```

5. Click **Save**

### Step 2: Email Template Configuration (Optional)

If you want to customize the email template:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Make sure the confirmation URL uses `{{ .SiteURL }}`
4. Default should be: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`

### Step 3: For Production Deployment

When deploying to production, update these URLs to your production domain:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs:**
```
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/dashboard
```

## Current Issue

The email is redirecting to `localhost:3000` instead of `localhost:3012` because:
- The default Site URL in Supabase is set to port 3000
- You need to update it to port 3012

## After Configuration

1. Test by registering a new account
2. Check your email for the confirmation link
3. The link should now point to `localhost:3012`
4. Clicking it will verify your account and redirect to the dashboard