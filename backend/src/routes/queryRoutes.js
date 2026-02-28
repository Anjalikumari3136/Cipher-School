const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const hintController = require('../controllers/hintController');
const assignmentController = require('../controllers/assignmentController');
const attemptController = require('../controllers/attemptController');
const { validateSelectOnly } = require('../middlewares/sqlValidator');
const rateLimit = require('express-rate-limit');

// Rate limiting to prevent abuse
const queryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        error: 'Too many queries from this IP, please try again after 15 minutes.'
    }
});

router.post('/execute', queryLimiter, validateSelectOnly, queryController.executeQuery);
router.post('/hint', queryLimiter, hintController.getHint);
router.get('/assignments', assignmentController.getAssignments);
router.post('/attempts', attemptController.saveAttempt);
router.get('/attempts/:id', attemptController.getAttempts);

module.exports = router;
