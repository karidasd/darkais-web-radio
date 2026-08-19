/* 🎧 DARKAIS 24/7 CYBER RAVE WEB RADIO — MASTER ENGINE */

const STATIONS = [
    {
        id: "techno",
        name: "Berlin Underground Dark Techno",
        sub: "140 BPM • Industrial & Acid Drops",
        streamUrl: "https://ice1.somafm.com/defcon-128-mp3",
        bpm: 140
    },
    {
        id: "acid",
        name: "90s Acid Rave & Hardcore",
        sub: "150 BPM • TB-303 Resonance & Breakbeats",
        streamUrl: "https://ice2.somafm.com/secretagent-128-mp3",
        bpm: 150
    },
    {
        id: "dnb",
        name: "Pirate Drum & Bass / Neurofunk",
        sub: "174 BPM • High Velocity Sub-Bass",
        streamUrl: "https://ice4.somafm.com/bootliquor-128-mp3",
        bpm: 174
    },
    {
        id: "darksynth",
        name: "Cyberpunk Darksynth & Midtempo",
        sub: "115 BPM • Dystopian Bass & Heavy Reeses",
        streamUrl: "https://ice4.somafm.com/spacestation-128-mp3",
        bpm: 115
    },
    {
        id: "darkwave",
        name: "Industrial Darkwave & EBM",
        sub: "128 BPM • Cold Analog Synths & Dark Vocals",
        streamUrl: "https://ice6.somafm.com/u80s-128-mp3",
        bpm: 128
    },
    {
        id: "psytrance",
        name: "Dark Psytrance & Forest Goa",
        sub: "148 BPM • Hypnotic Frequency Modulation",
        streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
        bpm: 148
    },
    {
        id: "electro",
        name: "French Cyber Electro & Complextro",
        sub: "128 BPM • Distorted Stabs & Club Grooves",
        streamUrl: "https://ice2.somafm.com/cliqhop-128-mp3",
        bpm: 128
    },
    {
        id: "lofi",
        name: "Dark Lo-Fi Cyber Coding Beats",
        sub: "85 BPM • Rainy Neon Cyberpunk Chill",
        streamUrl: "https://ice3.somafm.com/dronezone-128-mp3",
        bpm: 85
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

// Audio EQ Nodes
let bassFilter = null;
let trebleFilter = null;
let masterGain = null;

let visMode = 'tunnel'; // 'tunnel', 'bars', 'wave'
let isFullscreenVis = false;

// ── 1. AUDIO CONTEXT & EQUALIZER SETUP ──────────────────────────────────
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);

        // Low Shelf (Bass Boost)
        bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 180;
        bassFilter.gain.value = 6; // +6dB default boost

        // High Shelf (Treble)
        trebleFilter = audioCtx.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 4000;
        trebleFilter.gain.value = 3;

        masterGain.connect(bassFilter);
        bassFilter.connect(trebleFilter);
        trebleFilter.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ── 2. DJ LAUNCHPAD SOUND FX ENGINE (SYNTHESIZED & HIGH-IMPACT) ──────────
function triggerFx(fxType) {
    initAudioContext();
    const now = audioCtx.currentTime;

    if (fxType === 'airhorn') {
        // Classic Rave Airhorn Multi-Tone
        const freqs = [370, 466, 554];
        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.setValueAtTime(0.25, now + 0.15);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        });
    } else if (fxType === 'drop') {
        // Massive Sub-Bass Impact Drop
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.65);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
    } else if (fxType === 'laser') {
        // Acid Laser Zap
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(3200, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } else if (fxType === 'voice') {
        // Speech Synth Drop: "DARKAIS SYSTEM ONLINE"
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance("DarkAIs Cyber Rave Protocol Engaged");
            utter.pitch = 0.5;
            utter.rate = 1.05;
            window.speechSynthesis.speak(utter);
        }
    } else if (fxType === 'scratch') {
        // Vinyl Scratch
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.08);
        osc.frequency.linearRampToValueAtTime(200, now + 0.16);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

// ── 3. STATION PLAYBACK ──────────────────────────────────────────────────
function playStation(idx) {
    currentStationIdx = idx;
    const station = STATIONS[idx];
    initAudioContext();

    document.getElementById('trackTitle').innerText = station.name;
    document.getElementById('trackSubtitle').innerText = station.sub;
    document.getElementById('bpmStat').innerText = station.bpm + ' BPM';

    document.querySelectorAll('.station-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });

    audioEl.src = station.streamUrl;
    audioEl.play().catch(e => console.log('Playback waiting'));
    isPlaying = true;

    if (!isVisualizerHooked && audioCtx) {
        try {
            sourceNode = audioCtx.createMediaElementSource(audioEl);
            sourceNode.connect(masterGain);
            isVisualizerHooked = true;
        } catch(e) { console.log('Hooked'); }
    }

    updatePlayButton();
}

function togglePlay() {
    initAudioContext();
    if (isPlaying) {
        audioEl.pause();
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

// ── 4. REALTIME 3D LASER TUNNEL & CANVAS VISUALIZER ───────────────────────
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
let tunnelAngle = 0;

function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!analyser || !isPlaying) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.font = '13px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ DARKAIS 24/7 CYBER RAVE PROTOCOL // PRESS PLAY TO ENGAGE', canvas.width / 2, canvas.height / 2);
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    if (visMode === 'tunnel') {
        // 3D Laser Tunnel Visualizer
        analyser.getByteFrequencyData(dataArray);
        const bassLevel = (dataArray[1] + dataArray[2] + dataArray[3]) / (3 * 255);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        tunnelAngle += 0.015 + bassLevel * 0.04;

        // Concentric Pulsing Hexagons / Rings
        for (let r = 8; r >= 1; r--) {
            const dist = (r * 32 + (tunnelAngle * 30) % 32) * (1 + bassLevel * 0.5);
            ctx.beginPath();
            ctx.strokeStyle = r % 2 === 0 ? '#00F0FF' : '#C084FC';
            ctx.lineWidth = 1.5 + bassLevel * 2;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10 + bassLevel * 15;

            for (let a = 0; a < 6; a++) {
                const rot = tunnelAngle + (a * Math.PI / 3);
                const px = cx + Math.cos(rot) * dist;
                const py = cy + Math.sin(rot) * (dist * 0.65);
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Laser Rays from Center
        for (let i = 0; i < 8; i++) {
            const rot = tunnelAngle + (i * Math.PI / 4);
            const val = dataArray[i * 4] / 255;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rot) * canvas.width * 0.6, cy + Math.sin(rot) * canvas.height * 0.6);
            ctx.strokeStyle = \`rgba(57, 255, 20, \${val * 0.7})\`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    } else if (visMode === 'bars') {
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

// ── 5. FULLSCREEN RAVE MODE ───────────────────────────────────────────────
function toggleFullscreenRave() {
    const disp = document.getElementById('visualizerDisplayBox');
    if (!document.fullscreenElement) {
        disp.requestFullscreen().catch(err => alert('Fullscreen unavailable'));
        disp.classList.add('fullscreen-active');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        document.exitFullscreen();
        disp.classList.remove('fullscreen-active');
        canvas.width = 900;
        canvas.height = 260;
    }
}

// ── 6. POMODORO & SLEEP TIMER ──────────────────────────────────────────────
let timerInterval = null;
let timerSeconds = 0;

function startPomodoro(minutes) {
    clearInterval(timerInterval);
    timerSeconds = minutes * 60;
    document.getElementById('timerStatus').innerText = \`\${minutes}:00\`;
    if (!isPlaying) playStation(currentStationIdx);

    timerInterval = setInterval(() => {
        timerSeconds--;
        const m = Math.floor(timerSeconds / 60);
        const s = timerSeconds % 60;
        document.getElementById('timerStatus').innerText = \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            triggerFx('drop');
            alert('⏰ DARKAIS POMODORO COMPLETED! TAKE A 5 MINUTE RAVE BREAK.');
        }
    }, 1000);
}

// ── 7. RECORDING CLIP ──────────────────────────────────────────────────────
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
    // Volume & EQ
    const vol = document.getElementById('volumeSlider');
    if (vol) {
        vol.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            audioEl.volume = v;
        });
    }

    const bass = document.getElementById('bassBoostSlider');
    if (bass) {
        bass.addEventListener('input', (e) => {
            if (bassFilter) bassFilter.gain.value = parseFloat(e.target.value);
        });
    }

    const treble = document.getElementById('trebleSlider');
    if (treble) {
        treble.addEventListener('input', (e) => {
            if (trebleFilter) trebleFilter.gain.value = parseFloat(e.target.value);
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

    renderVisualizer();
});
