const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Main dashboard
router.get('/', async (req, res) => {
  try {
    // Get user's families
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          avatar_url,
          created_at
        )
      `)
      .eq('user_id', req.session.user.id);

    // Get children from user's families
    let children = [];
    if (familyMembers && familyMembers.length > 0) {
      const familyIds = familyMembers.map(fm => fm.family_id);
      const { data: familyChildren } = await supabase
        .from('children')
        .select('*')
        .in('family_id', familyIds);
      
      children = familyChildren || [];
    }

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Check if user is a grandparent (role in any family)
    const isGrandparent = familyMembers?.some(fm => fm.role === 'grandparent');
    
    // Render appropriate dashboard
    const dashboardView = isGrandparent ? 'dashboard/grandparent' : 'dashboard/index';
    
    res.render(dashboardView, {
      families: familyMembers || [],
      children: children || [],
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Erreur lors du chargement du tableau de bord.');
    res.render('dashboard/index', {
      families: [],
      children: [],
      notifications: []
    });
  }
});

// Grandparent dashboard (direct route)
router.get('/grandparent', async (req, res) => {
  try {
    // Get user's families
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          avatar_url,
          created_at
        )
      `)
      .eq('user_id', req.session.user.id);

    // Get children from user's families
    let children = [];
    if (familyMembers && familyMembers.length > 0) {
      const familyIds = familyMembers.map(fm => fm.family_id);
      const { data: familyChildren } = await supabase
        .from('children')
        .select('*')
        .in('family_id', familyIds);
      
      children = familyChildren || [];
    }

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    res.render('dashboard/grandparent', {
      families: familyMembers || [],
      children: children || [],
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Grandparent dashboard error:', error);
    req.flash('error', 'Erreur lors du chargement du tableau de bord.');
    res.render('dashboard/grandparent', {
      families: [],
      children: [],
      notifications: []
    });
  }
});

module.exports = router;