# Quick Setup - Fix Email Confirmation

## 🔴 URGENT: Fix Email Redirect Issue

### The Problem
Email confirmation links redirect to `localhost:3000` instead of your dev server.

### The Solution (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `efqksigmnktnbwhzwjes`

2. **Go to Authentication Settings**
   - Click: **Authentication** → **URL Configuration**

3. **Update Site URL**
   ```
   Current: http://localhost:3000
   Change to: http://192.168.2.79:3012
   ```

4. **Add Redirect URLs**
   Click "+ Add URL" and add:
   ```
   http://192.168.2.79:3012/auth/callback
   ```

5. **Save Changes**
   Click the **Save** button

6. **Test**
   - Register a new account with a different email
   - Check the confirmation email
   - The link should now point to `192.168.2.79:3012`
   - Clicking it should verify and redirect to dashboard

## 🚀 For Production

When deploying to production, repeat steps above but use:

**Site URL:**
```
https://nema.meloraly.specialblend.ca
```

**Redirect URL:**
```
https://nema.meloraly.specialblend.ca/auth/callback
```

And update your `.env` file with:
```
SITE_URL=https://nema.meloraly.specialblend.ca
NODE_ENV=production
```

## ✅ Styling Fixed

The app now has:
- Better color balance (less overwhelming blue)
- Modern purple/indigo primary color
- Green accents for success states
- Pink accents for branding
- White cards with subtle shadows
- Professional gradient hero sections
