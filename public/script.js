const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const log = document.getElementById('log');

let ws;
let recognition;

startBtn.onclick = () => {
    startBtn.disabled = true;
    stopBtn.disabled = false; //stop button is triggred to disbale recording

    ws = new WebSocket("ws://localhost:3000"); //Browser se server ke sath websocket connection open krna 

    ws.onopen = () => logMessage("Connected to server", "client"); // when connection is opened so log is connected server
    ws.onmessage = (event) => {  // jab server se koi reply aata hai JSON format main. agar data.txt hai toh log main print krta ha
        const data = JSON.parse(event.data);
        if (data.text) logMessage(data.text, "bot");
    };
    ws.onclose = () => logMessage("Disconnected from server", "client");

    // Start Speech Recognition (browser built-in)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true; //continously listen when till manually off 
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // only Englih accent

    recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript.trim();
        logMessage(lastResult, "client"); //UI printed client msg
        ws.send(JSON.stringify({ text: lastResult })); //return the server with help of websocket
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
    div.textContent = (type === "client" ? "🗣️ " : "🤖 ") + text; //agr type client 🗣️ prefix karega
    log.appendChild(div); //agr bot ka reply 🤖 prefix karega
    log.scrollTop = log.scrollHeight; //see new auto scrolling 
}
