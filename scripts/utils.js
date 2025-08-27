import { CELEBRATION_EMOJIS, CELEBRATION_COLORS, SELECTION_CELEBRATION_EMOJIS, SELECTION_CELEBRATION_COLORS } from './config.js';

export function createCelebration() {
    for (let i = 0; i < 30; i++) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.style.left = Math.random() * window.innerWidth + 'px';
        celebration.style.top = Math.random() * window.innerHeight + 'px';

        const emoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
        celebration.textContent = emoji;

        celebration.style.color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];

        const size = Math.random() * 20 + 20;
        celebration.style.fontSize = `${size}px`;

        celebration.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(celebration);

        setTimeout(() => celebration.remove(), 2000);
    }
}

export function createSelectionCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'selection-celebration';
    document.body.appendChild(celebration);

    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.className = 'selection-celebration-item';
        item.textContent = SELECTION_CELEBRATION_EMOJIS[Math.floor(Math.random() * SELECTION_CELEBRATION_EMOJIS.length)];
        item.style.left = `${Math.random() * 100}%`;
        item.style.color = SELECTION_CELEBRATION_COLORS[Math.floor(Math.random() * SELECTION_CELEBRATION_COLORS.length)];
        item.style.animationDelay = `${Math.random() * 0.5}s`;
        celebration.appendChild(item);
    }

    setTimeout(() => celebration.remove(), 2000);
}

export function animateFloating(element) {
    let x = parseFloat(element.style.left);
    let y = parseFloat(element.style.top);
    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;

    const animate = () => {
        if (!element.parentElement) return; // Stop animation if element is removed

        x += dx;
        y += dy;

        if (x <= 0 || x >= element.parentElement.offsetWidth - 70) dx *= -1;
        if (y <= 0 || y >= element.parentElement.offsetHeight - 70) dy *= -1;

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        requestAnimationFrame(animate);
    };

    animate();
}
