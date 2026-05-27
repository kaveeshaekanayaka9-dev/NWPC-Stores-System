const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ⚠️ ඔයාගේ User Model එක තියෙන පාර (Path) නිවැරදිද බලන්න

// 🔍 1. Approved නැති (false) සියලුම සබ්ජෙක්ට් ඔෆිසර්ලා ලබාගැනීම
// URL: http://localhost:5000/api/admin/pending-users
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ isAdminApproved: false, role: 'SUBJECT_OFFICER' });
    res.status(200).json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: "දත්ත සෙවීමේදී දෝෂයක් ඇතිවිය.", error: err.message });
  }
});

// 🔓 2. නිලධාරියෙකුව Approve කිරීමේ API එක
// URL: http://localhost:5000/api/admin/approve-user/:id
router.put('/approve-user/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { isAdminApproved: true }, 
      { new: true }
    );
    res.status(200).json({ message: `${updatedUser.name} ව සාර්ථකව අනුමත කරන ලදී!` });
  } catch (err) {
    res.status(500).json({ message: "අනුමත කිරීමේදී දෝෂයක් ඇතිවිය." });
  }
});

module.exports = router;