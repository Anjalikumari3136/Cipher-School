const { generateHintPrompt } = require('../utils/promptTemplate');
const axios = require('axios');

// Smart Local Hint Engine - works without any API
const getSmartHint = (query, context) => {
    const q = (query || "").trim().toUpperCase();
    const question = (context?.question || "").toLowerCase();
    const schema = context?.schema || {};
    const tables = Object.keys(schema);
    const tableName = tables[0] || "table";
    const columns = schema[tableName] || [];

    // No query written yet
    if (!q || q === '--' || q.startsWith('-- TYPE')) {
        return `🎯 Start with: \`SELECT * FROM ${tableName};\` — this will show you all the data in the table. From there you can refine your query.`;
    }

    // Missing SELECT
    if (!q.includes('SELECT')) {
        return "📝 Every data retrieval query must start with **SELECT**. Example: `SELECT column_name FROM table_name;`";
    }

    // Missing FROM
    if (!q.includes('FROM')) {
        return `📝 You need to tell SQL *where* to look. Add **FROM ${tableName}** after your SELECT columns.`;
    }

    // Wrong table name
    const hasCorrectTable = tables.some(t => q.includes(t.toUpperCase()));
    if (!hasCorrectTable && tables.length > 0) {
        return `🔍 Check your table name. The available table is: **${tableName}**. Column names are: ${columns.join(', ')}.`;
    }

    // Question asks for filtering but no WHERE
    if ((question.includes('older') || question.includes('age') || question.includes('filter') || question.includes('where')) && !q.includes('WHERE')) {
        return "🎯 This challenge requires filtering! Use the **WHERE** clause. Example: `SELECT * FROM students WHERE age > 18;`";
    }

    // Question asks for specific columns but user uses *
    if ((question.includes('only') || question.includes('specific')) && q.includes('*')) {
        const suggestedCols = columns.filter(c => question.includes(c.toLowerCase()));
        if (suggestedCols.length > 0) {
            return `🎯 Instead of \`SELECT *\`, try selecting specific columns: \`SELECT ${suggestedCols.join(', ')} FROM ${tableName};\``;
        }
        return `🎯 The challenge asks for specific columns, not all. Replace \`*\` with the column names you need: ${columns.join(', ')}`;
    }

    // Missing semicolon
    if (!q.endsWith(';')) {
        return "💡 Don't forget to end your SQL query with a semicolon (;)!";
    }

    // Generic helpful hint
    return `💡 Your query looks close! Double-check: Does your output match what the challenge asks? Available columns: **${columns.join(', ')}**`;
};

exports.getHint = async (req, res) => {
    const { query, assignmentContext } = req.body;
    const apiKey = (process.env.LLM_API_KEY || "").trim();

    console.log('Hint requested. API Key:', apiKey ? 'Present' : 'Missing');

    try {
        if (!assignmentContext) {
            return res.status(400).json({ success: false, error: "Missing assignment context." });
        }

        // Try Gemini API via Axios (more reliable than SDK)
        if (apiKey && apiKey.length > 10) {
            try {
                const prompt = generateHintPrompt(
                    assignmentContext.schema || "No schema",
                    assignmentContext.question,
                    query || "Empty query"
                );

                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await axios.post(url, {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });

                const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    console.log('✅ Gemini API hint generated!');
                    return res.json({ success: true, hint: text.trim() });
                }
            } catch (apiErr) {
                console.warn('Gemini API unavailable, using Smart Hints:', apiErr.response?.data?.error?.message || apiErr.message);
            }
        }

        // Fallback: Smart Local Hints (always works)
        const hint = getSmartHint(query, assignmentContext);
        console.log('Using Smart Local Hint');
        return res.json({ success: true, hint });

    } catch (err) {
        console.error('Hint error:', err.message);
        res.status(500).json({ success: false, error: "Failed to generate hint." });
    }
};
