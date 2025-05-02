class MathGame {
    constructor() {
        this.currentPlayer = null;
        this.selectedNumber = null;
        this.currentStage = 'player-selection';
        this.exerciseAnswers = [];
        this.completedExercises = 0;
        this.selectedDigits = [];
        this.setupEventListeners();
        this.setupDrawingCanvas();
        this.setupAudio();
    }

    setupEventListeners() {
        // Player selection
        document.querySelectorAll('.player').forEach(player => {
            player.addEventListener('click', () => this.selectPlayer(player.dataset.player));
        });

        // Drawing canvas buttons
        document.getElementById('clear-canvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('finish-drawing').addEventListener('click', () => this.finishDrawing());

        // Target number click
        document.getElementById('target-number').addEventListener('click', () => this.toggleNumberVisibility());
        document.getElementById('repeat-number').addEventListener('click', () => this.speakNumber());
    }

    setupAudio() {
        this.successSound = document.getElementById('success-sound');
        this.errorSound = document.getElementById('error-sound');
    }

    setupDrawingCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = true;
        this.resized = false;
        this.lastX = 0;
        this.lastY = 0;

        const resizeCanvas = () => {
            console.log('resizeCanvas');
            const rect = this.canvas.getBoundingClientRect();
            console.log(rect);
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 8;
            this.ctx.strokeStyle = '#000';
            
        };

        resizeCanvas();
        
        window.addEventListener('resize', resizeCanvas);

        const startDrawing = (x, y) => {
            if (!this.resized)
            {
                resizeCanvas();
                this.resized = true;
            }
                

            
            this.isDrawing = true;
            console.log('start drawing');
            console.log(this.resized);
            this.lastX = x;
            this.lastY = y;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        };

        const draw = (x, y) => {
            if (!this.isDrawing) return;
            console.log('drawing');
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.lastX = x;
            this.lastY = y;
        };

        const stopDrawing = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.ctx.closePath();
            }
        };

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            startDrawing(x, y);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            draw(x, y);
        });

        this.canvas.addEventListener('mouseup', stopDrawing);
        this.canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            startDrawing(x, y);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            draw(x, y);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });

        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            stopDrawing();
        });
    }

    selectPlayer(player) {
        this.currentPlayer = player;
        const selectedPlayer = document.querySelector(`[data-player="${player}"]`);
        selectedPlayer.classList.add('player-selected');
        
        // Create selection celebration
        this.createSelectionCelebration();
        
        setTimeout(() => {
            this.resetGame();
            this.showStage('number-finding');
            this.generateRandomNumber();
        }, 1000);
    }

    createSelectionCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'selection-celebration';
        document.body.appendChild(celebration);

        const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮'];
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

        for (let i = 0; i < 20; i++) {
            const item = document.createElement('div');
            item.className = 'selection-celebration-item';
            item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            item.style.left = `${Math.random() * 100}%`;
            item.style.color = colors[Math.floor(Math.random() * colors.length)];
            item.style.animationDelay = `${Math.random() * 0.5}s`;
            celebration.appendChild(item);
        }

        setTimeout(() => celebration.remove(), 2000);
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
        const targetNumber = document.getElementById('target-number');
        targetNumber.classList.toggle('hidden');
    }

    speakNumber() {
        const utterance = new SpeechSynthesisUtterance(this.selectedNumber.toString());
        utterance.lang = 'he-IL';
        speechSynthesis.speak(utterance);
    }

    createFloatingNumbers() {
        const container = document.getElementById('floating-numbers');
        container.innerHTML = '';
        
        // Create 6 random numbers including the target number
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
            
            // Random position
            element.style.left = `${Math.random() * (container.offsetWidth - 70)}px`;
            element.style.top = `${Math.random() * (container.offsetHeight - 70)}px`;
            
            element.addEventListener('click', () => this.checkNumberSelection(num));
            container.appendChild(element);
            
            // Animate floating
            this.animateFloating(element);
        });
    }

    animateFloating(element) {
        let x = parseFloat(element.style.left);
        let y = parseFloat(element.style.top);
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;

        const animate = () => {
            x += dx;
            y += dy;

            // Bounce off walls
            if (x <= 0 || x >= element.parentElement.offsetWidth - 70) dx *= -1;
            if (y <= 0 || y >= element.parentElement.offsetHeight - 70) dy *= -1;

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            requestAnimationFrame(animate);
        };

        animate();
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
                // For Mayan: multiplication or division
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
                // For Tamar and Yael: addition
                const num2 = Math.floor(Math.random() * 10) + 1;
                if (index === 0) {
                    equation = `${this.selectedNumber} + ${num2} = ?`;
                    this.exerciseAnswers[index] = this.selectedNumber + num2;
                } else {
                    equation = `${num2} + ${this.selectedNumber} = ?`;
                    this.exerciseAnswers[index] = num2 + this.selectedNumber;
                }
            }

            exercise.querySelector('.equation').textContent = equation;
            this.createNumberOptions(exercise, index);
        });

        // Show only the first exercise initially
        exercises[1].style.display = 'none';
        
        // Add exercise navigation dots
        const nav = document.createElement('div');
        nav.className = 'exercise-nav';
        nav.innerHTML = `
            <div class="exercise-dot active"></div>
            <div class="exercise-dot"></div>
        `;
        document.getElementById('math-exercises').appendChild(nav);
    }

    createNumberOptions(exercise, index) {
        const optionsContainer = exercise.querySelector('.number-options');
        optionsContainer.innerHTML = '';
        
        // Create number options (0-9)
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

        // Add new number
        this.selectedDigits[exerciseIndex].push(number);
        option.classList.add('selected-number');
        
        // Update count indicator
        const count = this.selectedDigits[exerciseIndex].filter(n => n === number).length;
        option.setAttribute('data-count', count);
        
        // Add the selected image to the answer area
        const img = document.createElement('img');
        img.src = `images/${this.currentPlayer}/${this.currentPlayer}${number}.jpg`;
        img.dataset.number = number;
        selectedNumbers.appendChild(img);

        // Add click handler to remove number from answer
        img.addEventListener('click', () => {
            // Remove the image
            img.remove();
            
            // Remove the number from selected digits
            const index = this.selectedDigits[exerciseIndex].indexOf(number);
            if (index !== -1) {
                this.selectedDigits[exerciseIndex].splice(index, 1);
            }
            
            // Update count indicator
            const newCount = this.selectedDigits[exerciseIndex].filter(n => n === number).length;
            if (newCount === 0) {
                option.classList.remove('selected-number');
                option.removeAttribute('data-count');
            } else {
                option.setAttribute('data-count', newCount);
            }
            
            // Check answer after removal
            this.checkAnswer(exerciseIndex);
        });

        // Check answer after adding
        this.checkAnswer(exerciseIndex);
    }

    checkAnswer(exerciseIndex) {
        const exercise = document.querySelectorAll('.exercise')[exerciseIndex];
        const answer = this.exerciseAnswers[exerciseIndex];
        const selectedNumber = parseInt(this.selectedDigits[exerciseIndex].join(''));
        
        if (selectedNumber === answer) {
            this.successSound.play();
            this.createCelebration();
            exercise.style.backgroundColor = '#90EE90';
            exercise.classList.add('success');
            this.completedExercises++;
            
            if (this.completedExercises === 1) {
                // Show the second exercise
                setTimeout(() => {
                    document.querySelectorAll('.exercise')[1].style.display = 'flex';
                    document.querySelectorAll('.exercise-dot')[1].classList.add('active');
                }, 1000);
            } else if (this.completedExercises === 2) {
                setTimeout(() => {
                    this.showStage('number-drawing');
                    document.getElementById('drawing-number').textContent = this.selectedNumber;
                }, 1000);
            }
        } else if (this.selectedDigits[exerciseIndex].length === answer.toString().length) {
            this.errorSound.play();
            exercise.style.backgroundColor = '#FFB6C1';
            setTimeout(() => {
                this.selectedDigits[exerciseIndex] = [];
                exercise.querySelectorAll('.number-option').forEach(opt => {
                    opt.classList.remove('selected-number');
                    opt.removeAttribute('data-count');
                });
                exercise.querySelector('.selected-numbers').innerHTML = '';
                exercise.style.backgroundColor = '';
            }, 1000);
        }
    }

    createCelebration() {
        const emojis = ['🎉', '✨', '🎊', '🌟', '💫', '🎈', '🎨', '🎯', '🎪', '🎭'];
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        
        for (let i = 0; i < 30; i++) {
            const celebration = document.createElement('div');
            celebration.className = 'celebration';
            celebration.style.left = Math.random() * window.innerWidth + 'px';
            celebration.style.top = Math.random() * window.innerHeight + 'px';
            
            // Random emoji
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            celebration.textContent = emoji;
            
            // Random color
            celebration.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random size
            const size = Math.random() * 20 + 20;
            celebration.style.fontSize = `${size}px`;
            
            // Random rotation
            celebration.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            document.body.appendChild(celebration);
            
            setTimeout(() => celebration.remove(), 2000);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    finishDrawing() {
        this.showStage('player-selection');
        this.resetGame();
    }

    showStage(stage) {
        document.querySelectorAll('.game-stage').forEach(s => s.classList.remove('active'));
        document.getElementById(stage).classList.add('active');
        this.currentStage = stage;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new MathGame();
}); 