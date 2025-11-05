const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
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

    // Get family members with profiles
    const { data: members } = await req.supabase
      .from('family_members')
      .select(`
        *,
        profiles!family_members_user_id_fkey (
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

    // Get family members with profiles
    const { data: members, error: membersError } = await req.supabase
      .from('family_members')
      .select(`
        *,
        profiles!family_members_user_id_fkey (
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

// Handle family update
router.post('/:id/update', [
    body('family_name').trim().notEmpty().withMessage('Le nom de la famille ne peut pas être vide.'),
    body('avatar_url').optional({ checkFalsy: true }).isURL().withMessage("L'URL de l'avatar est invalide.")
], async (req, res) => {
    const familyId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/family/${familyId}/manage`);
    }

    try {
        const { family_name, avatar_url } = req.body;
        const userId = req.session.user.id;

        // Check if user is an admin
        const { data: membership, error: membershipError } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', userId)
            .single();

        if (membershipError || !membership || membership.role !== 'admin') {
            req.flash('error', 'Vous devez être administrateur pour modifier cette famille.');
            return res.redirect(`/family/${familyId}`);
        }

        // Update the family
        const { error: updateError } = await req.supabase
            .from('families')
            .update({
                name: family_name,
                avatar_url: avatar_url,
                updated_at: new Date()
            })
            .eq('id', familyId);

        if (updateError) throw updateError;

        req.flash('success', 'Famille mise à jour avec succès !');
        res.redirect(`/family/${familyId}/manage`);
    } catch (error) {
        console.error('Family update error:', error);
        req.flash('error', 'Erreur lors de la mise à jour de la famille.');
        res.redirect(`/family/${familyId}/manage`);
    }
});

// Invite a new member
router.post('/:id/invite', [
    body('email').isEmail().withMessage('Veuillez fournir une adresse e-mail valide.'),
    body('role').isIn(['parent', 'grandparent']).withMessage('Le rôle doit être "parent" ou "grandparent".')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const familyId = req.params.id;
        const { email, role } = req.body;
        const inviterId = req.session.user.id;

        // Check if user is an admin
        const { data: membership } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', inviterId)
            .single();

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Vous devez être administrateur pour inviter des membres.' });
        }

        // Check if user is already a member
        const { data: existingUser } = await req.supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            const { data: isMember } = await req.supabase
                .from('family_members')
                .select('id')
                .eq('family_id', familyId)
                .eq('user_id', existingUser.id)
                .single();

            if (isMember) {
                return res.status(400).json({ error: 'Cet utilisateur est déjà membre de la famille.' });
            }
        }

        // Create invitation
        const { data: invitation, error } = await req.supabase
            .from('invitations')
            .insert({
                family_id: familyId,
                invited_by: inviterId,
                email: email,
                role: role,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(invitation);
    } catch (error) {
        console.error('Invitation error:', error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation." });
    }
});

// Remove a family member
router.delete('/:id/member/:memberId', async (req, res) => {
    try {
        const { id: familyId, memberId } = req.params;
        const currentUserId = req.session.user.id;

        // Check if user is an admin
        const { data: membership } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', currentUserId)
            .single();

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Vous devez être administrateur pour supprimer des membres.' });
        }

        // Prevent admin from removing themselves if they are the last admin
        if (currentUserId === memberId) {
            const { data: admins } = await req.supabase
                .from('family_members')
                .select('user_id')
                .eq('family_id', familyId)
                .eq('role', 'admin');

            if (admins && admins.length === 1) {
                return res.status(400).json({ error: 'Vous ne pouvez pas vous supprimer car vous êtes le dernier administrateur.' });
            }
        }


        const { error } = await req.supabase
            .from('family_members')
            .delete()
            .eq('family_id', familyId)
            .eq('user_id', memberId);

        if (error) throw error;

        res.status(200).json({ message: 'Membre supprimé avec succès.' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du membre.' });
    }
});

// Update a member's role
router.patch('/:id/member/:memberId/role', [
    body('role').isIn(['admin', 'parent', 'grandparent']).withMessage('Le rôle doit être "admin", "parent" ou "grandparent".')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id: familyId, memberId } = req.params;
        const { role } = req.body;
        const currentUserId = req.session.user.id;

        // Check if user is an admin
        const { data: membership } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', currentUserId)
            .single();

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Vous devez être administrateur pour modifier les rôles.' });
        }

        // Prevent admin from demoting themselves if they are the last admin
        if (currentUserId === memberId && role === 'parent') {
            const { data: admins } = await req.supabase
                .from('family_members')
                .select('user_id')
                .eq('family_id', familyId)
                .eq('role', 'admin');

            if (admins && admins.length === 1) {
                return res.status(400).json({ error: 'Vous ne pouvez pas vous rétrograder car vous êtes le dernier administrateur.' });
            }
        }


        const { data, error } = await req.supabase
            .from('family_members')
            .update({ role })
            .eq('family_id', familyId)
            .eq('user_id', memberId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle.' });
    }
});

// Delete a family
router.delete('/:id', async (req, res) => {
    try {
        const familyId = req.params.id;
        const userId = req.session.user.id;

        // Check if user is an admin
        const { data: membership, error: membershipError } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', userId)
            .single();

        if (membershipError || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Vous devez être administrateur pour supprimer cette famille.' });
        }

        // Delete the family
        const { error: deleteError } = await req.supabase
            .from('families')
            .delete()
            .eq('id', familyId);

        if (deleteError) throw deleteError;

        req.flash('success', 'Famille supprimée avec succès.');
        res.status(200).json({ message: 'Famille supprimée avec succès.', redirect: '/family' });
    } catch (error) {
        console.error('Family delete error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la famille.' });
    }
});

// Cancel an invitation
router.delete('/:id/invitation/:invitationId', async (req, res) => {
    try {
        const { id: familyId, invitationId } = req.params;
        const currentUserId = req.session.user.id;

        // Check if user is an admin
        const { data: membership } = await req.supabase
            .from('family_members')
            .select('role')
            .eq('family_id', familyId)
            .eq('user_id', currentUserId)
            .single();

        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Vous devez être administrateur pour annuler les invitations.' });
        }

        const { error } = await req.supabase
            .from('invitations')
            .delete()
            .eq('id', invitationId)
            .eq('family_id', familyId);

        if (error) throw error;

        res.status(200).json({ message: 'Invitation annulée avec succès.' });
    } catch (error) {
        console.error('Cancel invitation error:', error);
        res.status(500).json({ error: "Erreur lors de l'annulation de l'invitation." });
    }
});

module.exports = router;