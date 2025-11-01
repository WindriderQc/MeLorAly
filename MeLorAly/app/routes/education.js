const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// All education routes require authentication
router.use(requireAuth);

// Education resources index page
router.get('/', async (req, res) => {
    try {
        // Get user's children to personalize recommendations
        const { data: children, error } = await req.supabase
            .from('children')
            .select('*')
            .order('birth_date', { ascending: false });

        if (error) {
            console.error('Error fetching children:', error);
        }

        res.render('education/index', {
            title: 'Ressources éducatives - MeLorAly',
            children: children || []
        });
    } catch (error) {
        console.error('Error loading education page:', error);
        req.flash('error', 'Une erreur est survenue lors du chargement de la page');
        res.redirect('/dashboard');
    }
});

// Activity detail page (placeholder for future)
router.get('/activity/:id', async (req, res) => {
    // TODO: Implement activity detail page
    res.send('Activity detail page - Coming soon!');
});

// Mark activity as complete (API endpoint)
router.post('/activity/:id/complete', async (req, res) => {
    try {
        const activityId = req.params.id;
        const { childId } = req.body;

        // TODO: Store activity completion in database
        // For now, just return success
        res.json({ success: true, message: 'Activité marquée comme terminée' });
    } catch (error) {
        console.error('Error completing activity:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement' });
    }
});

module.exports = router;
