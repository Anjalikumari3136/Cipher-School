require('dotenv').config();
const axios = require('axios');

async function testGemini() {
    const apiKey = process.env.LLM_API_KEY;
    console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING");

    // Try both v1 and v1beta endpoints with multiple models
    const endpoints = [
        { url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, label: 'v1/gemini-2.0-flash' },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, label: 'v1beta/gemini-2.0-flash' },
        { url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, label: 'v1/gemini-1.5-flash' },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, label: 'v1beta/gemini-1.5-flash' },
        { url: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, label: 'v1/gemini-pro' },
    ];

    for (const ep of endpoints) {
        console.log(`\nTrying: ${ep.label}`);
        try {
            const res = await axios.post(ep.url, {
                contents: [{ parts: [{ text: "Say hello" }] }]
            }, { timeout: 10000 });
            console.log(`✅ SUCCESS! Response:`, res.data.candidates[0].content.parts[0].text.trim());
            return;
        } catch (err) {
            const msg = err.response?.data?.error?.message || err.message;
            console.log(`   ❌ ${err.response?.status || 'NET'}: ${msg.substring(0, 100)}`);
        }
    }

    // Also test: can we LIST models?
    console.log("\n--- Listing available models ---");
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, { timeout: 10000 });
        console.log("Available models:", res.data.models?.map(m => m.name).join(', '));
    } catch (err) {
        console.log("List Error:", err.response?.data?.error?.message || err.message);
    }
}

testGemini();
