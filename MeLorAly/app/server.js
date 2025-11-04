require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const { createClient } = require('@supabase/supabase-js');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3012;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Express configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'GET'
});

const sensitivePostLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'GET'
});

app.use(generalLimiter);
app.use('/auth', authLimiter);
app.use(['/onboarding', '/family', '/children', '/profile'], sensitivePostLimiter);

// Trust proxy for production (behind reverse proxy/load balancer)
// This MUST be set before session middleware
app.set('trust proxy', 1);

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'meloraly.sid', // Custom session cookie name
  proxy: true, // Trust the reverse proxy
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'lax', // CSRF protection, works with redirects
    secure: 'auto', // Auto-detect based on X-Forwarded-Proto header
    path: '/', // Ensure cookie is sent on all paths
  }
};

console.log(`[SESSION] Initializing session middleware (NODE_ENV: ${process.env.NODE_ENV})`);
console.log(`[SESSION] Cookie config:`, {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  httpOnly: sessionConfig.cookie.httpOnly,
  name: sessionConfig.name
});

app.use(session(sessionConfig));

app.use(flash());

// Global middleware to add user and messages to all views
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  res.locals.currentPath = req.path;
  res.locals.csrfToken = ''; // Default empty, will be set by CSRF middleware where needed
  
  // If user is logged in, get their profile
  if (req.session.user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.session.user.id)
        .single();
      
      res.locals.profile = profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.locals.profile = null;
    }
  }
  
  next();
});

// Import authentication middleware
const { requireAuth } = require('./middleware/auth');

// CSRF Protection middleware (for protected routes only)
const csrfProtection = csrf({ cookie: false });

// Middleware to set CSRF token in locals
const setCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const familyRoutes = require('./routes/family');
const childrenRoutes = require('./routes/children');
const onboardingRoutes = require('./routes/onboarding');
const messagesRoutes = require('./routes/messages');
const educationRoutes = require('./routes/education');
const profileRoutes = require('./routes/profile');
const supportRoutes = require('./routes/support');
const notificationsRoutes = require('./routes/notifications');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/family', familyRoutes);
app.use('/children', childrenRoutes);
app.use('/onboarding', csrfProtection, setCsrfToken, onboardingRoutes);
app.use('/messages', requireAuth, messagesRoutes);
app.use('/education', educationRoutes);
app.use('/profile', profileRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/', supportRoutes);

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Public routes
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('index');
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).render('errors/404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500');
});

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MeLorAly server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
