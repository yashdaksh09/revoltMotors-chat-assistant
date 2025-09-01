const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const log = document.getElementById('log');

let ws;
let recognition;

startBtn.onclick = () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;

    ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => logMessage("Connected to server", "client");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text) logMessage(data.text, "bot");
    };
    ws.onclose = () => logMessage("Disconnected from server", "client");

    // Start Speech Recognition (browser built-in)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript.trim();
        logMessage(lastResult, "client");
        ws.send(JSON.stringify({ text: lastResult }));
    };

    recognition.onend = () => {
        logMessage("🎤 Listening stopped", "client");
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };

    recognition.start();
    logMessage("🎤 Listening started...", "client");
};

stopBtn.onclick = () => {
    recognition.stop();
};
 
function logMessage(text, type) {
    const div = document.createElement("div");
    div.className = type;
    div.textContent = (type === "client" ? "🗣️ " : "🤖 ") + text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}
