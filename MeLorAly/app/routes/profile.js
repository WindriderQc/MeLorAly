const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// All profile routes require authentication
router.use(requireAuth);

// Profile edit page
router.get('/edit', async (req, res) => {
    try {
        res.render('profile/edit', {
            title: 'Mon profil - MeLorAly'
        });
    } catch (error) {
        console.error('Error loading profile page:', error);
        req.flash('error', 'Une erreur est survenue lors du chargement de la page');
        res.redirect('/dashboard');
    }
});

// Update profile information
router.post('/update', async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;

        const { data, error } = await req.supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                bio: bio,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            req.flash('error', 'Erreur lors de la mise à jour du profil');
            return res.redirect('/profile/edit');
        }

        req.flash('success', 'Profil mis à jour avec succès');
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash('error', 'Une erreur est survenue lors de la mise à jour');
        res.redirect('/profile/edit');
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            req.flash('error', 'Les nouveaux mots de passe ne correspondent pas');
            return res.redirect('/profile/edit');
        }

        // Update password using Supabase auth
        const { error } = await req.supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Error changing password:', error);
            req.flash('error', 'Erreur lors du changement de mot de passe');
            return res.redirect('/profile/edit');
        }

        req.flash('success', 'Mot de passe modifié avec succès');
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/profile/edit');
    }
});

// Update notification settings
router.post('/notifications', async (req, res) => {
    try {
        const { emailNotifications, pushNotifications, smsNotifications } = req.body;

        const { error } = await req.supabase
            .from('profiles')
            .update({
                notifications: {
                    email: emailNotifications === 'on',
                    push: pushNotifications === 'on',
                    sms: smsNotifications === 'on'
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        if (error) {
            console.error('Error updating notifications:', error);
            req.flash('error', 'Erreur lors de la mise à jour des notifications');
            return res.redirect('/profile/edit');
        }

        req.flash('success', 'Préférences de notifications mises à jour');
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error updating notifications:', error);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/profile/edit');
    }
});

// Update privacy settings
router.post('/privacy', async (req, res) => {
    try {
        const { profileVisibility } = req.body;

        const { error } = await req.supabase
            .from('profiles')
            .update({
                visibility: profileVisibility,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        if (error) {
            console.error('Error updating privacy:', error);
            req.flash('error', 'Erreur lors de la mise à jour de la confidentialité');
            return res.redirect('/profile/edit');
        }

        req.flash('success', 'Paramètres de confidentialité mis à jour');
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error updating privacy:', error);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/profile/edit');
    }
});

// Delete account
router.post('/delete', async (req, res) => {
    try {
        const { confirmDelete } = req.body;

        if (confirmDelete !== 'SUPPRIMER') {
            req.flash('error', 'Confirmation invalide');
            return res.redirect('/profile/edit');
        }

        // TODO: Implement proper account deletion workflow
        // Should include:
        // - Removing user from all families
        // - Deleting associated data
        // - Soft delete vs hard delete
        
        req.flash('error', 'La suppression de compte n\'est pas encore implémentée');
        res.redirect('/profile/edit');
    } catch (error) {
        console.error('Error deleting account:', error);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/profile/edit');
    }
});

module.exports = router;
