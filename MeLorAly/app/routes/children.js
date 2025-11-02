const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seuls les fichiers image sont autorisés.'));
    }
    cb(null, true);
  }
});

function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

async function loadChildForUser(req, childId) {
  const { data: child, error } = await req.supabase
    .from('children')
    .select(`
      id,
      family_id,
      name,
      birth_date,
      grade,
      avatar_url,
      created_at,
      updated_at,
      created_by,
      families!children_family_id_fkey (
        id,
        name
      )
    `)
    .eq('id', childId)
    .single();

  if (error || !child) {
    const err = new Error('Enfant introuvable');
    err.status = 404;
    throw err;
  }

  const { data: membership, error: membershipError } = await req.supabase
    .from('family_members')
    .select('role')
    .eq('family_id', child.family_id)
    .eq('user_id', req.session.user.id)
    .single();

  if (membershipError || !membership) {
    const err = new Error('Accès non autorisé');
    err.status = 403;
    throw err;
  }

  const formattedChild = {
    ...child,
    family: child.families,
    age: calculateAge(child.birth_date),
    membershipRole: membership.role
  };
  delete formattedChild.families;

  return formattedChild;
}

function mapValidationErrors(errors) {
  return errors.array().reduce((acc, error) => {
    const key = error.path || error.param;
    if (!acc[key]) {
      acc[key] = error.msg;
    }
    return acc;
  }, {});
}

const editValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire.')
    .isLength({ max: 120 }).withMessage('Le nom est trop long.'),
  body('birth_date')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('La date de naissance est invalide.'),
  body('grade')
    .optional({ values: 'falsy' })
    .isLength({ max: 100 }).withMessage('Le niveau scolaire est trop long.')
];

router.get('/:childId', async (req, res) => {
  try {
    const child = await loadChildForUser(req, req.params.childId);

    res.render('children/profile', {
      title: `${child.name} - Profil enfant`,
      child
    });
  } catch (error) {
    console.error('Erreur de chargement du profil enfant:', error);
    if (error.status === 403) {
      req.flash('error', "Vous n'avez pas accès à cet enfant.");
    } else {
      req.flash('error', "Impossible d'afficher le profil de l'enfant.");
    }
    res.redirect('/dashboard');
  }
});

router.get('/:childId/edit', async (req, res) => {
  try {
    const child = await loadChildForUser(req, req.params.childId);

    res.render('children/edit', {
      title: `Modifier ${child.name}`,
      child,
      errors: {},
      formValues: {
        name: child.name,
        birth_date: child.birth_date ? child.birth_date.substring(0, 10) : '',
        grade: child.grade || ''
      }
    });
  } catch (error) {
    console.error('Erreur de chargement du formulaire enfant:', error);
    if (error.status === 403) {
      req.flash('error', "Vous n'avez pas les droits pour modifier cet enfant.");
    } else {
      req.flash('error', 'Impossible de charger le formulaire de modification.');
    }
    res.redirect('/dashboard');
  }
});

router.post('/:childId/edit', editValidators, async (req, res) => {
  const childId = req.params.childId;
  let child;

  try {
    child = await loadChildForUser(req, childId);
  } catch (error) {
    console.error('Erreur de vérification d\'accès enfant:', error);
    if (error.status === 403) {
      req.flash('error', "Vous n'avez pas les droits pour modifier cet enfant.");
    } else {
      req.flash('error', 'Impossible de modifier cet enfant.');
    }
    return res.redirect('/dashboard');
  }

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).render('children/edit', {
      title: `Modifier ${child.name}`,
      child,
      errors: mapValidationErrors(validationErrors),
      formValues: {
        name: req.body.name,
        birth_date: req.body.birth_date,
        grade: req.body.grade
      }
    });
  }

  const updates = {
    name: req.body.name.trim(),
    birth_date: req.body.birth_date ? req.body.birth_date : null,
    grade: req.body.grade ? req.body.grade.trim() : null,
    updated_at: new Date().toISOString()
  };

  try {
    const { error: updateError } = await req.supabase
      .from('children')
      .update(updates)
      .match({ id: childId, family_id: child.family_id });

    if (updateError) {
      throw updateError;
    }

    req.flash('success', "Profil de l'enfant mis à jour avec succès.");
    res.redirect(`/children/${childId}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enfant:', error);
    req.flash('error', "Une erreur est survenue lors de la mise à jour de l'enfant.");
    res.redirect(`/children/${childId}/edit`);
  }
});

router.delete('/:childId', async (req, res) => {
  try {
    const child = await loadChildForUser(req, req.params.childId);

    if (child.membershipRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Seul un administrateur de la famille peut supprimer un enfant."
      });
    }

    const { error } = await req.supabase
      .from('children')
      .delete()
      .match({ id: child.id, family_id: child.family_id });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: 'Enfant supprimé avec succès.',
      redirect: `/family/${child.family_id}`
    });
  } catch (error) {
    console.error('Erreur de suppression de l\'enfant:', error);
    const status = error.status === 403 ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: status === 403 ? "Vous n'avez pas les droits pour cette action." : "Impossible de supprimer l'enfant pour le moment."
    });
  }
});

router.post('/:childId/photo', (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Erreur de téléchargement de photo:', err);
      req.flash('error', err.message || 'Impossible de téléverser la photo.');
      return res.redirect(`/children/${req.params.childId}`);
    }

    if (!req.file) {
      req.flash('error', 'Veuillez sélectionner une photo.');
      return res.redirect(`/children/${req.params.childId}`);
    }

    let child;
    try {
      child = await loadChildForUser(req, req.params.childId);
    } catch (error) {
      console.error('Erreur d\'accès lors de l\'upload photo enfant:', error);
      if (error.status === 403) {
        req.flash('error', "Vous n'avez pas les droits pour modifier cet enfant.");
      } else {
        req.flash('error', 'Impossible de mettre à jour la photo de cet enfant.');
      }
      return res.redirect('/dashboard');
    }

    try {
      const fileExtension = path.extname(req.file.originalname) || '.jpg';
      const storagePath = `children/${child.id}/${uuidv4()}${fileExtension}`;

      const { error: uploadError } = await req.supabase.storage
        .from('child-photos')
        .upload(storagePath, req.file.buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: req.file.mimetype
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = req.supabase.storage
        .from('child-photos')
        .getPublicUrl(storagePath);

      const photoUrl = publicUrlData?.publicUrl;

      const { error: updateError } = await req.supabase
        .from('children')
        .update({
          avatar_url: photoUrl,
          updated_at: new Date().toISOString()
        })
        .match({ id: child.id, family_id: child.family_id });

      if (updateError) {
        throw updateError;
      }

      req.flash('success', 'Photo mise à jour avec succès.');
      res.redirect(`/children/${child.id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo enfant:', error);
      req.flash('error', "Impossible de mettre à jour la photo de l'enfant.");
      res.redirect(`/children/${child.id}`);
    }
  });
});

module.exports = router;
