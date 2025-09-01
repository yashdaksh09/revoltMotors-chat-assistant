require('dotenv').config();
const http = require("http");
const express = require("express");
const { WebSocketServer } = require('ws');  // this is connect to realtime communicate to client or server 
const { GoogleGenAI } = require("@google/genai"); // use of AI model interact / import SDK

const app = express();
const server = http.createServer(app); //integrate with Node.js HTTP server
const wss = new WebSocketServer({ server }); // same use of websocket
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
                contents: [
                    { role: "user", //user input
                      parts: [{ text: userText }] }] //parts:  Actual message  send to AI
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
    throw new Error("❌ Gemini failed after retries"); //if after retries so throw the error msg
}

wss.on("connection", (ws) => { //jab client websocket se connect hoga toh yeh call hoga
    console.log("🔗 Client connected");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message); //msg JSON Parse because frontend send JSON data
            if (data.text) { //if text field 
                console.log("📝 Client text:", data.text);
                const revoltMotorsPrompt = `You are an expert on Revolt Motors (electric bikes and motorcycles). Answer ONLY about Revolt Motors, their products, specs, and related info. Ignore all other topics.Reply in the same language as the question. Question: ${data.text}`;// field modify only share Revolt motors give the answer
                
                const response = await callGeminiWithRetry(revoltMotorsPrompt); // only response send Revolt Motors related
                const replyText = response.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response";
                console.log("🤖 Gemini reply:", replyText);// response stored in variable then console.log respose.
                ws.send(JSON.stringify({ text: replyText }));
            }
        } catch (err) { // if any error occur so catch block execute instantly
            console.error("❌ Error handling message:", err);
            ws.send(JSON.stringify({ error: "Processing failed" }));
        }
    });

    ws.on("close", () => console.log("❌ Client disconnected"));
    ws.on("error", (err) => console.error("⚠️ WebSocket Error", err));
});

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`)); //server listing to port
