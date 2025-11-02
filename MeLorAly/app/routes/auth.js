const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Signup alias (same as register)
router.get('/signup', (req, res) => {
  res.render('auth/register');
});

// Auth callback handler (for email confirmation)
router.get('/callback', async (req, res) => {
  const { token_hash, type } = req.query;

  if (token_hash && type) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type
      });

      if (error) {
        console.error('Verification error:', error);
        req.flash('error', 'Erreur lors de la vérification de votre email.');
        return res.redirect('/auth/login');
      }

      if (data.user) {
        req.session.user = data.user;
        req.flash('success', 'Email vérifié avec succès! Bienvenue sur MeLorAly.');
        // Save session before redirecting
        return req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            req.flash('error', 'Erreur de session. Veuillez réessayer.');
            return res.redirect('/auth/login');
          }
          res.redirect('/dashboard');
        });
      }
    } catch (error) {
      console.error('Callback error:', error);
      req.flash('error', 'Une erreur est survenue.');
      return res.redirect('/auth/login');
    }
  }

  req.flash('error', 'Lien de vérification invalide.');
  res.redirect('/auth/login');
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('[LOGIN] Attempt for:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('[LOGIN] Supabase auth error:', error.message);
      req.flash('error', 'Email ou mot de passe incorrect.');
      return res.redirect('/auth/login');
    }

    console.log('[LOGIN] Auth successful for user:', data.user.id);
    
    // Store user in session
    req.session.user = data.user;
    req.flash('success', 'Connexion réussie!');
    
    console.log('[LOGIN] Saving session...');
    
    // Save session before redirecting to avoid loop
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        req.flash('error', 'Erreur de session. Veuillez réessayer.');
        return res.redirect('/auth/login');
      }
      console.log('[LOGIN] Session saved successfully, redirecting to dashboard');
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('[LOGIN] Catch error:', error);
    req.flash('error', 'Une erreur est survenue lors de la connexion.');
    res.redirect('/auth/login');
  }
});

// Handle registration
router.post('/register', async (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;
  
  // Basic validation
  if (password !== confirm_password) {
    req.flash('error', 'Les mots de passe ne correspondent pas.');
    return res.redirect('/auth/register');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    });

    if (error) {
      req.flash('error', error.message);
      return res.redirect('/auth/register');
    }

    req.flash('success', 'Compte créé avec succès! Vérifiez votre email pour confirmer votre compte.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Une erreur est survenue lors de l\'inscription.');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/dashboard');
  }
});

module.exports = router;