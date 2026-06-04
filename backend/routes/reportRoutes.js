const express = require('express'); // 1. express import කරන්න
const router = express.Router();    // 2. router එක create කරන්න
const File = require('../models/File'); // 3. ඔබේ File model එක අනිවාර්යයි

// දැන් ඔබේ රවුට් එක මෙසේ ලියන්න:
router.get('/chart-data', async (req, res) => {
    try {
        console.log("Chart data request received!"); // මෙය ලොග් වේදැයි බලන්න
        
        const rackStats = await File.aggregate([
            { $group: { _id: { rack: "$rackNumber", category: "$category" }, count: { $sum: 1 } } }
        ]);

        const statusStats = await File.aggregate([
            { $group: { _id: "$isVerified", count: { $sum: 1 } } }
        ]);

        res.json({ rackStats, statusStats });
    } catch (err) {
        console.error("DEBUG ERROR:", err); // වැදගත්ම කොටස: දෝෂය හරියටම පෙන්වයි
        res.status(500).json({ error: "Server error occurred", details: err.message });
    }
});

module.exports = router; // 4. router එක export කරන්න අමතක නොකරන්න