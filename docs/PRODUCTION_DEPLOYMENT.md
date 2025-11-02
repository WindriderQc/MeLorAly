# Production Deployment Guide

## 🚨 Critical Issues Fixed

### Session Configuration
The login loop on production was caused by missing session cookie configuration for HTTPS and reverse proxies.

**Changes Made:**
- ✅ Added `trust proxy` for production (required when behind reverse proxy/load balancer)
- ✅ Added `httpOnly: true` to prevent XSS attacks
- ✅ Added `sameSite: 'lax'` for CSRF protection
- ✅ Added `secure: true` in production (requires HTTPS)
- ✅ Made session config environment-aware

## 📋 Production Deployment Checklist

### 1. Server Environment Variables

On your production server at `nema.meloraly.specialblend.ca`, create a `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxx.supabase.co
SUPABASE_KEY=xxxxxxx
SUPABASE_SERVICE_KEY=xxxxx

# Session Secret - GENERATE A NEW ONE!
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=<YOUR-NEW-PRODUCTION-SECRET>

# Port
PORT=3012

# Environment - CRITICAL!
NODE_ENV=production

# Site URL - MUST be HTTPS
SITE_URL=https://nema.meloraly.specialblend.ca
```

**🔐 CRITICAL:** Generate a new `SESSION_SECRET` for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Supabase Configuration

#### A. Add Redirect URLs

In your Supabase Dashboard → Authentication → URL Configuration:

Add these URLs to **Redirect URLs**:
- `https://nema.meloraly.specialblend.ca/auth/callback`
- `https://nema.meloraly.specialblend.ca/*` (wildcard for all routes)

#### B. Update Site URL

Set **Site URL** to: `https://nema.meloraly.specialblend.ca`

### 3. Reverse Proxy Configuration

If using Nginx (recommended), ensure your config includes:

```nginx
server {
    listen 80;
    server_name nema.meloraly.specialblend.ca;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nema.meloraly.specialblend.ca;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3012;
        proxy_http_version 1.1;
        
        # Critical headers for sessions
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Don't cache
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Process Manager (PM2 Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
cd /path/to/MeLorAly/app
pm2 start server.js --name meloraly

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

Create `ecosystem.config.js` for PM2:

```javascript
module.exports = {
  apps: [{
    name: 'meloraly',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3012
    }
  }]
};
```

Then use: `pm2 start ecosystem.config.js`

### 5. Deployment Steps

```bash
# 1. Pull latest code
cd /path/to/MeLorAly
git pull origin main

# 2. Install dependencies
cd MeLorAly/app
npm ci --production

# 3. Verify .env file exists with production values
cat .env  # Check NODE_ENV=production

# 4. Restart the application
pm2 restart meloraly

# 5. Check logs
pm2 logs meloraly
```

### 6. Verify Production Settings

After deployment, verify:

```bash
# Check environment
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV);"

# Check if running
pm2 status

# Check application logs
pm2 logs meloraly --lines 50
```

### 7. Test the Application

1. Visit `https://nema.meloraly.specialblend.ca`
2. Try to register/login
3. Check that sessions persist after login
4. Verify dashboard loads correctly

## 🐛 Troubleshooting

### Still Getting Login Loop?

1. **Check NODE_ENV:**
   ```bash
   pm2 show meloraly | grep NODE_ENV
   ```
   Must be `production`

2. **Check Reverse Proxy Headers:**
   Verify `X-Forwarded-Proto` header is set to `https`

3. **Check Browser Console:**
   Look for cookie errors or CORS issues

4. **Check PM2 Logs:**
   ```bash
   pm2 logs meloraly --lines 100
   ```

5. **Verify Supabase URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Ensure `https://nema.meloraly.specialblend.ca/auth/callback` is listed

6. **Clear Browser Cache/Cookies:**
   Old development cookies might interfere

### Session Not Persisting?

1. **Check cookie settings in browser DevTools:**
   - Should see `Secure: true`
   - Should see `SameSite: Strict`
   - Should see `HttpOnly: true`

2. **Verify HTTPS is working:**
   ```bash
   curl -I https://nema.meloraly.specialblend.ca
   ```
   Should return `200 OK`

## 🔒 Security Checklist

- [ ] `NODE_ENV=production` set in `.env`
- [ ] Different `SESSION_SECRET` in production
- [ ] HTTPS enabled (not HTTP)
- [ ] Supabase redirect URLs configured
- [ ] Reverse proxy headers configured
- [ ] `.env` file not in git (check `.gitignore`)
- [ ] PM2 running as service
- [ ] Firewall configured (only ports 80, 443, 22)

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Memory and CPU usage
pm2 status

# Application logs
pm2 logs meloraly --lines 200

# Error logs only
pm2 logs meloraly --err
```

### Log Files

Logs are stored in:
- PM2: `~/.pm2/logs/meloraly-out.log` (stdout)
- PM2: `~/.pm2/logs/meloraly-error.log` (stderr)

## 🚀 Quick Fix Commands

```bash
# Restart app
pm2 restart meloraly

# Reload app (zero-downtime)
pm2 reload meloraly

# Stop app
pm2 stop meloraly

# View logs
pm2 logs meloraly

# Clear logs
pm2 flush meloraly
```

## 📝 Next Steps After This Fix

1. **Deploy the updated code** with session fixes
2. **Set `NODE_ENV=production`** on your production server
3. **Restart the application** with PM2
4. **Test login/logout flow** on production
5. **Monitor logs** for any errors

The session configuration fix should resolve the login loop issue on production!
