const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    expectedSchema: { type: Object, required: true }, // Table structures
    solutionQuery: { type: String, required: true }, // For internal validation
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
