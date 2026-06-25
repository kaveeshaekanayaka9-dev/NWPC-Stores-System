const express = require('express'); // 1. express import කරන්න
const router = express.Router();    // 2. router එක create කරන්න
const File = require('../models/File'); // 3. ඔබේ File model එක අනිවාර්යයි

// දැන් ඔබේ රවුට් එක මෙසේ ලියන්න:
router.get('/chart-data', async (req, res) => {
    try {
        console.log("Chart data request received!"); // මෙය ලොග් වේදැයි බලන්න
        
        // Fix: Group strictly by rackNumber so we don't get duplicate rack labels in the bar chart
        const rackStats = await File.aggregate([
            { $group: { _id: "$rackNumber", count: { $sum: 1 } } }
        ]);

        const statusStats = await File.aggregate([
            { $group: { _id: "$isVerified", count: { $sum: 1 } } }
        ]);

        // New: Group files by year for the Doughnut chart (replaces category)
        const yearStats = await File.aggregate([
            { $group: { _id: "$year", count: { $sum: 1 } } }
        ]);

        res.json({ rackStats, statusStats, yearStats });
    } catch (err) {
        console.error("DEBUG ERROR:", err); // වැදගත්ම කොටස: දෝෂය හරියටම පෙන්වයි
        res.status(500).json({ error: "Server error occurred", details: err.message });
    }
});

module.exports = router; // 4. router එක export කරන්න අමතක නොකරන්න