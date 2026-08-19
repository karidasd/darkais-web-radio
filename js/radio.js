/* 🎧 DARKAIS 24/7 CYBER RAVE WEB RADIO — MASTER BULLETPROOF AUDIO ENGINE */

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
audioEl.preload = "none";

let audioCtx = null;
let visMode = 'tunnel'; // 'tunnel', 'bars', 'wave'
let isAudioUnlocked = false;

// ── 1. BULLETPROOF WEB AUDIO CONTEXT (FOR FX & SYNTH) ─────────────────────
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    isAudioUnlocked = true;
    return audioCtx;
}

// ── 2. DJ LAUNCHPAD SOUND FX (ZERO-LATENCY DIRECT SYNTHESIS) ──────────────
function triggerFx(fxType) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (fxType === 'airhorn') {
        [370, 466, 554].forEach(f => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.setValueAtTime(0.3, now + 0.16);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.38);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        });
    } else if (fxType === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(26, now + 0.7);
        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
    } else if (fxType === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(3600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
    } else if (fxType === 'voice') {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance("DarkAIs Cyber Rave Protocol Engaged");
            utter.pitch = 0.6;
            utter.rate = 1.0;
            window.speechSynthesis.speak(utter);
        }
    } else if (fxType === 'scratch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.linearRampToValueAtTime(1500, now + 0.09);
        osc.frequency.linearRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    }
}

// ── 3. BULLETPROOF STREAM PLAYBACK ─────────────────────────────────────────
function setStreamStatus(statusText, color = '#00F0FF') {
    const el = document.getElementById('streamStatusBadge');
    if (el) {
        el.innerText = statusText;
        el.style.color = color;
    }
}

function playStation(idx) {
    currentStationIdx = idx;
    const station = STATIONS[idx];
    getAudioContext();

    document.getElementById('trackTitle').innerText = station.name;
    document.getElementById('trackSubtitle').innerText = station.sub;
    document.getElementById('bpmStat').innerText = station.bpm + ' BPM';

    document.querySelectorAll('.station-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });

    setStreamStatus('⏳ CONNECTING STREAM...', '#FFB800');

    audioEl.pause();
    audioEl.src = station.streamUrl;
    audioEl.load();

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            setStreamStatus('⚡ 24/7 ON AIR', '#39FF14');
            updatePlayButton();
        }).catch(err => {
            console.log('Playback error / auto-blocked:', err);
            setStreamStatus('CLICK PLAY TO UNMUTE', '#FF0055');
            isPlaying = false;
            updatePlayButton();
        });
    }
}

function togglePlay() {
    getAudioContext();
    if (isPlaying) {
        audioEl.pause();
        isPlaying = false;
        setStreamStatus('PAUSED', '#94A3B8');
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

// ── 4. RESPONSIVE REALTIME CANVAS VISUALIZER ──────────────────────────────
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
let animationFrame = 0;

function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    if (!isPlaying) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.font = '14px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ DARKAIS 24/7 CYBER RAVE RADIO // CLICK PLAY TO STREAM', cx, cy);
        return;
    }

    animationFrame++;
    const currentBpm = STATIONS[currentStationIdx].bpm || 140;
    const beatPhase = (Date.now() / (60000 / currentBpm)) * Math.PI * 2;
    const pulse = Math.pow(Math.sin(beatPhase), 4); // Sharp kick pulse

    if (visMode === 'tunnel') {
        // 3D Laser Tunnel
        const angle = animationFrame * 0.02 + pulse * 0.05;

        for (let r = 8; r >= 1; r--) {
            const dist = (r * 28 + (animationFrame * 2) % 28) * (1 + pulse * 0.35);
            ctx.beginPath();
            ctx.strokeStyle = r % 2 === 0 ? '#00F0FF' : '#C084FC';
            ctx.lineWidth = 1.5 + pulse * 2;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 8 + pulse * 14;

            for (let a = 0; a < 6; a++) {
                const rot = angle + (a * Math.PI / 3);
                const px = cx + Math.cos(rot) * dist;
                const py = cy + Math.sin(rot) * (dist * 0.62);
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Laser Rays
        for (let i = 0; i < 8; i++) {
            const rot = angle + (i * Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rot) * w * 0.6, cy + Math.sin(rot) * h * 0.6);
            ctx.strokeStyle = \`rgba(57, 255, 20, \${0.25 + pulse * 0.6})\`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    } else if (visMode === 'bars') {
        // Spectrum Bars
        const numBars = 48;
        const barWidth = w / numBars;

        for (let i = 0; i < numBars; i++) {
            const freqVal = Math.sin(i * 0.2 + animationFrame * 0.08) * 0.5 + 0.5;
            const barHeight = (freqVal * 0.6 + pulse * 0.4) * h * 0.85;

            const grad = ctx.createLinearGradient(0, h, 0, 0);
            grad.addColorStop(0, '#00F0FF');
            grad.addColorStop(0.5, '#A855F7');
            grad.addColorStop(1, '#39FF14');

            ctx.fillStyle = grad;
            ctx.fillRect(i * barWidth, h - barHeight, barWidth - 3, barHeight);
        }
    } else if (visMode === 'wave') {
        // Oscilloscope Wave
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 12;
        ctx.beginPath();

        for (let x = 0; x < w; x += 4) {
            const y = cy + Math.sin(x * 0.03 + animationFrame * 0.1) * (30 + pulse * 45);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// ── 5. FULLSCREEN RAVE MODE ───────────────────────────────────────────────
function toggleFullscreenRave() {
    const disp = document.getElementById('visualizerDisplayBox');
    if (!document.fullscreenElement) {
        disp.requestFullscreen().catch(err => alert('Fullscreen not supported'));
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        document.exitFullscreen();
        canvas.width = 900;
        canvas.height = 260;
    }
}

// ── 6. POMODORO TIMER ──────────────────────────────────────────────────────
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

// ── 7. INITIALIZATION ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Volume Control
    const vol = document.getElementById('volumeSlider');
    if (vol) {
        vol.addEventListener('input', (e) => {
            audioEl.volume = parseFloat(e.target.value);
        });
    }

    // Visualizer Mode Buttons
    document.querySelectorAll('.vis-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            if (pill.dataset.mode) {
                document.querySelectorAll('.vis-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                visMode = pill.dataset.mode;
            }
        });
    });

    // Auto-unlock audio on any page interaction
    const unlock = () => {
        getAudioContext();
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);

    renderVisualizer();
});
