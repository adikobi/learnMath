// Config constants
const CELEBRATION_EMOJIS = ['🎉', '✨', '🎊', '🌟', '💫', '🎈', '🎨', '🎯', '🎪', '🎭'];
const CELEBRATION_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const SELECTION_CELEBRATION_EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'];
const SELECTION_CELEBRATION_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const HEART_COLORS = ['#FF69B4', '#FFFFFF', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#800080'];
const HEART_COLOR_NAMES = {
    '#FF69B4': 'ורוד',
    '#FFFFFF': 'לבן',
    '#FFA500': 'כתום',
    '#FFFF00': 'צהוב',
    '#00FF00': 'ירוק',
    '#0000FF': 'כחול',
    '#800080': 'סגול'
};
const HEART_EMOJIS = ['🩷', '❤', '🧡', '💛', '💚', '💙', '💜'];

// Utility functions
function createCelebration() {
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

function createSelectionCelebration() {
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

function animateFloating(element) {
    let x = parseFloat(element.style.left);
    let y = parseFloat(element.style.top);
    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;
    const animate = () => {
        if (!element.parentElement) return;
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

// Main game class
class MathGame {
    constructor() {
        this.currentPlayer = null;
        this.selectedNumber = null;
        this.currentStage = 'player-selection';
        this.exerciseAnswers = [];
        this.completedExercises = 0;
        this.selectedDigits = [];
        this.collectedHearts = 0;
        this.heartInterval = null;

        this.setupEventListeners();
        this.setupDrawingCanvas();
        
        this.showStage('player-selection');
    }

    setupEventListeners() {
        document.getElementById('home-button').addEventListener('click', () => this.goHome());

        document.querySelectorAll('.player').forEach(player => {
            player.addEventListener('click', () => this.selectPlayer(player.dataset.player));
        });

        document.getElementById('clear-canvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('finish-drawing').addEventListener('click', () => this.finishDrawing());

        document.getElementById('target-number').addEventListener('click', () => this.toggleNumberVisibility());
        document.getElementById('repeat-number').addEventListener('click', () => this.speakNumber());
    }

    setupDrawingCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = true;
        this.resized = false;
        this.lastX = 0;
        this.lastY = 0;
        this.colorHue = 0;

        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 8;
            this.ctx.strokeStyle = `hsl(${this.colorHue}, 100%, 50%)`;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const startDrawing = (x, y) => {
            if (!this.resized) {
                resizeCanvas();
                this.resized = true;
            }
            this.isDrawing = true;
            this.lastX = x;
            this.lastY = y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        };

        const draw = (x, y) => {
            if (!this.isDrawing) return;
            this.colorHue = (this.colorHue + 1) % 360;
            this.ctx.strokeStyle = `hsl(${this.colorHue}, 100%, 50%)`;
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            [this.lastX, this.lastY] = [x, y];
        };

        const stopDrawing = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.ctx.closePath();
            }
        };

        this.canvas.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mousemove', (e) => draw(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mouseup', stopDrawing);
        this.canvas.addEventListener('mouseout', stopDrawing);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            draw(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        this.canvas.addEventListener('touchend', e => { e.preventDefault(); stopDrawing(); });
        this.canvas.addEventListener('touchcancel', e => { e.preventDefault(); stopDrawing(); });
    }

    showStage(stage) {
        document.querySelectorAll('.game-stage').forEach(s => {
            s.classList.remove('active');
        });
        const stageElement = document.getElementById(stage);
        stageElement.classList.add('active');
        this.currentStage = stage;
    }

    selectPlayer(player) {
        this.currentPlayer = player;
        const selectedPlayer = document.querySelector(`[data-player="${player}"]`);
        selectedPlayer.classList.add('player-selected');
        
        createSelectionCelebration();
        
        setTimeout(() => {
            this.resetGame();
            this.showStage('number-finding');
            this.generateRandomNumber();
        }, 1000);
    }

    goHome() {
        this.showStage('player-selection');
        this.resetGame();
        document.querySelectorAll('.player').forEach(p => p.classList.remove('player-selected'));
        this.currentPlayer = null;
    }

    resetGame() {
        this.exerciseAnswers = [];
        this.completedExercises = 0;
        this.selectedDigits = [];
        document.querySelectorAll('.exercise').forEach(exercise => {
            exercise.style.backgroundColor = '';
            exercise.querySelector('.selected-numbers').innerHTML = '';
        });
        this.clearCanvas();
        if (this.heartInterval) {
            clearInterval(this.heartInterval);
        }
    }

    generateRandomNumber() {
        this.selectedNumber = Math.floor(Math.random() * 10) + 1;
        this.showTargetNumber();
        this.createFloatingNumbers();
    }

    showTargetNumber() {
        const targetNumber = document.getElementById('target-number');
        targetNumber.textContent = this.selectedNumber;
        targetNumber.classList.add('hidden');
        this.speakNumber();
    }

    toggleNumberVisibility() {
        document.getElementById('target-number').classList.toggle('hidden');
    }

    speakNumber() {
        const utterance = new SpeechSynthesisUtterance(this.selectedNumber.toString());
        utterance.lang = 'he-IL';
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'he-IL') || null;
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }

    createFloatingNumbers() {
        const container = document.getElementById('floating-numbers');
        container.innerHTML = '';
        
        const numbers = [this.selectedNumber];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 10) + 1;
            if (!numbers.includes(num)) numbers.push(num);
        }

        numbers.forEach(num => {
            const element = document.createElement('img');
            element.src = `images/${this.currentPlayer}/${this.currentPlayer}${num}.jpg`;
            element.className = 'floating-number';
            element.dataset.number = num;
            
            element.style.left = `${Math.random() * (container.offsetWidth - 70)}px`;
            element.style.top = `${Math.random() * (container.offsetHeight - 70)}px`;
            
            element.addEventListener('click', () => this.checkNumberSelection(num));
            container.appendChild(element);
            
            animateFloating(element);
        });
    }

    checkNumberSelection(number) {
        if (number === this.selectedNumber) {
            this.showStage('math-exercises');
            this.generateMathExercises();
        }
    }

    generateMathExercises() {
        const exercises = document.querySelectorAll('.exercise');
        exercises.forEach((exercise, index) => {
            let equation;
            if (this.currentPlayer === 'mayan') {
                const operation = Math.random() < 0.5 ? '*' : '/';
                if (operation === '*') {
                    const num2 = Math.floor(Math.random() * 10) + 1;
                    equation = `${this.selectedNumber} × ${num2} = ?`;
                    this.exerciseAnswers[index] = this.selectedNumber * num2;
                } else {
                    const num2 = this.selectedNumber * (Math.floor(Math.random() * 5) + 1);
                    equation = `${num2} ÷ ${this.selectedNumber} = ?`;
                    this.exerciseAnswers[index] = num2 / this.selectedNumber;
                }
            } else {
                const num2 = Math.floor(Math.random() * 10) + 1;
                equation = `${index === 0 ? this.selectedNumber : num2} + ${index === 0 ? num2 : this.selectedNumber} = ?`;
                this.exerciseAnswers[index] = this.selectedNumber + num2;
            }

            exercise.querySelector('.equation').textContent = equation;
            this.createNumberOptions(exercise, index);
        });

        exercises[1].style.display = 'none';
        
        const nav = document.createElement('div');
        nav.className = 'exercise-nav';
        nav.innerHTML = `<div class="exercise-dot active"></div><div class="exercise-dot"></div>`;
        document.getElementById('math-exercises').appendChild(nav);
    }

    createNumberOptions(exercise, index) {
        const optionsContainer = exercise.querySelector('.number-options');
        optionsContainer.innerHTML = '';
        
        for (let i = 0; i <= 9; i++) {
            const option = document.createElement('div');
            option.className = 'number-option';
            option.dataset.number = i;
            
            const img = document.createElement('img');
            img.src = `images/${this.currentPlayer}/${this.currentPlayer}${i}.jpg`;
            option.appendChild(img);
            
            option.addEventListener('click', () => this.selectDigit(option, index));
            optionsContainer.appendChild(option);
        }
    }

    selectDigit(option, exerciseIndex) {
        const exercise = document.querySelectorAll('.exercise')[exerciseIndex];
        const selectedNumbers = exercise.querySelector('.selected-numbers');
        const number = parseInt(option.dataset.number);
        
        if (!this.selectedDigits[exerciseIndex]) {
            this.selectedDigits[exerciseIndex] = [];
        }

        this.selectedDigits[exerciseIndex].push(number);
        option.classList.add('selected-number');
        
        const count = this.selectedDigits[exerciseIndex].filter(n => n === number).length;
        option.setAttribute('data-count', count);
        
        const img = document.createElement('img');
        img.src = `images/${this.currentPlayer}/${this.currentPlayer}${number}.jpg`;
        img.dataset.number = number;
        selectedNumbers.appendChild(img);

        img.addEventListener('click', () => {
            img.remove();
            const indexToRemove = this.selectedDigits[exerciseIndex].indexOf(number);
            if (indexToRemove !== -1) {
                this.selectedDigits[exerciseIndex].splice(indexToRemove, 1);
            }
            const newCount = this.selectedDigits[exerciseIndex].filter(n => n === number).length;
            if (newCount === 0) {
                option.classList.remove('selected-number');
                option.removeAttribute('data-count');
            } else {
                option.setAttribute('data-count', newCount);
            }
            this.checkAnswer(exerciseIndex);
        });

        this.checkAnswer(exerciseIndex);
    }

    checkAnswer(exerciseIndex) {
        const exercise = document.querySelectorAll('.exercise')[exerciseIndex];
        const answer = this.exerciseAnswers[exerciseIndex];
        const selectedAnswer = parseInt(this.selectedDigits[exerciseIndex].join(''));
        
        if (selectedAnswer === answer) {
            createCelebration();
            exercise.style.backgroundColor = '#90EE90';
            exercise.classList.add('success');
            this.completedExercises++;
            
            if (this.completedExercises === 1) {
                setTimeout(() => {
                    document.querySelectorAll('.exercise')[1].style.display = 'flex';
                    document.querySelectorAll('.exercise-dot')[1].classList.add('active');
                }, 1000);
            } else if (this.completedExercises === 2) {
                setTimeout(() => {
                    this.showStage('heart-collection');
                    this.startHeartCollection();
                }, 1000);
            }
        } else if (this.selectedDigits[exerciseIndex].length === answer.toString().length) {
            exercise.style.backgroundColor = '#FFB6C1';
            exercise.classList.add('shake');
            setTimeout(() => {
                this.selectedDigits[exerciseIndex] = [];
                exercise.querySelectorAll('.number-option').forEach(opt => {
                    opt.classList.remove('selected-number');
                    opt.removeAttribute('data-count');
                });
                exercise.querySelector('.selected-numbers').innerHTML = '';
                exercise.style.backgroundColor = '';
                exercise.classList.remove('shake');
            }, 1000);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    finishDrawing() {
        this.goHome();
    }

    startHeartCollection() {
        this.collectedHearts = 0;
        
        this.targetHeartColor = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
        const targetColorName = HEART_COLOR_NAMES[this.targetHeartColor];

        document.getElementById('heart-instructions').textContent = `אספו ${this.selectedNumber} לבבות בצבע ${targetColorName}.`;
        document.querySelector('.target-color-display').style.backgroundColor = this.targetHeartColor;
        
        document.querySelector('.hearts-container').innerHTML = '';
        document.querySelector('.collected-hearts').innerHTML = '';
        
        this.generateHearts();
    }

    generateHearts() {
        const container = document.querySelector('.hearts-container');
        
        const createHeart = () => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            
            const maxLeft = window.innerWidth - 100;
            heart.style.left = `${Math.random() * maxLeft}px`;
            
            const colorIndex = Math.random() < 0.5 ? 
                HEART_COLORS.indexOf(this.targetHeartColor) :
                Math.floor(Math.random() * HEART_COLORS.length);
            const color = HEART_COLORS[colorIndex];
            const heartEmoji = HEART_EMOJIS[colorIndex];
            heart.textContent = heartEmoji;
            heart.style.color = color;
            
            heart.addEventListener('click', () => this.collectHeart(heart, color, heartEmoji));
            
            container.appendChild(heart);
            
            heart.addEventListener('animationend', () => heart.remove());
        };

        for (let i = 0; i < 10; i++) createHeart();

        this.heartInterval = setInterval(() => {
            if (this.currentStage === 'heart-collection') createHeart();
        }, 1500);
    }

    collectHeart(heart, color, emoji) {
        if (color !== this.targetHeartColor) {
            heart.classList.add('shake');
            setTimeout(() => heart.classList.remove('shake'), 500);
            return;
        }

        this.collectedHearts++;
        
        const collectedContainer = document.querySelector('.collected-hearts');
        const collectedHeart = document.createElement('div');
        collectedHeart.className = 'collected-heart';
        collectedHeart.textContent = emoji;
        collectedHeart.style.color = color;
        collectedContainer.appendChild(collectedHeart);
        
        heart.remove();

        if (this.collectedHearts === this.selectedNumber) {
            createCelebration();
            clearInterval(this.heartInterval);
            
            setTimeout(() => {
                this.showStage('number-drawing');
                document.getElementById('drawing-instructions').textContent = `עכשיו, נסו לצייר את המספר ${this.selectedNumber}!`;
            }, 1500);
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new MathGame();
});
