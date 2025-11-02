const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// All profile routes require authentication
router.use(requireAuth);

// Profile main page - redirect to edit
router.get('/', (req, res) => {
    res.redirect('/profile/edit');
});

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
            .eq('id', req.session.user.id)
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
            .eq('id', req.session.user.id);

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
            .eq('id', req.session.user.id);

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

        const supabase = req.supabase;
        const user = req.session.user;
        const userId = user.id;
        const userEmail = user.email;

        const familiesToDelete = new Set();

        const { data: memberships, error: membershipsError } = await supabase
            .from('family_members')
            .select('family_id, role')
            .eq('user_id', userId);

        if (membershipsError) {
            throw membershipsError;
        }

        if (memberships && memberships.length > 0) {
            for (const membership of memberships) {
                if (membership.role !== 'admin') {
                    continue;
                }

                const { data: adminMembers, error: adminError } = await supabase
                    .from('family_members')
                    .select('user_id')
                    .eq('family_id', membership.family_id)
                    .eq('role', 'admin');

                if (adminError) {
                    throw adminError;
                }

                if (!adminMembers || adminMembers.length !== 1) {
                    continue;
                }

                const { data: otherMembers, error: otherMembersError } = await supabase
                    .from('family_members')
                    .select('user_id, role')
                    .eq('family_id', membership.family_id)
                    .neq('user_id', userId);

                if (otherMembersError) {
                    throw otherMembersError;
                }

                if (!otherMembers || otherMembers.length === 0) {
                    familiesToDelete.add(membership.family_id);
                    continue;
                }

                const existingAdmin = otherMembers.find(member => member.role === 'admin');
                const nextAdmin = existingAdmin || otherMembers[0];

                const { error: promoteError } = await supabase
                    .from('family_members')
                    .update({ role: 'admin' })
                    .eq('family_id', membership.family_id)
                    .eq('user_id', nextAdmin.user_id);

                if (promoteError) {
                    throw promoteError;
                }
            }
        }

        const { error: invitationsByUserError } = await supabase
            .from('invitations')
            .delete()
            .eq('invited_by', userId);

        if (invitationsByUserError) {
            throw invitationsByUserError;
        }

        const { error: invitationsByEmailError } = await supabase
            .from('invitations')
            .delete()
            .eq('email', userEmail);

        if (invitationsByEmailError) {
            throw invitationsByEmailError;
        }

        const { error: notificationsError } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId);

        if (notificationsError) {
            throw notificationsError;
        }

        const { error: contactUpdateError } = await supabase
            .from('contact_requests')
            .update({ status: 'closed' })
            .eq('email', userEmail);

        if (contactUpdateError) {
            console.warn('Optional contact request cleanup failed:', contactUpdateError);
        }

        const { error: familyMembershipDeleteError } = await supabase
            .from('family_members')
            .delete()
            .eq('user_id', userId);

        if (familyMembershipDeleteError) {
            throw familyMembershipDeleteError;
        }

        if (familiesToDelete.size > 0) {
            const { error: familyDeleteError } = await supabase
                .from('families')
                .delete()
                .in('id', Array.from(familiesToDelete));

            if (familyDeleteError) {
                throw familyDeleteError;
            }
        }

        const { error: profileDeleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileDeleteError) {
            console.warn('Profile deletion fallback (will continue):', profileDeleteError);
        }

        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

        if (authDeleteError) {
            throw authDeleteError;
        }

        delete req.session.user;
        req.flash('success', 'Votre compte a été supprimé. Merci d\'avoir testé MeLorAly.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error deleting account:', error);
        req.flash('error', 'Une erreur est survenue');
        res.redirect('/profile/edit');
    }
});

module.exports = router;
