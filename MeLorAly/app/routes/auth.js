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

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      req.flash('error', 'Email ou mot de passe incorrect.');
      return res.redirect('/auth/login');
    }

    // Store user in session
    req.session.user = data.user;
    req.flash('success', 'Connexion réussie!');
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
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
    req.session.destroy();
    req.flash('success', 'Déconnexion réussie.');
    res.redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/dashboard');
  }
});

module.exports = router;