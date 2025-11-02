const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// All dashboard routes require authentication
router.use(requireAuth);

// Main dashboard
router.get('/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user's families with member details
    const { data: familyMembers, error: familyError } = await supabase
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
      .eq('user_id', userId);

    if (familyError) throw familyError;

    // Get all family members for each family (to show who's in the family)
    let allMembers = [];
    let children = [];
    let stats = {
      totalFamilies: familyMembers?.length || 0,
      totalChildren: 0,
      totalMembers: 0,
      pendingInvitations: 0
    };

    if (familyMembers && familyMembers.length > 0) {
      const familyIds = familyMembers.map(fm => fm.families.id);
      
      // Get all members in user's families
      const { data: membersData } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles (
            email,
            full_name,
            avatar_url
          )
        `)
        .in('family_id', familyIds);
      
      allMembers = membersData || [];
      stats.totalMembers = allMembers.length;
      
      // Add member count to each family
      familyMembers.forEach(fm => {
        fm.memberCount = allMembers.filter(m => m.family_id === fm.families.id).length;
        fm.familyMembers = allMembers.filter(m => m.family_id === fm.families.id);
      });
      
      // Get children from user's families
      const { data: familyChildren } = await supabase
        .from('children')
        .select('*')
        .in('family_id', familyIds)
        .order('birth_date', { ascending: false });
      
      children = familyChildren || [];
      stats.totalChildren = children.length;
      
      // Get pending invitations
      const { data: invitations } = await supabase
        .from('invitations')
        .select('*')
        .in('family_id', familyIds)
        .eq('status', 'pending');
      
      stats.pendingInvitations = invitations?.length || 0;
    }

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Check if user is a grandparent (role in any family)
    const isGrandparent = familyMembers?.some(fm => fm.role === 'grandparent');
    
    // Calculate children ages
    const childrenWithAges = children.map(child => ({
      ...child,
      age: calculateAge(child.birth_date)
    }));
    
    // Render appropriate dashboard
    const dashboardView = isGrandparent ? 'dashboard/grandparent' : 'dashboard/index';
    
    res.render(dashboardView, {
      title: 'Tableau de bord - MeLorAly',
      currentPage: 'dashboard',
      families: familyMembers || [],
      allMembers: allMembers,
      children: childrenWithAges || [],
      notifications: notifications || [],
      stats: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Erreur lors du chargement du tableau de bord.');
    res.render('dashboard/index', {
      title: 'Tableau de bord - MeLorAly',
      currentPage: 'dashboard',
      families: [],
      allMembers: [],
      children: [],
      notifications: [],
      stats: { totalFamilies: 0, totalChildren: 0, totalMembers: 0, pendingInvitations: 0 }
    });
  }
});

// Helper function to calculate age from birth date
function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Grandparent dashboard (direct route)
router.get('/grandparent', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user's families
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('user_id', userId);

    // Get children from user's families with ages
    let children = [];
    if (familyMembers && familyMembers.length > 0) {
      const familyIds = familyMembers.map(fm => fm.families.id);
      const { data: familyChildren } = await supabase
        .from('children')
        .select('*')
        .in('family_id', familyIds)
        .order('birth_date', { ascending: false });
      
      children = (familyChildren || []).map(child => ({
        ...child,
        age: calculateAge(child.birth_date)
      }));
    }

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.render('dashboard/grandparent', {
      title: 'Tableau de bord Grands-Parents - MeLorAly',
      currentPage: 'dashboard',
      families: familyMembers || [],
      children: children || [],
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Grandparent dashboard error:', error);
    req.flash('error', 'Erreur lors du chargement du tableau de bord.');
    res.render('dashboard/grandparent', {
      title: 'Tableau de bord Grands-Parents - MeLorAly',
      currentPage: 'dashboard',
      families: [],
      children: [],
      notifications: []
    });
  }
});

module.exports = router;