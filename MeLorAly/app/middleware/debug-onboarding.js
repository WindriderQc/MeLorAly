// Onboarding Debug Middleware
// Add this temporarily to routes/onboarding.js to debug session data

const debugOnboardingSession = (req, res, next) => {
    if (req.session.onboarding) {
        console.log('\n=== ONBOARDING SESSION DEBUG ===');
        console.log('Current Route:', req.path);
        console.log('Session Data:', JSON.stringify(req.session.onboarding, null, 2));
        console.log('Children Count:', req.session.onboarding.children?.length || 0);
        console.log('Adults Count:', req.session.onboarding.adults?.length || 0);
        console.log('Family Name:', req.session.onboarding.familySpace?.name || 'Not set');
        console.log('================================\n');
    } else {
        console.log('\n=== ONBOARDING SESSION DEBUG ===');
        console.log('Current Route:', req.path);
        console.log('Session Data: EMPTY (not started)');
        console.log('================================\n');
    }
    next();
};

// Usage: Add to routes where you want to debug
// router.get('/children', debugOnboardingSession, requireAuth, (req, res) => { ... });
// router.post('/children', debugOnboardingSession, (req, res) => { ... });

module.exports = { debugOnboardingSession };
