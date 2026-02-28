const Assignment = require('../models/Assignment');

exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ order: 1 });
        res.json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch assignments" });
    }
};
