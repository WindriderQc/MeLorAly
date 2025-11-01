const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Family management page
router.get('/', async (req, res) => {
  try {
    // Get user's families with member details
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          avatar_url,
          created_at,
          created_by
        )
      `)
      .eq('user_id', req.session.user.id);

    res.render('family/index', {
      families: familyMembers || []
    });
  } catch (error) {
    console.error('Family page error:', error);
    req.flash('error', 'Erreur lors du chargement des familles.');
    res.render('family/index', { families: [] });
  }
});

// Create family page
router.get('/create', (req, res) => {
  res.render('family/create');
});

// Handle family creation
router.post('/create', async (req, res) => {
  const { family_name } = req.body;
  
  try {
    // Create the family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert([{
        name: family_name,
        created_by: req.session.user.id
      }])
      .select()
      .single();

    if (familyError) throw familyError;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert([{
        family_id: family.id,
        user_id: req.session.user.id,
        role: 'admin'
      }]);

    if (memberError) throw memberError;

    req.flash('success', `Famille "${family_name}" créée avec succès!`);
    res.redirect('/family');
  } catch (error) {
    console.error('Family creation error:', error);
    req.flash('error', 'Erreur lors de la création de la famille.');
    res.redirect('/family/create');
  }
});

module.exports = router;