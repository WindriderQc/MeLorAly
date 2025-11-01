const express = require('express');
const router = express.Router();

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
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            req.flash('error', 'Tous les champs sont obligatoires');
            return res.redirect('/contact');
        }

        // TODO: Implement email sending
        // Options:
        // 1. Use Supabase Edge Functions
        // 2. Use a service like SendGrid, Mailgun, etc.
        // 3. Store in database and process async
        
        // For now, just log the contact request
        console.log('Contact form submission:', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        });

        // Store in database if user is authenticated
        if (req.user) {
            const { error } = await req.supabase
                .from('contact_requests')
                .insert({
                    user_id: req.user.id,
                    name,
                    email,
                    subject,
                    message,
                    status: 'pending'
                });

            if (error) {
                console.error('Error storing contact request:', error);
            }
        }

        req.flash('success', 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error processing contact form:', error);
        req.flash('error', 'Une erreur est survenue lors de l\'envoi du message');
        res.redirect('/contact');
    }
});

module.exports = router;
