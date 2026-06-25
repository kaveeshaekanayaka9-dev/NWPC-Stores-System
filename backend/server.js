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

const { protect } = require('./middleware/authMiddleware');

// APIs සම්බන්ධ කිරීම
app.use('/api/auth', authRoutes); 
app.use('/api/files', protect, fileRoutes); 
app.use('/api/admin', protect, adminRoutes);
app.use('/api/reports', protect, reportRoutes);
app.use('/api/notifications', protect, notificationRoutes);


// Rack logic route
app.get('/api/racks/:rackNumber', async (req, res) => {
    try {
        const { rackNumber } = req.params;
        
        // Normalize rackNumber - check for "Rack 01" vs "1"
        let searchRacks = [rackNumber];
        if (rackNumber.toLowerCase().startsWith('rack ')) {
            const numStr = rackNumber.split(' ')[1]; // "01", "02"
            searchRacks.push(parseInt(numStr, 10).toString()); // "1", "2"
            searchRacks.push(numStr); // "01"
        } else if (!isNaN(parseInt(rackNumber))) {
            const num = parseInt(rackNumber, 10);
            searchRacks.push(`Rack ${num < 10 ? '0' + num : num}`);
            searchRacks.push(num.toString());
        }

        const files = await File.find({ 
            rackNumber: { $in: searchRacks },
            isVerified: 'VERIFIED'
        });

        const rackLayout = {
            'Shelf 08': Array.from({ length: 24 }, () => []),
            'Shelf 07': Array.from({ length: 24 }, () => []),
            'Shelf 06': Array.from({ length: 24 }, () => []),
            'Shelf 05': Array.from({ length: 24 }, () => []),
            'Shelf 04': Array.from({ length: 24 }, () => []),
            'Shelf 03': Array.from({ length: 24 }, () => []),
            'Shelf 02': Array.from({ length: 24 }, () => []),
            'Shelf 01': Array.from({ length: 24 }, () => [])
        };

        files.forEach(file => {
            let normalizedShelf = file.shelfNumber || '';
            
            if (rackLayout[normalizedShelf] && file.adNumber) {
                const adIndex = parseInt(file.adNumber, 10) - 1;
                if (adIndex >= 0 && adIndex < 24) {
                    rackLayout[normalizedShelf][adIndex].push(file);
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

app.post('/api/audit-logs/add', async (req, res) => {
    try {
        const { officerId, action, fileName } = req.body;
        const newLog = new AuditLog({
            officerId,
            action,
            fileName,
            timestamp: new Date()
        });
        await newLog.save();
        res.status(201).json({ message: "Audit log added successfully" });
    } catch (err) {
        console.error("Failed to add audit log:", err);
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