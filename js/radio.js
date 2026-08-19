/* 🎧 DARKAIS WEB RADIO — AUDIO ENGINE & GENERATIVE 303 ACID SYNTH */

const STATIONS = [
    {
        id: "techno",
        name: "Berlin Underground Dark Techno",
        sub: "140 BPM • Industrial & Acid Drops",
        streamUrl: "https://ice1.somafm.com/defcon-128-mp3",
        mode: "stream"
    },
    {
        id: "acid",
        name: "90s Acid Rave & Hardcore",
        sub: "150 BPM • TB-303 Resonance & Breakbeats",
        streamUrl: "https://ice2.somafm.com/secretagent-128-mp3",
        mode: "stream"
    },
    {
        id: "darksynth",
        name: "Cyberpunk Darksynth & Midtempo",
        sub: "115 BPM • Dystopian Bass & Heavy Reeses",
        streamUrl: "https://ice4.somafm.com/spacestation-128-mp3",
        mode: "stream"
    },
    {
        id: "psytrance",
        name: "Dark Psytrance & Forest Goa",
        sub: "148 BPM • Hypnotic Frequency Modulation",
        streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
        mode: "stream"
    },
    {
        id: "procedural",
        name: "⚡ DarkAIs Procedural AI-303 Engine",
        sub: "Algorithmic Real-Time Browser Synthesis",
        streamUrl: null,
        mode: "synth"
    }
];

let currentStationIdx = 0;
let isPlaying = false;
let audioEl = new Audio();
audioEl.crossOrigin = "anonymous";

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let isVisualizerHooked = false;

let visMode = 'bars'; // 'bars', 'wave', 'circle'

// ── 1. PROCEDURAL 303 SYNTH & 909 DRUM ENGINE ─────────────────────────────
let synthInterval = null;
let synthStep = 0;
let synthBpm = 140;
let synthResonance = 14;
let synthCutoff = 800;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function play303Note(freq, time) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(synthCutoff, time);
    filter.frequency.exponentialRampToValueAtTime(synthCutoff * 3, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(synthCutoff * 0.4, time + 0.18);
    filter.Q.setValueAtTime(synthResonance, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.22);
}

function play909Kick(time) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.09);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
}

function startProceduralSynth() {
    stopProceduralSynth();
    initAudioContext();
    const scale = [65.41, 77.78, 87.31, 98.00, 116.54, 130.81, 155.56, 174.61]; // C Minor Pentatonic / Acid
    const stepDuration = (60 / synthBpm) / 4; // 16th notes

    synthInterval = setInterval(() => {
        const now = audioCtx.currentTime;
        if (synthStep % 4 === 0) play909Kick(now); // 4-on-the-floor Kick
        if (Math.random() > 0.2) {
            const f = scale[Math.floor(Math.random() * scale.length)];
            play303Note(f, now);
        }
        synthStep = (synthStep + 1) % 16;
    }, stepDuration * 1000);
}

function stopProceduralSynth() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

// ── 2. RADIO STREAM PLAYBACK ───────────────────────────────────────────────
function playStation(idx) {
    currentStationIdx = idx;
    const station = STATIONS[idx];
    initAudioContext();

    document.getElementById('trackTitle').innerText = station.name;
    document.getElementById('trackSubtitle').innerText = station.sub;
    document.querySelectorAll('.station-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });

    if (station.mode === 'synth') {
        audioEl.pause();
        startProceduralSynth();
        isPlaying = true;
    } else {
        stopProceduralSynth();
        audioEl.src = station.streamUrl;
        audioEl.play().catch(e => console.log('Audio playback waiting for interaction'));
        isPlaying = true;

        if (!isVisualizerHooked && audioCtx) {
            try {
                sourceNode = audioCtx.createMediaElementSource(audioEl);
                sourceNode.connect(analyser);
                analyser.connect(audioCtx.destination);
                isVisualizerHooked = true;
            } catch(e) { console.log('Visualizer already connected'); }
        }
    }

    updatePlayButton();
}

function togglePlay() {
    initAudioContext();
    if (isPlaying) {
        audioEl.pause();
        stopProceduralSynth();
        isPlaying = false;
    } else {
        playStation(currentStationIdx);
    }
    updatePlayButton();
}

function updatePlayButton() {
    const btn = document.getElementById('playBtnLarge');
    if (btn) {
        btn.innerText = isPlaying ? '❚❚' : '▶';
        btn.classList.toggle('playing', isPlaying);
    }
}

// ── 3. REALTIME CANVAS VISUALIZER ─────────────────────────────────────────
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!analyser || !isPlaying) {
        // Idle animation
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.font = '13px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('DARKAIS PROTOCOL IDLE // PRESS PLAY TO ENGAGE AUDIO SPECTRUM', canvas.width / 2, canvas.height / 2);
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (visMode === 'bars') {
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#00F0FF');
            gradient.addColorStop(0.5, '#A855F7');
            gradient.addColorStop(1, '#39FF14');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    } else if (visMode === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 12;
        ctx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (canvas.height / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// ── 4. LIVE CYBER RAVE CHAT SIMULATION ─────────────────────────────────────
const CHAT_USERS = ["CyberAcid", "BerlinRauser", "NeonValkyrie", "DarkAIs_Agent", "SubZero_909", "Resonance303", "NullPointer", "GlitchMatrix"];
const CHAT_MESSAGES = [
    "That 303 acid drop is pure filth! 🔥",
    "Tuning in from Athens dark lab ⚡",
    "140 BPM rolling sub bass locked in",
    "DarkAIs radio running in background while building AI agents",
    "Acid sweep resonance to the max ☣️",
    "Pure warehouse energy 🌌",
    "Protocol verified: 342 listeners online"
];

function spawnChatMessage() {
    const box = document.getElementById('chatLogBox');
    if (!box) return;
    const user = CHAT_USERS[Math.floor(Math.random() * CHAT_USERS.length)];
    const msg = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const el = document.createElement('div');
    el.className = 'chat-msg';
    el.innerHTML = `<span class="chat-time">${time}</span><span class="chat-user">${user}:</span> ${msg}`;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
}

// ── 5. RECORDING CLIP TO DOWNLOAD ──────────────────────────────────────────
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

function toggleRecord() {
    const btn = document.getElementById('recordBtn');
    if (!isRecording) {
        initAudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        analyser.connect(dest);

        mediaRecorder = new MediaRecorder(dest.stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DarkAIs_Rave_Clip_${Date.now()}.webm`;
            a.click();
        };
        mediaRecorder.start();
        isRecording = true;
        btn.classList.add('recording');
        btn.innerText = '⏹ STOP REC';
    } else {
        mediaRecorder.stop();
        isRecording = false;
        btn.classList.remove('recording');
        btn.innerText = '🔴 REC CLIP';
    }
}

// ── INITIALIZATION ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Volume Control
    const vol = document.getElementById('volumeSlider');
    if (vol) {
        vol.addEventListener('input', (e) => {
            audioEl.volume = parseFloat(e.target.value);
        });
    }

    // Synth Knobs
    const bpmSlider = document.getElementById('synthBpm');
    if (bpmSlider) {
        bpmSlider.addEventListener('input', (e) => {
            synthBpm = parseInt(e.target.value);
            document.getElementById('bpmDisplay').innerText = synthBpm;
            if (synthInterval) startProceduralSynth();
        });
    }

    const cutSlider = document.getElementById('synthCutoff');
    if (cutSlider) {
        cutSlider.addEventListener('input', (e) => {
            synthCutoff = parseFloat(e.target.value);
        });
    }

    // Visualizer Pills
    document.querySelectorAll('.vis-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.vis-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            visMode = pill.dataset.mode;
        });
    });

    // Chat Interval
    setInterval(spawnChatMessage, 4500);

    // Canvas render loop
    renderVisualizer();
});
