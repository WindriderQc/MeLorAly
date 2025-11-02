const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const emailService = require('../services/email');
const router = express.Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// FAQ page (public access)
router.get('/faq', (req, res) => {
    res.render('faq', {
        title: 'Questions fréquentes - MeLorAly'
    });
});

// Contact page (public access)
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contactez-nous - MeLorAly'
    });
});

// Handle contact form submission
router.post('/contact/send', async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim();
        const subject = req.body.subject?.trim();
        const message = req.body.message?.trim();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            req.flash('error', 'Tous les champs sont obligatoires');
            return res.redirect('/contact');
        }

        const userId = req.session?.user?.id || null;

        const { error: storeError } = await supabaseAdmin
            .from('contact_requests')
            .insert({
                user_id: userId,
                name,
                email,
                subject,
                message,
                status: 'pending'
            });

        if (storeError) {
            console.error('Error storing contact request:', storeError);
        }

        const emailResult = await emailService.sendSupportEmail({ name, email, subject, message });

        if (!emailResult.sent) {
            req.flash('success', 'Votre message a été enregistré. Notre équipe vous contactera très bientôt.');
        } else {
            req.flash('success', 'Votre message a été envoyé avec succès. Nous vous répondrons rapidement.');
        }

        res.redirect('/contact');
    } catch (error) {
        console.error('Error processing contact form:', error);
        req.flash('error', 'Une erreur est survenue lors de l\'envoi du message');
        res.redirect('/contact');
    }
});

module.exports = router;
