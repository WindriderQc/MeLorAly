const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  categories,
  activities,
  getActivitiesByCategory,
  getActivityById,
  getAgeFilters
} = require('../data/education-activities');
const {
  WEEK_DAYS,
  buildChildProfiles,
  compileGlobalRecommendations,
  generateWeeklyPlanICS
} = require('../services/educationPlanner');

// Pre-computed helpers
const activitiesByCategory = getActivitiesByCategory();
const ageFilters = getAgeFilters();

// All education routes require authentication
router.use(requireAuth);

// Education resources index page
router.get('/', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const { data: children, error: childrenError } = await req.supabase
      .from('children')
      .select('id, name, birth_date, family_id, grade')
      .order('birth_date', { ascending: false });

    if (childrenError) {
      throw childrenError;
    }

    const { data: completions, error: completionsError } = await req.supabase
      .from('activity_completions')
      .select('activity_id, child_id, completed_at')
      .eq('user_id', userId);

    if (completionsError) {
      throw completionsError;
    }

    const completionMap = completions?.reduce((acc, completion) => {
      if (!acc[completion.activity_id]) {
        acc[completion.activity_id] = [];
      }
      acc[completion.activity_id].push(completion.child_id);
      return acc;
    }, {}) || {};

    const completedActivityIds = new Set(
      (completions || []).map(completion => completion.activity_id)
    );

    const totalMinutes = (completions || []).reduce((sum, completion) => {
      const activity = getActivityById(completion.activity_id);
      return sum + (activity?.durationMinutes || 0);
    }, 0);

    const childProfiles = buildChildProfiles(children || [], completions || []);
    const personalizedRecommendations = compileGlobalRecommendations(childProfiles, 6);

    const streakSummary = childProfiles.reduce((acc, profile) => {
      acc.longest = Math.max(acc.longest, profile.metrics.longestStreak);
      acc.current = Math.max(acc.current, profile.metrics.currentStreak);
      return acc;
    }, { longest: 0, current: 0 });

    const defaultAgeFilter = childProfiles[0]?.ageBuckets?.find(bucket => bucket !== 'all') || 'all';

    const weeklyPlans = childProfiles.reduce((acc, profile) => {
      acc[profile.child.id] = profile.weeklyPlan;
      return acc;
    }, {});

    res.render('education/index', {
      title: 'Ressources éducatives - MeLorAly',
      ageFilters,
      categories,
      activitiesByCategory,
      children: childProfiles,
      weeklyPlans,
      weekLabels: WEEK_DAYS,
      defaultAgeFilter,
      recommendedActivities: personalizedRecommendations,
      completionMap,
      progress: {
        completed: completedActivityIds.size,
        total: activities.length,
        minutes: totalMinutes,
        streak: streakSummary
      }
    });
  } catch (error) {
    console.error('Error loading education page:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement de la page');
    res.redirect('/dashboard');
  }
});

// Activity detail page
router.get('/activity/:id', async (req, res) => {
  try {
    const activity = getActivityById(req.params.id);

    if (!activity) {
      req.flash('error', 'Activité introuvable.');
      return res.redirect('/education');
    }

    const { data: children, error: childrenError } = await req.supabase
      .from('children')
      .select('id, name, birth_date, grade, family_id')
      .order('name', { ascending: true });

    if (childrenError) {
      throw childrenError;
    }

    const { data: completions, error: completionsError } = await req.supabase
      .from('activity_completions')
      .select('child_id')
      .eq('user_id', req.session.user.id)
      .eq('activity_id', activity.id);

    if (completionsError) {
      throw completionsError;
    }

    res.render('education/activity', {
      title: `${activity.title} - Ressources éducatives`,
      activity,
      children: children || [],
      completedChildIds: (completions || []).map(item => item.child_id)
    });
  } catch (error) {
    console.error('Error loading education activity:', error);
    req.flash('error', 'Impossible de charger le détail de cette activité.');
    res.redirect('/education');
  }
});

// Mark activity as complete (API endpoint)
router.post('/activity/:id/complete', async (req, res) => {
  try {
    const activityId = req.params.id;
    const { childId, completed = true } = req.body;
    const userId = req.session.user.id;

    if (!childId) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner un enfant.'
      });
    }

    const activity = getActivityById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activité introuvable.'
      });
    }

    const { data: child, error: childError } = await req.supabase
      .from('children')
      .select('id, family_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return res.status(404).json({
        success: false,
        message: 'Enfant introuvable.'
      });
    }

    const { data: membership, error: membershipError } = await req.supabase
      .from('family_members')
      .select('role')
      .eq('family_id', child.family_id)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé.'
      });
    }

    if (completed) {
      const { error: upsertError } = await req.supabase
        .from('activity_completions')
        .upsert({
          user_id: userId,
          child_id: childId,
          family_id: child.family_id,
          activity_id: activityId,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'activity_id,child_id'
        });

      if (upsertError) {
        console.error('Error storing activity completion:', upsertError);
        return res.status(500).json({
          success: false,
          message: 'Impossible de sauvegarder la progression.'
        });
      }

      return res.json({
        success: true,
        message: 'Activité marquée comme terminée.',
        completion: {
          activityId,
          childId,
          completedAt: new Date().toISOString(),
          durationMinutes: activity.durationMinutes
        }
      });
    }

    const { error: deleteError } = await req.supabase
      .from('activity_completions')
      .delete()
      .match({ activity_id: activityId, child_id: childId });

    if (deleteError) {
      console.error('Error removing activity completion:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Impossible de mettre à jour la progression.'
      });
    }

    return res.json({
      success: true,
      message: 'Progression réinitialisée pour cette activité.'
    });
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement'
    });
  }
});

// Download weekly plan (ICS)
router.get('/plan/:childId/download', async (req, res) => {
  try {
    const childId = req.params.childId;
    const userId = req.session.user.id;

    const { data: child, error: childError } = await req.supabase
      .from('children')
      .select('id, name, birth_date, grade, family_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return res.status(404).render('errors/404');
    }

    const { data: membership, error: membershipError } = await req.supabase
      .from('family_members')
      .select('id')
      .eq('family_id', child.family_id)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      req.flash('error', "Vous n'avez pas accès à cet enfant.");
      return res.redirect('/education');
    }

    const { data: completions = [] } = await req.supabase
      .from('activity_completions')
      .select('activity_id, child_id, completed_at')
      .eq('user_id', userId)
      .eq('child_id', childId);

    const [childProfile] = buildChildProfiles([child], completions || []);

    if (!childProfile) {
      req.flash('error', 'Impossible de générer le plan hebdomadaire.');
      return res.redirect('/education');
    }

    const plan = childProfile.weeklyPlan;

    if (!plan) {
      req.flash('error', 'Plan hebdomadaire indisponible pour le moment.');
      return res.redirect('/education');
    }

    const icsPayload = generateWeeklyPlanICS(childProfile, plan, {
      userEmail: req.session.user.email
    });

    const safeName = childProfile.child.name
      .toLowerCase()
      .replace(/[^\w\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    res.setHeader('Content-Disposition', `attachment; filename="meloraly-plan-${safeName || childProfile.child.id}.ics"`);
    res.type('text/calendar');
    res.send(icsPayload);
  } catch (error) {
    console.error('Error generating weekly plan:', error);
    req.flash('error', 'Impossible de générer le plan hebdomadaire.');
    res.redirect('/education');
  }
});

module.exports = router;
