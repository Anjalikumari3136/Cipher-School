const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Placeholder for auth
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    query: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    executionTime: { type: Number }, // in ms
    feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
