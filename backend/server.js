const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const dotenv = require('dotenv');

// Routes imports
const fileRoutes = require('./routes/fileRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes');




// Models
const File = require('./models/File'); 
const AuditLog = require('./models/AuditLog'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // CORS අවසරය ලබාදීම
app.use(express.json()); // JSON දත්ත සැකසීම

// APIs සම්බන්ධ කිරීම
app.use('/api/auth', authRoutes); 
app.use('/api/files', fileRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);


// Rack logic route
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

        files.forEach(file => {
            if (rackLayout[file.shelfNumber]) {
                const currentShelfSlots = rackLayout[file.shelfNumber];
                const nextEmptyIndex = currentShelfSlots.indexOf(0);
                if (nextEmptyIndex !== -1) {
                    rackLayout[file.shelfNumber][nextEmptyIndex] = 1;
                }
            }
        });
        res.json(rackLayout);
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update file route
app.put('/api/files/:id', async (req, res) => {
    try {
        const updatedFile = await File.findByIdAndUpdate(
            req.params.id, 
            { 
                ...req.body, 
                isVerified: 'PENDING',
                needsReapproval: true,
                status: 'Pending' 
            }, 
            { new: true }
        );
        res.json({ message: "File updated and sent for re-approval", updatedFile });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// Backend: routes/auditRoutes.js හෝ server.js
app.get('/api/audit-logs/:email', async (req, res) => {
    try {
        const logs = await AuditLog.find({ officerId: req.params.email }).sort({ timestamp: -1 });
        console.log("Database එකෙන් ලැබුණු ලොග්ස්:", logs); // මෙය ටර්මිනලයේ බලන්න
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Provincial Council Store Management Server is Running...');
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nwpc_stores';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('💡 Connected to MongoDB Successfully!');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database connection error:', err);
    });