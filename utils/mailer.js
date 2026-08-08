const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true لـ 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"صفقة" <no-reply@safqa.app>',
        to,
        subject,
        html,
    });
};

module.exports = { sendEmail };
