require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const { createClient } = require('@supabase/supabase-js');
const csrf = require('csurf');
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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(flash());

// CSRF Protection
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// Global middleware to add user and messages to all views
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  res.locals.currentPath = req.path;
  res.locals.csrfToken = req.csrfToken();
  
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

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const familyRoutes = require('./routes/family');
const onboardingRoutes = require('./routes/onboarding');
const messagesRoutes = require('./routes/messages');
const educationRoutes = require('./routes/education');
const profileRoutes = require('./routes/profile');
const supportRoutes = require('./routes/support');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/family', familyRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/messages', requireAuth, messagesRoutes);
app.use('/education', educationRoutes);
app.use('/profile', profileRoutes);
app.use('/', supportRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 MeLorAly server running on http://localhost:${PORT}`);
});