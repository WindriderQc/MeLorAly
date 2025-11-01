// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Vous devez être connecté pour accéder à cette page.');
    return res.redirect('/auth/login');
  }
  
  // Attach supabase to request for use in routes (using service key to bypass RLS)
  const { createClient } = require('@supabase/supabase-js');
  req.supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
  );
  
  next();
};

module.exports = { requireAuth };
