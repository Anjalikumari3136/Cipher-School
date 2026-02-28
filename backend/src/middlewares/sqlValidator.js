/**
 * Validates that the query is a SELECT query and doesn't contain destructive commands.
 */
const validateSelectOnly = (req, res, next) => {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Query is empty. Please write a SELECT statement.' });
    }

    const normalizedQuery = query.trim().toUpperCase();

    // Remove comments to check the actual command
    const queryWithoutComments = query.replace(/--.*$/gm, '').trim().toUpperCase();

    if (queryWithoutComments.length === 0) {
        return res.status(400).json({ success: false, error: 'Query contains only comments. Please write a SELECT statement.' });
    }

    const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];

    // Check if it contains SELECT
    if (!queryWithoutComments.includes('SELECT')) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden: Only SELECT queries are allowed. Your query must perform a data retrieval.'
        });
    }

    // Check for destructive keywords
    const containsForbidden = forbiddenKeywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(queryWithoutComments);
    });

    if (containsForbidden) {
        return res.status(403).json({
            success: false,
            error: 'Security Alert: Destructive SQL commands (DROP, DELETE, etc.) are blocked.'
        });
    }

    next();
};

module.exports = { validateSelectOnly };
