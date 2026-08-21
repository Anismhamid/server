const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 دقيقة

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const genericResponse = {
            message:
                'إذا كان هيدا الإيميل مسجل عنا، رح توصلك رسالة فيها رابط إعادة التعيين',
        };

        const user = await User.findOne({ email });
        // ✅ نفس الرد سواء الحساب موجود أو لأ، منشان ما نكشف وجود إيميل معين بالنظام
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}?email=${encodeURIComponent(
            email,
        )}`;

        await sendEmail({
            to: email,
            subject: 'إعادة تعيين كلمة السر - صفقة',
            html: `
                <div dir="rtl" style="font-family: sans-serif; line-height: 1.6;">
                    <h2>إعادة تعيين كلمة السر</h2>
                    <p>وصلنا طلب لإعادة تعيين كلمة السر لحسابك بصفقة.</p>
                    <p>اضغط على الرابط تحت (صالح لمدة 15 دقيقة فقط):</p>
                    <p>
                        <a href="${resetUrl}" style="background:#0288D1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">
                            إعادة تعيين كلمة السر
                        </a>
                    </p>
                    <p>إذا ما كنت انت طلبت هيدا، تجاهل هالرسالة ولا شي رح يتغير.</p>
                </div>
            `,
        });

        return res.status(200).json(genericResponse);
    } catch (error) {
        console.error('forgotPassword error:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { email, password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters',
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired reset link' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // ✅ نفس نمط tokenVersion المستخدم بالمشروع لتسجيل خروج من كل الأجهزة
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('resetPassword error:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { forgotPassword, resetPassword };
