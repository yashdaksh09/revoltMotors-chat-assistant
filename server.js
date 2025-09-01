require('dotenv').config();
const http = require("http");
const express = require("express");
const { WebSocketServer } = require('ws');  
const { GoogleGenAI } = require("@google/genai");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

app.use(express.static("public"));

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log("✅ Server setup complete. Waiting for connections...");

async function callGeminiWithRetry(userText, retries = 5) {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    for (let i = 0; i < retries; i++) {
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: userText }] }]
            });
            return response;
        } catch (err) {
            if (err.status === 429) {
                const waitTime = (i + 1) * 5000;
                console.log(`⏳ Rate limit hit. Retrying in ${waitTime/1000}s...`);
                await delay(waitTime);
            } else if (err.status === 503) {
                console.log("⚠️ Gemini overloaded. Retrying in 10s...");
                await delay(10000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("❌ Gemini failed after retries");
}

wss.on("connection", (ws) => {
    console.log("🔗 Client connected");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.text) {
                console.log("📝 Client text:", data.text);
                const revoltMotorsPrompt = `You are an expert on Revolt Motors (electric bikes and motorcycles). Answer ONLY about Revolt Motors, their products, specs, and related info. Ignore all other topics. Question: ${data.text}`;
                const response = await callGeminiWithRetry(revoltMotorsPrompt);
                const replyText = response.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response";
                console.log("🤖 Gemini reply:", replyText);
                ws.send(JSON.stringify({ text: replyText }));
            }
        } catch (err) {
            console.error("❌ Error handling message:", err);
            ws.send(JSON.stringify({ error: "Processing failed" }));
        }
    });

    ws.on("close", () => console.log("❌ Client disconnected"));
    ws.on("error", (err) => console.error("⚠️ WebSocket Error", err));
});

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
