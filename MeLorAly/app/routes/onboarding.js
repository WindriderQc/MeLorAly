const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error', 'Veuillez vous connecter pour accéder à cette page');
        return res.redirect('/auth/login');
    }
    next();
};

// Onboarding step 1: Welcome
router.get('/welcome', requireAuth, (req, res) => {
    res.render('onboarding/welcome', {
        title: 'Bienvenue - MeLorAly',
        currentPage: 'onboarding'
    });
});

// Onboarding step 2: Children
router.get('/children', requireAuth, (req, res) => {
    res.render('onboarding/children', {
        title: 'Vos enfants - MeLorAly',
        currentPage: 'onboarding'
    });
});

// Onboarding step 3: Adults
router.get('/adults', requireAuth, (req, res) => {
    res.render('onboarding/adults', {
        title: 'Inviter la famille - MeLorAly',
        currentPage: 'onboarding'
    });
});

// Onboarding step 4: Family Space
router.get('/family-space', requireAuth, (req, res) => {
    res.render('onboarding/family-space', {
        title: 'Espace famille - MeLorAly',
        currentPage: 'onboarding'
    });
});

// Onboarding step 5: Ready
router.get('/ready', requireAuth, (req, res) => {
    res.render('onboarding/ready', {
        title: 'Prêt à commencer - MeLorAly',
        currentPage: 'onboarding'
    });
});

module.exports = router;
