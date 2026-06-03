const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const fileRoutes = require('./routes/fileRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); // 👈 1. මේ අලුත් පේළිය මෙතනට එකතු කරන්න!
// ... අනෙක් imports ටික...
const File = require('./models/File'); // 👈 අනිවාර්යයෙන්ම මේ පේළිය දාන්න! 
// (ඔබේ File.js ෆයිල් එක තියෙන්නේ models ෆෝල්ඩර් එකේ නම් මෙය නිවැරදියි)
// .env ෆයිල් එකේ තියෙන දත්ත කියවීමට
dotenv.config();

const app = express();

// Middleware (ෆ්‍රොන්ටෙන්ඩ් එකයි බැක්එන්ඩ් එකයි ලේසියෙන් සම්බන්ධ කරන්න)
app.use(cors());
app.use(express.json()); // React එකෙන් එන JSON දත්ත කියවන්න මේක අනිවාර්යයි!

// APIs සම්බන්ධ කිරීම
app.use('/api/auth', authRoutes); 
app.use('/api/files', fileRoutes); 
app.use('/api/admin', adminRoutes); // 👈 2. මෙන්න මේ පේළිය අනිවාර්යයෙන්ම එකතු කරන්න! (දැන් /api/admin/pending-users වැඩ කරාවි)

// Express රවුටර් එක මෙන්න:
app.get('/api/racks/:rackNumber', async (req, res) => {
    try {
        const { rackNumber } = req.params;
        const files = await File.find({ rackNumber: rackNumber });

        const rackLayout = {
            'shelf 04': Array(8).fill(0),
            'shelf 03': Array(8).fill(0),
            'shelf 02': Array(8).fill(0),
            'shelf 01': Array(8).fill(0)
        };

        // එක් එක් තට්ටුවට (Shelf) ෆයිල්ස් කීයක් තිබේදැයි ගණනය කරමු
        files.forEach(file => {
            if (rackLayout[file.shelfNumber]) {
                // එම තට්ටුවේ දැනට පිරී ඇති ස්ලොට් ගණන සොයමු
                const currentShelfSlots = rackLayout[file.shelfNumber];
                const nextEmptyIndex = currentShelfSlots.indexOf(0); // මුලින්ම හමුවන හිස් ස්ලොට් එක
                
                if (nextEmptyIndex !== -1) {
                    rackLayout[file.shelfNumber][nextEmptyIndex] = 1; // පිරවුණා!
                }
            }
        });

        res.json(rackLayout);
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.put('/api/files/:id', async (req, res) => {
    try {
        // දත්ත යාවත්කාලීන කරන අතරතුර status එක 'Pending' ලෙස වෙනස් කරන්න
        const updatedFile = await File.findByIdAndUpdate(
            req.params.id, 
            { 
                ...req.body, 
                isVerified: 'PENDING',
                needsReapproval: true,
                status: 'Pending' // මෙන්න මෙතැනදී status එක වෙනස් වේ
            }, 
            { new: true }
        );
        res.json({ message: "File updated and sent for re-approval", updatedFile });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// සර්වර් එක වැඩද කියලා බ්‍රවුසර් එකෙන් බලන්න සරල රවුට් එකක්
app.get('/', (req, res) => {
    res.send('Provincial Council Store Management Server is Running...');
});
// uploads ෆෝල්ඩර් එක ඇතුළේ තියෙන ෆයිල් කෙලින්ම URL එකෙන් බලන්න පුළුවන් කරන්න
app.use('/uploads', express.static('uploads'));

// MongoDB Database එක කනෙක්ට් කිරීම
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nwpc_stores';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('💡 Connected to MongoDB Successfully!');
        // ඩේටාබේස් එක කනෙක්ට් වුණාට පස්සේ සර්වර් එක ස්ටාර්ට් කිරීම
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
    });
