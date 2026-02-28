const { executeSQL } = require('../config/db');

/**
 * Executes a user-provided SQL query against the SQLite sandbox.
 */
exports.executeQuery = async (req, res) => {
    const { query } = req.body;

    try {
        const result = executeSQL(query);

        res.json({
            success: true,
            data: result.rows,
            fields: result.fields.map(f => f.name),
            rowCount: result.rowCount
        });
    } catch (err) {
        // We return the database error to the user as it helps in learning SQL.
        console.error('Query Execution Error:', err.message);
        res.status(400).json({
            success: false,
            error: err.message,
            hint: 'Check your syntax or table names.'
        });
    }
};
