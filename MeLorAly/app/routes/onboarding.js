const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { 
    childrenValidator, 
    adultsValidator, 
    familySpaceValidator, 
    validationResult 
} = require('../middleware/validators');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
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
        currentPage: 'onboarding',
        formData: req.session.onboarding?.children || [],
        errors: []
    });
});

// POST handler for children step
router.post('/children', childrenValidator, requireAuth, (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return to form with errors
            return res.render('onboarding/children', {
                title: 'Vos enfants - MeLorAly',
                currentPage: 'onboarding',
                formData: req.body.children || [],
                errors: errors.array()
            });
        }

        // Initialize onboarding session if it doesn't exist
        if (!req.session.onboarding) {
            req.session.onboarding = {};
        }

        // Parse children data from form
        const children = [];
        const childrenData = req.body.children;

        // Handle both single child and multiple children
        if (Array.isArray(childrenData)) {
            childrenData.forEach(child => {
                if (child.name && child.birthDate) {
                    children.push({
                        name: child.name.trim(),
                        birthDate: child.birthDate,
                        grade: child.grade || null
                    });
                }
            });
        } else if (childrenData && childrenData.name && childrenData.birthDate) {
            // Single child case
            children.push({
                name: childrenData.name.trim(),
                birthDate: childrenData.birthDate,
                grade: childrenData.grade || null
            });
        }

        // Validation: at least one child required (redundant with validator but kept for safety)
        if (children.length === 0) {
            req.flash('error', 'Veuillez ajouter au moins un enfant');
            return res.redirect('/onboarding/children');
        }

        // Store in session
        req.session.onboarding.children = children;

        // Redirect to next step
        res.redirect('/onboarding/adults');
    } catch (error) {
        console.error('Error saving children:', error);
        req.flash('error', 'Erreur lors de l\'enregistrement des enfants');
        res.redirect('/onboarding/children');
    }
});

// Onboarding step 3: Adults
router.get('/adults', requireAuth, (req, res) => {
    res.render('onboarding/adults', {
        title: 'Inviter la famille - MeLorAly',
        currentPage: 'onboarding',
        formData: req.session.onboarding?.adults || [],
        errors: []
    });
});

// POST handler for adults step
router.post('/adults', adultsValidator, requireAuth, (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return to form with errors
            return res.render('onboarding/adults', {
                title: 'Inviter la famille - MeLorAly',
                currentPage: 'onboarding',
                formData: req.body.adults || [],
                errors: errors.array()
            });
        }

        // Initialize onboarding session if it doesn't exist
        if (!req.session.onboarding) {
            req.session.onboarding = {};
        }

        // Parse adults data from form
        const adults = [];
        const adultsData = req.body.adults;

        // Handle both single adult and multiple adults
        if (Array.isArray(adultsData)) {
            adultsData.forEach(adult => {
                if (adult.email) {
                    adults.push({
                        email: adult.email.trim().toLowerCase(),
                        role: adult.role || 'parent',
                        name: adult.name?.trim() || null
                    });
                }
            });
        } else if (adultsData && adultsData.email) {
            // Single adult case
            adults.push({
                email: adultsData.email.trim().toLowerCase(),
                role: adultsData.role || 'parent',
                name: adultsData.name?.trim() || null
            });
        }

        // Store in session (adults are optional)
        req.session.onboarding.adults = adults;

        // Redirect to next step
        res.redirect('/onboarding/family-space');
    } catch (error) {
        console.error('Error saving adults:', error);
        req.flash('error', 'Erreur lors de l\'enregistrement des invitations');
        res.redirect('/onboarding/adults');
    }
});

// Onboarding step 4: Family Space
router.get('/family-space', requireAuth, (req, res) => {
    res.render('onboarding/family-space', {
        title: 'Espace famille - MeLorAly',
        currentPage: 'onboarding',
        formData: req.session.onboarding?.familySpace || {},
        errors: []
    });
});

// POST handler for family-space step
router.post('/family-space', familySpaceValidator, requireAuth, (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return to form with errors
            return res.render('onboarding/family-space', {
                title: 'Espace famille - MeLorAly',
                currentPage: 'onboarding',
                formData: {
                    name: req.body.familyName,
                    description: req.body.familyDescription
                },
                errors: errors.array()
            });
        }

        // Initialize onboarding session if it doesn't exist
        if (!req.session.onboarding) {
            req.session.onboarding = {};
        }

        // Get family space data
        const familyName = req.body.familyName?.trim();
        const familyDescription = req.body.familyDescription?.trim() || null;

        // Validation: family name required (redundant with validator but kept for safety)
        if (!familyName || familyName.length < 2) {
            req.flash('error', 'Veuillez donner un nom à votre espace famille (minimum 2 caractères)');
            return res.redirect('/onboarding/family-space');
        }

        // Store in session
        req.session.onboarding.familySpace = {
            name: familyName,
            description: familyDescription
        };

        // Redirect to final step
        res.redirect('/onboarding/ready');
    } catch (error) {
        console.error('Error saving family space:', error);
        req.flash('error', 'Erreur lors de la création de l\'espace famille');
        res.redirect('/onboarding/family-space');
    }
});

// Onboarding step 5: Ready
router.get('/ready', requireAuth, async (req, res) => {
    try {
        // Check if onboarding data exists in session
        const onboardingData = req.session.onboarding;
        
        if (!onboardingData || !onboardingData.children || !onboardingData.familySpace) {
            req.flash('error', 'Veuillez compléter toutes les étapes de l\'onboarding');
            return res.redirect('/onboarding/welcome');
        }

        // Persist data to Supabase
        const userId = req.session.user.id;
        
        // Step 1: Create the family
        const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({
                name: onboardingData.familySpace.name,
                description: onboardingData.familySpace.description,
                created_by: userId
            })
            .select()
            .single();

        if (familyError) {
            console.error('Error creating family:', familyError);
            throw familyError;
        }

        // Step 2: Add creator as family member (admin)
        const { error: memberError } = await supabase
            .from('family_members')
            .insert({
                family_id: family.id,
                user_id: userId,
                role: 'admin'
            });

        if (memberError) {
            console.error('Error adding family member:', memberError);
            throw memberError;
        }

        // Step 3: Insert children
        if (onboardingData.children && onboardingData.children.length > 0) {
            const childrenToInsert = onboardingData.children.map(child => ({
                family_id: family.id,
                name: child.name,
                birth_date: child.birthDate,
                grade: child.grade
            }));

            const { error: childrenError } = await supabase
                .from('children')
                .insert(childrenToInsert);

            if (childrenError) {
                console.error('Error inserting children:', childrenError);
                throw childrenError;
            }
        }

        // Step 4: Send invitations to adults (if any)
        if (onboardingData.adults && onboardingData.adults.length > 0) {
            const invitationsToInsert = onboardingData.adults.map(adult => ({
                family_id: family.id,
                email: adult.email,
                role: adult.role,
                invited_by: userId,
                status: 'pending',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            }));

            const { error: invitationsError } = await supabase
                .from('invitations')
                .insert(invitationsToInsert);

            if (invitationsError) {
                console.error('Error creating invitations:', invitationsError);
                // Don't throw - invitations are non-critical
            }
        }

        // Step 5: Mark user's onboarding as complete
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't throw - we can continue
        }

        // Clear onboarding session data
        delete req.session.onboarding;

        // Set success message and redirect
        req.flash('success', 'Bienvenue dans votre espace famille !');
        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error completing onboarding:', error);
        req.flash('error', 'Une erreur est survenue. Veuillez réessayer.');
        res.render('onboarding/ready', {
            title: 'Prêt à commencer - MeLorAly',
            currentPage: 'onboarding'
        });
    }
});

module.exports = router;
