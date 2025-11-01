const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// All family routes require authentication
router.use(requireAuth);

// Family management page
router.get('/', async (req, res) => {
  try {
    // Get user's families with member details
    const { data: familyMembers } = await req.supabase
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

// Manage family page (must be before /:id to avoid route conflict)
router.get('/:id/manage', async (req, res) => {
  try {
    const familyId = req.params.id;

    // Get family details
    const { data: family, error: familyError } = await req.supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (familyError) throw familyError;

    // Check if user is admin
    const { data: membership } = await req.supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', req.session.user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      req.flash('error', 'Vous devez être administrateur pour gérer cette famille.');
      return res.redirect(`/family/${familyId}`);
    }

    // Get family members
    const { data: members } = await req.supabase
      .from('family_members')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('family_id', familyId);

    // Get children
    const { data: children } = await req.supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId);

    // Get pending invitations
    const { data: invitations } = await req.supabase
      .from('invitations')
      .select('*')
      .eq('family_id', familyId)
      .eq('status', 'pending');

    res.render('family/manage', {
      family,
      members: members || [],
      children: children || [],
      invitations: invitations || []
    });
  } catch (error) {
    console.error('Family manage error:', error);
    req.flash('error', 'Erreur lors du chargement de la page de gestion.');
    res.redirect('/family');
  }
});

// View single family
router.get('/:id', async (req, res) => {
  try {
    const familyId = req.params.id;

    // Get family details
    const { data: family, error: familyError } = await req.supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (familyError) throw familyError;

    // Get family members
    const { data: members, error: membersError } = await req.supabase
      .from('family_members')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('family_id', familyId);

    if (membersError) throw membersError;

    // Get children
    const { data: children, error: childrenError } = await req.supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId);

    if (childrenError) throw childrenError;

    res.render('family/view', {
      family,
      members: members || [],
      children: children || []
    });
  } catch (error) {
    console.error('Family view error:', error);
    req.flash('error', 'Famille introuvable.');
    res.redirect('/family');
  }
});

// Handle family creation
router.post('/create', async (req, res) => {
  const { family_name } = req.body;
  
  try {
    // Create the family
    const { data: family, error: familyError } = await req.supabase
      .from('families')
      .insert([{
        name: family_name,
        created_by: req.session.user.id
      }])
      .select()
      .single();

    if (familyError) {
      console.error('Family creation error:', familyError);
      throw familyError;
    }

    // Add creator as admin member
    const { error: memberError } = await req.supabase
      .from('family_members')
      .insert([{
        family_id: family.id,
        user_id: req.session.user.id,
        role: 'admin'
      }]);

    if (memberError) {
      console.error('Member creation error:', memberError);
      throw memberError;
    }

    req.flash('success', `Famille "${family_name}" créée avec succès!`);
    res.redirect('/family');
  } catch (error) {
    console.error('Family creation error:', error);
    req.flash('error', `Erreur lors de la création de la famille: ${error.message}`);
    res.redirect('/family/create');
  }
});

module.exports = router;