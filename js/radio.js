/* 🎧 DARKAIS WEB RADIO — UPGRADED AUDIO ENGINE & PROCEDURAL ACID GROOVEBOX */

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
        sub: "Evolving 16-Step Acid Riffs + Full 909 Drum Kit",
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

let delayNode = null;
let distortionNode = null;
let masterGain = null;

let visMode = 'bars'; // 'bars', 'wave'

// ── 1. PROCEDURAL 303 ACID + 909 DRUM SEQUENCER ──────────────────────────
let synthInterval = null;
let synthStep = 0;
let totalStepsPlayed = 0;
let synthBpm = 140;
let synthResonance = 18;
let synthCutoff = 1100;
let synthDrive = 20;

// Scales (D Minor Acid / Phrygian)
const ACID_SCALE = [
    73.42,  // D2
    77.78,  // D#2
    87.31,  // F2
    98.00,  // G2
    110.00, // A2
    116.54, // A#2
    130.81, // C3
    146.83, // D3
    155.56, // D#3
    174.61, // F3
    196.00, // G3
    220.00, // A3
    261.63, // C4
    293.66  // D4
];

// Current 16-step Acid Pattern: { freq, isAccent, isSlide, isRest }
let currentPattern = [];

function generateNewAcidPattern() {
    currentPattern = [];
    for (let i = 0; i < 16; i++) {
        const isRest = Math.random() < 0.15 && (i % 4 !== 0);
        const freq = ACID_SCALE[Math.floor(Math.random() * ACID_SCALE.length)];
        const isAccent = Math.random() < 0.35 || (i % 4 === 0);
        const isSlide = Math.random() < 0.25 && i > 0;
        currentPattern.push({ freq, isAccent, isSlide, isRest });
    }
}
generateNewAcidPattern();

function mutatePattern() {
    // Modify 2-3 random steps to keep the groove evolving
    for (let k = 0; k < 3; k++) {
        const idx = Math.floor(Math.random() * 16);
        currentPattern[idx].freq = ACID_SCALE[Math.floor(Math.random() * ACID_SCALE.length)];
        currentPattern[idx].isAccent = Math.random() < 0.4;
        currentPattern[idx].isSlide = Math.random() < 0.3;
    }
}

function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 20;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);

        // Saturation / Distortion
        distortionNode = audioCtx.createWaveShaper();
        distortionNode.curve = makeDistortionCurve(synthDrive);
        distortionNode.oversample = '4x';

        // Ping-Pong Delay
        delayNode = audioCtx.createDelay();
        delayNode.delayTime.value = (60 / synthBpm) * 0.75; // 3/16th dotted delay
        const delayFeedback = audioCtx.createGain();
        delayFeedback.gain.value = 0.35;
        const delayFilter = audioCtx.createBiquadFilter();
        delayFilter.frequency.value = 2500;

        delayNode.connect(delayFilter);
        delayFilter.connect(delayFeedback);
        delayFeedback.connect(delayNode);
        delayFilter.connect(masterGain);

        distortionNode.connect(masterGain);
        distortionNode.connect(delayNode);

        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ── 303 SYNTH VOICE WITH SQUELCH FILTER ──────────────────────────────────
let prevFreq = 73.42;

function play303Step(stepData, time) {
    if (!audioCtx || stepData.isRest) return;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = Math.random() > 0.4 ? 'sawtooth' : 'square';
    
    // Slide (Portamento)
    if (stepData.isSlide) {
        osc.frequency.setValueAtTime(prevFreq, time);
        osc.frequency.exponentialRampToValueAtTime(stepData.freq, time + 0.08);
    } else {
        osc.frequency.setValueAtTime(stepData.freq, time);
    }
    prevFreq = stepData.freq;

    // Resonant Filter Envelope
    filter.type = 'lowpass';
    const baseCut = synthCutoff * (stepData.isAccent ? 1.6 : 1.0);
    filter.frequency.setValueAtTime(baseCut * 0.5, time);
    filter.frequency.exponentialRampToValueAtTime(baseCut * (stepData.isAccent ? 3.5 : 2.2), time + 0.04);
    filter.frequency.exponentialRampToValueAtTime(baseCut * 0.3, time + (stepData.isSlide ? 0.24 : 0.14));
    filter.Q.setValueAtTime(synthResonance * (stepData.isAccent ? 1.3 : 1.0), time);

    const amp = stepData.isAccent ? 0.32 : 0.22;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (stepData.isSlide ? 0.22 : 0.15));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(distortionNode);

    osc.start(time);
    osc.stop(time + 0.25);
}

// ── 909 DRUM VOICES ──────────────────────────────────────────────────────
function play909Kick(time) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.07);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + 0.26);
}

function play909HiHat(time, isOpen) {
    if (!audioCtx) return;
    // White Noise buffer for crisp metallic hat
    const bufferSize = audioCtx.sampleRate * (isOpen ? 0.18 : 0.04);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.25 : 0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isOpen ? 0.16 : 0.035));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(time);
    noise.stop(time + (isOpen ? 0.18 : 0.04));
}

function play909Clap(time) {
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.16;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2.5;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(time);
    noise.stop(time + 0.16);
}

// ── GROOVEBOX SEQUENCER LOOP ─────────────────────────────────────────────
function startProceduralSynth() {
    stopProceduralSynth();
    initAudioContext();
    const stepDuration = (60 / synthBpm) / 4; // 16th notes

    synthInterval = setInterval(() => {
        const now = audioCtx.currentTime;
        const currentStep = synthStep;

        // 1. Kick (4-on-the-floor: beats 0, 4, 8, 12)
        if (currentStep % 4 === 0) play909Kick(now);

        // 2. Offbeat Open Hi-Hat (beats 2, 6, 10, 14)
        if (currentStep % 4 === 2) play909HiHat(now, true);
        else play909HiHat(now, false); // 16th closed hats

        // 3. Claps / Snares on beats 4 & 12
        if (currentStep === 4 || currentStep === 12) play909Clap(now);

        // 4. TB-303 Acid Note
        play303Step(currentPattern[currentStep], now);

        synthStep = (synthStep + 1) % 16;
        totalStepsPlayed++;

        // Auto-evolve acid pattern every 32 steps (2 bars)
        if (totalStepsPlayed % 32 === 0) {
            mutatePattern();
            // Subtle random cutoff drift
            synthCutoff = 800 + Math.random() * 600;
        }
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
        audioEl.play().catch(e => console.log('Playback waiting for interaction'));
        isPlaying = true;

        if (!isVisualizerHooked && audioCtx) {
            try {
                sourceNode = audioCtx.createMediaElementSource(audioEl);
                sourceNode.connect(analyser);
                analyser.connect(audioCtx.destination);
                isVisualizerHooked = true;
            } catch(e) { console.log('Visualizer ready'); }
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
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
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
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.88;
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
    el.innerHTML = \`<span class="chat-time">\${time}</span><span class="chat-user">\${user}:</span> \${msg}\`;
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
            a.download = \`DarkAIs_Rave_Clip_\${Date.now()}.webm\`;
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
            const v = parseFloat(e.target.value);
            audioEl.volume = v;
            if (masterGain) masterGain.gain.setValueAtTime(v, audioCtx.currentTime);
        });
    }

    // Synth Controls
    const bpmSlider = document.getElementById('synthBpm');
    if (bpmSlider) {
        bpmSlider.addEventListener('input', (e) => {
            synthBpm = parseInt(e.target.value);
            document.getElementById('bpmDisplay').innerText = synthBpm + ' BPM';
            if (synthInterval) startProceduralSynth();
        });
    }

    const cutSlider = document.getElementById('synthCutoff');
    if (cutSlider) {
        cutSlider.addEventListener('input', (e) => {
            synthCutoff = parseFloat(e.target.value);
        });
    }

    const resSlider = document.getElementById('synthRes');
    if (resSlider) {
        resSlider.addEventListener('input', (e) => {
            synthResonance = parseFloat(e.target.value);
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

    setInterval(spawnChatMessage, 4500);
    renderVisualizer();
});
