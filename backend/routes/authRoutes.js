const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 👈 User Model එක

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