const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Messages index
router.get('/', async (req, res) => {
  try {
    // Get user's conversations (from family_members)
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(`
        *,
        families (
          id,
          name,
          avatar_url
        )
      `)
      .eq('user_id', req.session.user.id);

    // Get recent messages for each family
    let conversations = [];
    if (familyMembers && familyMembers.length > 0) {
      const familyIds = familyMembers.map(fm => fm.family_id);
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .in('family_id', familyIds)
        .order('created_at', { ascending: false })
        .limit(50);

      conversations = messages || [];
    }

    res.render('messages/index', {
      title: 'Messagerie - MeLorAly',
      currentPage: 'messages',
      conversations: conversations,
      families: familyMembers || []
    });
  } catch (error) {
    console.error('Messages error:', error);
    req.flash('error', 'Erreur lors du chargement des messages.');
    res.render('messages/index', {
      title: 'Messagerie - MeLorAly',
      currentPage: 'messages',
      conversations: [],
      families: []
    });
  }
});

// Send message (API endpoint)
router.post('/send', async (req, res) => {
  try {
    const { family_id, content } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          family_id,
          sender_id: req.session.user.id,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: data });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
