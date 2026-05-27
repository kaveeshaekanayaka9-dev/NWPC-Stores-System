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
    
    if (!req.file) {
      return res.status(400).json({ message: "කරුණාකර භෞතික ලිපිගොනුව (File) අප්ලෝඩ් කරන්න." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = new File({
      fileNumber,
      fileName,
      category,
      description,
      submittedBy,
      fileUrl,
      isVerified: 'PENDING' // 👈 Default එකක් ලෙස PENDING තත්ත්වයෙන් සේව් වේ
    });

    await newFile.save();
    res.status(201).json({ message: "ලිපිගොනුව සාර්ථකව පද්ධතියට ඇතුළත් කළා!" });
  } catch (err) {
    console.error("❌ Backend File Upload Error:", err); 
    res.status(500).json({ 
      message: "ඇතුළත් කිරීම අසාර්ථකයි. (File Number එක දැනටමත් පද්ධතියේ තිබිය හැක)", 
      error: err.message 
    });
  }
});

// ==========================================
// 2. ⏳ සත්‍යාපන පෝලිමේ ඇති ලිපිගොනු ලබාගැනීම (GET)
// ==========================================
router.get('/pending-files', async (req, res) => {
  try {
    // ඩේටාබේස් එකේ 'PENDING' තියෙන ඒවා විතරක් සොයා Admin Dashboard එකට යවයි
    const files = await File.find({ isVerified: 'PENDING' });
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
router.get('/all-files', async (req, res) => {
  try {
    // 💡 .populate එක අයින් කළා, මොකද submittedBy කියන්නේ කෙලින්ම Email String එකක් නිසා
    const files = await File.find();
    res.status(200).json(files);
  } catch (err) {
    console.error("❌ All Files Retrieval Error:", err);
    res.status(500).json({ message: "සියලුම දත්ත ලබාගැනීම අසාර්ථකයි.", error: err.message });
  }
});

// ==========================================
// 6. 👤 ලොග් වී සිටින නිලධාරියාගේ ලිපිගොනු පමණක් ලබාගැනීම (GET)
// ==========================================
// ==========================================
// 6. 👤 ලොග් වී සිටින නිලධාරියාගේ ලිපිගොනු පමණක් ලබාගැනීම (GET)
// ==========================================
router.get('/my-files/:officerId', async (req, res) => {
  try {
    // ඩේටාබේස් එකේ submittedBy එකට කෙලින්ම Officer ID එක ගැලපෙන ඒවා සොයයි
    const myFiles = await File.find({ submittedBy: req.params.officerId });
    res.status(200).json(myFiles);
  } catch (err) {
    console.error("❌ My Files Retrieval Error:", err);
    res.status(500).json({ message: "පෞද්ගලික දත්ත ලබාගැනීම අසාර්ථකයි.", error: err.message });
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
        isVerified: 'VERIFIED' // තත්ත්වය VERIFIED ලෙස වෙනස් වේ
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

// ==========================================
// 5. ✕ ලිපිගොනුව ප්‍රතික්ෂේප කිරීම (PUT)
// ==========================================
router.put('/reject-file/:id', async (req, res) => {
  try {
    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { isVerified: 'REJECTED' }, // තත්ත්වය REJECTED ලෙස වෙනස් වේ
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