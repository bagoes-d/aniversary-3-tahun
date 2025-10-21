// ...existing code...

// --- setup elements (guard jika elemen tidak ada) ---
const bg = document.getElementById('bgMusic');
const playBtn = document.getElementById('playBtn');
const vol = document.getElementById('vol');
const openBtn = document.getElementById('openLetter');
const hidden = document.getElementById('hiddenPart');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const typeEl = document.getElementById('typewriter');
const loveRange = document.getElementById('loveRange');
const lovePct = document.getElementById('lovePct');
const floatingHeart = document.getElementById('floatingHeart');
const heartsContainer = document.querySelector('.hearts');

if (!openBtn || !hidden) {
    console.warn('Missing openLetter or hiddenPart element.');
}

// --- Reveal letter: use class 'hidden' toggle (safer than inline styles) ---
if (openBtn && hidden) {
    openBtn.addEventListener('click', () => {
        if (hidden.classList.contains('hidden')) {
            hidden.classList.remove('hidden');
            hidden.scrollIntoView({ behavior: 'smooth', block: 'center' });
            spawnConfetti(window.innerWidth / 2, window.innerHeight / 3);
            pulseHeart();
            // hide original open button if it's the one inside letter section
            if (openBtn.parentElement) openBtn.style.display = 'none';
        } else {
            hidden.classList.add('hidden');
            if (openBtn.parentElement) openBtn.style.display = '';
        }
    });
}

// --- Floating hearts (safe guards) ---
function createHeart() {
    if (!heartsContainer) return;
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (4 + Math.random() * 4) + 's';
    heartsContainer.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 8000);
}

// will set interval later after detecting mobile
let heartTimer = null;

// inject minimal heart CSS if not present
const style = document.createElement('style');
style.textContent = `
.heart {
    position: absolute;
    width: 15px;
    height: 15px;
    background: #ff005d;
    transform: rotate(45deg);
    animation: fall linear forwards;
    z-index: 2;
}
.heart::before,
.heart::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    background: #ff005d;
    border-radius: 50%;
}
.heart::before { top: -7.5px; left: 0; }
.heart::after  { left: 7.5px; top: 0; }
@keyframes fall {
    0% { transform: translateY(0) rotate(45deg); opacity: 1; }
    100% { transform: translateY(-800px) rotate(45deg); opacity: 0; }
}
`;
document.head.appendChild(style);

// --- Play music after first click (browser policy) ---
document.body.addEventListener('click', function initPlayOnce() {
    if (!bg) return;
    if (bg.paused) {
        bg.play().catch(() => {
            console.log('Autoplay blocked — user interaction required.');
        });
    }
}, { once: true });

// --- Confetti system (guards) ---
let confettiParticles = [];
let cw = 0, ch = 0, raf = null;

function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.floor(window.innerWidth * dpr);
    ch = Math.floor(window.innerHeight * dpr);
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// spawnConfetti accepts a count so mobile can reduce
function spawnConfetti(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 80) {
    if (!ctx) return;
    const colors = ['#ff6b9a', '#ffd166', '#ff8fab', '#a7f3d0', '#ffc4dd'];
    for (let i = 0; i < count; i++) {
        confettiParticles.push({
            x: x + (Math.random() - 0.5) * 200,
            y: y + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 6 + 2,
            r: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 80 + Math.random() * 40
        });
    }
    if (!raf) runConfetti();
}

function runConfetti() {
    if (!ctx) return;
    raf = requestAnimationFrame(runConfetti);
    ctx.clearRect(0, 0, cw, ch);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.r, p.r * 0.6);
        if (p.life <= 0 || p.y > ch + 50) confettiParticles.splice(i, 1);
    }
    if (confettiParticles.length === 0) {
        cancelAnimationFrame(raf);
        raf = null;
        ctx.clearRect(0, 0, cw, ch);
    }
}

// --- Music controls (guard) ---
if (playBtn && bg) {
    playBtn.addEventListener('click', () => {
        if (bg.paused) {
            bg.play();
            playBtn.textContent = 'Pause ⏸️';
        } else {
            bg.pause();
            playBtn.textContent = 'Play Music ▶️';
        }
    });
}
if (vol && bg) {
    vol.addEventListener('input', (e) => { bg.volume = e.target.value; });
    bg.volume = vol.value || 0.8;
}

// --- Typewriter ---
const lines = [
    "Kamu selalu di pikiranku.",
    "Setiap hari bersamamu adalah hadiah.",
    "3 tahun lalu aku beruntung, sekarang & selamanya juga."
];
let li = 0, ci = 0;
function typeLoop() {
    if (!typeEl) return;
    const current = lines[li];
    typeEl.textContent = current.slice(0, ci);
    ci++;
    if (ci > current.length) {
        ci = 0;
        li = (li + 1) % lines.length;
        setTimeout(typeLoop, 1600);
    } else {
        setTimeout(typeLoop, 80);
    }
}
typeLoop();

// --- Heart pulse & love meter ---
function pulseHeart() {
    if (!floatingHeart) return;
    floatingHeart.classList.add('love-scale');
    floatingHeart.style.setProperty('--s', 1.2);
    setTimeout(() => {
        floatingHeart.style.setProperty('--s', 1);
        setTimeout(() => floatingHeart.classList.remove('love-scale'), 500);
    }, 600);
}

function updateLove() {
    if (!loveRange || !lovePct || !floatingHeart) return;
    const v = Number(loveRange.value);
    lovePct.textContent = v + '%';
    const scale = 1 + v / 100;
    floatingHeart.style.setProperty('--s', scale.toFixed(2));
}
if (loveRange) {
    loveRange.addEventListener('input', updateLove);
    updateLove();
}
if (floatingHeart) {
    floatingHeart.addEventListener('click', (e) => {
        spawnConfetti(e.clientX, e.clientY, 24);
        pulseHeart();
    });
}

// --- Mobile / touch enhancements ---
(function () {
    const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // heart creation rate: slower on mobile
    const heartIntervalMs = isMobile ? 800 : 300;
    heartTimer = setInterval(createHeart, heartIntervalMs);

    if (!isMobile) return;

    document.body.classList.add('mobile');

    // tap overlay for mobile autoplay guidance
    const overlay = document.createElement('div');
    overlay.id = 'tapOverlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.color = '#fff';
    overlay.style.zIndex = '9998';
    overlay.style.fontSize = '18px';
    overlay.style.padding = '20px';
    overlay.textContent = 'Ketuk layar untuk memulai musik & kejutan 💕';
    document.body.appendChild(overlay);

    const removeOverlay = () => {
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
    };
    document.body.addEventListener('click', removeOverlay, { once: true, passive: true });

    // swipe up to open, swipe down to close
    let touchStartY = null, touchStartX = null;
    window.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStartY = t.clientY;
        touchStartX = t.clientX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        if (touchStartY === null) return;
        const dy = touchStartY - t.clientY;
        const dx = touchStartX - t.clientX;
        if (Math.abs(dx) > Math.abs(dy)) {
            touchStartY = null; touchStartX = null;
            return;
        }
        if (dy > 80) {
            if (openBtn) openBtn.click();
        } else if (dy < -80) {
            if (openBtn && !hidden.classList.contains('hidden')) openBtn.click();
        }
        touchStartY = null; touchStartX = null;
    }, { passive: true });

    // reduce confetti on mobile
    const origSpawn = spawnConfetti;
    spawnConfetti = function (x = window.innerWidth / 2, y = window.innerHeight / 3, count = 36) {
        origSpawn(x, y, count);
    };

    // larger touch area for floating heart
    if (floatingHeart) {
        floatingHeart.style.padding = '12px';
        floatingHeart.style.fontSize = '44px';
    }

    // pause heavy animations when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (raf) {
                cancelAnimationFrame(raf);
                raf = null;
            }
        } else {
            if (confettiParticles.length > 0 && !raf) runConfetti();
        }
    });

    // make UI controls touch-friendly
    if (playBtn) { playBtn.style.padding = '14px 18px'; playBtn.style.fontSize = '18px'; }
    if (vol) vol.style.touchAction = 'manipulation';
})();

// if not mobile, start hearts immediately (in case IIFE returned early)
if (!heartTimer) {
    const defaultInterval = 300;
    heartTimer = setInterval(createHeart, defaultInterval);
}

// --- ensure initial bg volume ---
if (bg && vol) bg.volume = vol.value || 0.8;

// ...existing code...

// --- cute sparkle heart burst ---
document.addEventListener('click', (e) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '💖';
    sparkle.style.left = e.pageX + 'px';
    sparkle.style.top = e.pageY + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 3000);
});

// --- Secret message reveal ---
const secretMsg = document.getElementById('secretMsg');
if (openBtn && secretMsg) {
    openBtn.addEventListener('click', () => {
        setTimeout(() => {
            secretMsg.classList.remove('hidden');
            spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);
        }, 2500);
    });
}

// --- Sparkle Trail (every click adds glitter hearts) ---
document.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = (e.pageX + Math.random() * 40 - 20) + 'px';
        sparkle.style.top = (e.pageY + Math.random() * 40 - 20) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 2500 + i * 200);
    }
});

// --- Romantic Image Zoom Interaction ---
const galleryPhotos = document.querySelector('.photos');
document.querySelectorAll('.photos img').forEach(img => {
    img.addEventListener('click', () => {
        const isZoomed = img.classList.toggle('zoomed');
        if (galleryPhotos) {
            galleryPhotos.classList.toggle('zoom-active', isZoomed);
        }
    });
});
