/**
 * Utility to sanitize user input if needed, 
 * although parameterized queries are the primary defense.
 */
exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    // Basic cleanup - remove problematic characters if not using parameters
    return input.replace(/['";]/g, '');
};
