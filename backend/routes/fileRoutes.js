const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const File = require('../models/File');

// 📂 uploads ෆෝල්ඩර් එක නැත්නම් සර්වර් එක ස්වයංක්‍රීයවම ඒක සාදයි
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 💾 Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 1. 📥 නව ලිපිගොනුව ඇතුළත් කිරීමේ API එක (POST)
// ==========================================
router.post('/add', upload.single('attachedFile'), async (req, res) => {
  try {
    const { fileNumber, fileName, category, description, submittedBy } = req.body;
    
    // වැදගත්ම දේ: submittedBy හිස් නම් හෝ Invalid නම් එය අතින් හසුරුවන්න
    if (!submittedBy) {
      return res.status(400).json({ message: "SubmittedBy Officer ID is required" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = new File({
      fileNumber,
      fileName,
      category,
      description,
      submittedBy: submittedBy, // මෙතනදී Frontend එකෙන් හරියටම User ID එකම එවන බව සහතික කරගන්න
      fileUrl,
      isVerified: 'PENDING',
      needsReapproval: false
    });

    await newFile.save();
    res.status(201).json({ message: "සාර්ථකයි!" });
  } catch (err) {
    console.error("❌ Backend Error:", err); 
    res.status(500).json({ error: err.message });
  }
});




// ==========================================
// 2. ⏳ සත්‍යාපන පෝලිමේ ඇති ලිපිගොනු ලබාගැනීම (GET)
// ==========================================
router.get('/pending-files', async (req, res) => {
  try {
    // ඩේටාබේස් එකේ 'PENDING' තියෙන ඒවා විතරක් සොයා Admin Dashboard එකට යවයි
    const files = await File.find({ isVerified: 'PENDING', needsReapproval: { $ne: true } });
    res.status(200).json(files);
  } catch (err) {
    console.error("❌ Pending Files Retrieval Error:", err);
    res.status(500).json({ message: "දත්ත ලබාගැනීම අසාර්ථකයි.", error: err.message });
  }
});

// ==========================================
// 3. 📊 සියලුම ලිපිගොනු ලබාගැනීම - Audit සඳහා (GET)
// ==========================================
// 📊 සියලුම ලිපිගොනු ලබාගැනීම - Audit සහ Rack Inventory සඳහා (GET)
// ==========================================
// 3. 📊 සියලුම ලිපිගොනු ලබාගැනීම - Audit සහ Rack Inventory සඳහා (GET)
// ==========================================
// fileRoutes.js
// fileRoutes.js
// routes/fileRoutes.js
router.get('/all-files', async (req, res) => {
  try {
    // 💡 .populate එක ඉවත් කරන්න! දැන් submittedBy යනු Plain String එකකි.
    const files = await File.find(); 
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// my-files රවුට් එකටත් මෙයම කරන්න
// fileRoutes.js
// routes/fileRoutes.js

// නිවැරදි කළ රවුට් එක (Populate අයින් කරන්න)
router.get('/my-files/:email', async (req, res) => {
  try {
    // ID එකක් සොයනවා වෙනුවට කෙලින්ම email එකෙන් සොයන්න
    const myFiles = await File.find({ submittedBy: req.params.email });
    res.status(200).json(myFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. 🗄️ ලිපිගොනුව සත්‍යාපනය කර රාක්ක ගත කිරීම (PUT)
// ==========================================
router.put('/verify-file/:id', async (req, res) => {
  try {
    const { rackNumber, shelfNumber } = req.body;
    
    // ID එකට අදාළ ෆයිල් එක සොයාගෙන එහි දත්ත Update කිරීම
    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      {
        rackNumber: rackNumber,
        shelfNumber: shelfNumber,
        isVerified: 'VERIFIED', // තත්ත්වය VERIFIED ලෙස වෙනස් වේ
        needsReapproval: false
      },
      { new: true } // Update වූ අලුත් දත්ත නැවත ලබාගැනීමට
    );

    if (!updatedFile) {
      return res.status(404).json({ message: "එම ලිපිගොනුව පද්ධතියේ සොයාගත නොහැක." });
    }

    res.status(200).json({ message: "ලිපිගොනුව සාර්ථකව රාක්ක ගත කළා!", updatedFile });
  } catch (err) {
    console.error("❌ File Verification Error:", err);
    res.status(500).json({ message: "රාක්ක වෙන් කිරීම අසාර්ථකයි.", error: err.message });
  }
});

// PUT route to update status to PENDING
router.put('/update-status/:id', async (req, res) => {
  try {
    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { isVerified: 'PENDING', needsReapproval: true }, // status එක PENDING ලෙස වෙනස් කරයි
      { new: true }
    );
    res.status(200).json(updatedFile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update/:id', upload.single('file'), async (req, res) => {
  try {
    const updateData = {
      isVerified: 'PENDING',
      needsReapproval: true
    };

    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "File updated and sent for re-approval", updatedFile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backend (Express route)
router.put('/approve-file/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await File.findByIdAndUpdate(id, { isVerified: 'VERIFIED', needsReapproval: false });
        res.status(200).json({ message: "File approved successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// fileRoutes.js තුළ මෙම රවුට් එක තිබිය යුතුමයි
router.delete('/:id', async (req, res) => {
  try {
    const deletedFile = await File.findByIdAndDelete(req.params.id);
    if (!deletedFile) return res.status(404).json({ message: "File not found" });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ✕ ලිපිගොනුව ප්‍රතික්ෂේප කිරීම (PUT)
// ==========================================
router.put('/reject-file/:id', async (req, res) => {
  try {
    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { isVerified: 'REJECTED', needsReapproval: false }, // තත්ත්වය REJECTED ලෙස වෙනස් වේ
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ message: "එම ලිපිගොනුව පද්ධතියේ සොයාගත නොහැක." });
    }

    res.status(200).json({ message: "ලිපිගොනුව ප්‍රතික්ෂේප කරන ලදී.", updatedFile });
  } catch (err) {
    console.error("❌ File Rejection Error:", err);
    res.status(500).json({ message: "ප්‍රතික්ෂේප කිරීම අසාර්ථකයි.", error: err.message });
  }
});

module.exports = router;
