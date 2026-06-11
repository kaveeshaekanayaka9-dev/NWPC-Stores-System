const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 👈 User Model එක
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});


router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "පරිශීලකයා හමු නොවීය." });

        // Generate a 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otpCode;
        user.resetOTPExpires = Date.now() + 600000; // Valid for 10 minutes
        await user.save();

        console.log(`\n📨 [OTP Debug] Code for ${email} is: ${otpCode}\n`);

        let emailSent = false;
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const mailOptions = {
                    from: `"NWPC Stores" <no-reply@nw.gov.lk>`,
                    to: user.email,
                    subject: 'Password Reset OTP - NWPC Stores',
                    text: `Your OTP code for password reset is: ${otpCode}. It is valid for 10 minutes.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
                            <h2 style="color: #3498db; margin-top: 0;">NWPC Stores Password Reset</h2>
                            <p>You requested a password reset. Use the following One-Time Password (OTP) to complete the reset process:</p>
                            <div style="font-size: 28px; font-weight: bold; background: #f4f6f9; padding: 15px; text-align: center; border-radius: 6px; letter-spacing: 4px; color: #2c3e50; margin: 20px 0;">
                                ${otpCode}
                            </div>
                            <p style="color: #e74c3c; font-size: 13px; margin-top: 15px;">Note: This OTP is valid for 10 minutes only.</p>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                emailSent = true;
            } catch (err) {
                console.error("❌ Nodemailer Error:", err.message);
            }
        }

        res.status(200).json({ 
            message: emailSent 
                ? "මුරපදය වෙනස් කිරීමේ OTP කේතය ඔබගේ ඊමේල් ලිපිනයට යවන ලදී." 
                : "OTP කේතය සාර්ථකව ජනනය කරන ලදී (සංවර්ධන ප්‍රකාරයේදී සර්වර් කන්සෝලය බලන්න)."
        });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/reset-password-otp', async (req, res) => {
    try {
        const { email, otpCode, newPassword } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "පරිශීලකයා හමු නොවීය." });
        }

        // Check if OTP exists and is valid
        if (!user.resetOTP || user.resetOTP !== otpCode) {
            return res.status(400).json({ message: "ඇතුළත් කළ OTP කේතය වැරදියි." });
        }

        // Check if OTP has expired
        if (new Date() > user.resetOTPExpires) {
            return res.status(400).json({ message: "OTP කේතයේ වලංගු කාලය අවසන් වී ඇත." });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP fields
        user.password = hashedPassword;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        res.status(200).json({ message: "මුරපදය සාර්ථකව වෙනස් කරන ලදී!" });
    } catch (err) {
        console.error("OTP Reset Error:", err);
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 1. 📝 SIGN UP / REGISTER API
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // සාමාන්‍යයෙන් ලියාපදිංචි වන හැමෝම SUBJECT_OFFICER වන අතර isAdminApproved = false වේ
        user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: 'SUBJECT_OFFICER',
            isAdminApproved: false 
        });
        await user.save();

        res.status(201).json({ message: 'ලියාපදිංචිය සාර්ථකයි! Admin අනුමැතිය ලැබෙන තෙක් රැඳී සිටින්න.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. 👥 සියලුම නිලධාරීන් ලබාගැනීම
router.get('/all-officers', async (req, res) => {
    try {
        const officers = await User.find({ role: 'SUBJECT_OFFICER' });
        res.status(200).json(officers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. 🔑 LOGIN API (Email එක ඇතුළත් කර සකස් කරන ලදී)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'වැරදි ඊමේල් ලිපිනයක් හෝ මුරපදයක්!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'වැරදි ඊමේල් ලිපිනයක් හෝ මුරපදයක්!' });

        // 🛑 Admin Approve කරලා නැත්නම් ලොග් වෙන්න දෙන්න එපා!
        if (!user.isAdminApproved && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'ඔබගේ ගිණුමට තවමත් Admin අනුමැතිය ලැබී නැත!' });
        }

        // JWT Token එකක් හැදීම
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'PC_SECRET_KEY', { expiresIn: '1d' });

        res.status(200).json({
            token,
            // 🎯 මෙන්න මෙතනට email: user.email එකතු කළා! දැන් Frontend එකට නිවැරදිව Email එක ලැබේවි.
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. 👑 ADMIN APPROVAL API
// ==========================================
router.put('/approve-user/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isAdminApproved: true },
            { new: true }
        );
        res.status(200).json({ message: `${updatedUser.name} ගේ ගිණුම සාර්ථකව අනුමත කළා!`, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. 👑 ADMIN USER MANAGEMENT (Approve කළ සහ නොකළ සියලුම ඔෆිසර්ලා ලබාගැනීම)
// ==========================================
router.get('/pending-users', async (req, res) => {
    try {
        // 💡 මෙතනින් { isAdminApproved: false } කෑල්ල අයින් කළා. 
        // දැන් Approve කරපු, නොකරපු ඔක්කොම ඔෆිසර්ලා ලිස්ට් එකේම තියේවි (අලුත් අය උඩටම එන විදිහට).
        const allOfficers = await User.find({ role: 'SUBJECT_OFFICER' }).sort({ createdAt: -1 });
        res.status(200).json(allOfficers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;