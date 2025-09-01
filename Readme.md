# Revolt Motors Voice Assistant

A simple voice assistant for **Revolt Motors** using **Google Gemini Live API**.  
It only provides answers related to **Revolt Motors**, ideal for demos, FAQs, or interactive voice support.

---

# Features
- Real-time voice chat in browser
- Only answers **Revolt Motors** related queries
- Low-latency audio playback
- Easy setup for anyone

---

# 🛠 Quick Setup

# 1. Clone the repository
```bash
git clone https://github.com/yashdaksh09/revoltMotors-chat-assistant.git
cd revoltMotors-chat-assistant


# Install dependencies
npm install

#3. Configure environment

#Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=tokyo-nomad-470810-n6-08f48d163438.json
GEMINI_MODEL=gemini-2.5-flash-preview-native-audio-dialog
PORT=3000

#Important: Do not push .env or your JSON credentials to GitHub.

# Run the server
node server.js

# Open the client

Go to http://localhost:3000
# and click Start Talking.
# Speak to the assistant — it will respond only with Revolt Motors information.

# Notes

The bot is Revolt Motors-specific: unrelated questions will be ignored.

Audio from browser is automatically converted for Gemini Live processing.

Node 18+ recommended.

# Add the following to .gitignore to avoid pushing secrets:
node_modules/
.env
tokyo-nomad-470810-n6-08f48d163438.json