// utils/mailer.js
// ✅ استخدام Brevo HTTP API بدل SMTP - Render حاجبة كل بورتات SMTP
// (25, 465, 587) عالخطط المجانية من 26 سبتمبر 2025

const sendEmail = async ({ to, subject, html }) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                name: 'صفقة',
                email: process.env.EMAIL_FROM,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
};

module.exports = { sendEmail };