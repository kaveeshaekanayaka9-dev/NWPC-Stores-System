const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const fileRoutes = require('./routes/fileRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); // 👈 1. මේ අලුත් පේළිය මෙතනට එකතු කරන්න!

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