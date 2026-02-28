const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');

exports.saveAttempt = async (req, res) => {
    const { assignmentId, query, isCorrect } = req.body;

    try {
        const attempt = new Attempt({
            assignmentId,
            query,
            isCorrect,
            timestamp: new Date()
        });

        await attempt.save();
        res.json({ success: true, message: "Attempt saved!" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to save attempt" });
    }
};

exports.getAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ assignmentId: req.params.id }).sort({ timestamp: -1 });
        res.json({ success: true, data: attempts });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
};
