const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/latest', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('notifications')
      .select('id, title, message, type, read, created_at')
      .eq('user_id', req.session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      notifications: data || []
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Impossible de charger les notifications.'
    });
  }
});

router.post('/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;

    const { error } = await req.supabase
      .from('notifications')
      .update({ read: true })
      .match({ id: notificationId, user_id: req.session.user.id });

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Impossible de mettre à jour la notification.'
    });
  }
});

router.post('/mark-all', async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.session.user.id)
      .eq('read', false);

    if (error) {
      throw error;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Impossible de marquer toutes les notifications comme lues.'
    });
  }
});

module.exports = router;
