const gameBoard = document.getElementById('game-board');
const scoreList = document.getElementById('score-list');
const message = document.getElementById('message');
const messageText = document.getElementById('message-text');
const overlay = document.getElementById('overlay');
const closeMessage = document.getElementById('close-message');
let snake = [{ x: 200, y: 200 }];
let food = getRandomPosition();
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 150;
let gameLoop;
let previousScores = JSON.parse(localStorage.getItem('snakeScores')) || [];
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('close-instructions').addEventListener('click', function () {
    document.getElementById('mobile-instructions').style.display = 'none';
});

document.getElementById('game-board').addEventListener('touchstart', handleTouchStart);
document.getElementById('game-board').addEventListener('touchmove', handleTouchMove);

document.getElementById('show-history').addEventListener('click', function () {
    const scoreList = document.getElementById('score-list');
    const clearButton = document.getElementById('clear-history');

    if (scoreList.style.display === 'none') {
        scoreList.style.display = 'block';
        this.textContent = 'Esconder Histórico';
        clearButton.style.display = 'inline-block';
    } else {
        scoreList.style.display = 'none';
        this.textContent = 'Mostrar Histórico';
        clearButton.style.display = 'none';
    }
});

document.getElementById('clear-history').addEventListener('click', function () {
    localStorage.removeItem('snakeScores');
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
    this.style.display = 'none';
    previousScores = [];
});

document.getElementById('easy-button').addEventListener('click', () => {
    gameSpeed = 150;
    highlightButton('easy-button');
});

document.getElementById('medium-button').addEventListener('click', () => {
    gameSpeed = 120;
    highlightButton('medium-button');
});

document.getElementById('hard-button').addEventListener('click', () => {
    gameSpeed = 80;
    highlightButton('hard-button');
});

document.getElementById('start-button').addEventListener('click', () => {
    restartGame();
});

closeMessage.addEventListener('click', () => {
    message.classList.remove('active');
    overlay.classList.remove('active');
});

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
    if (!touchStartX || !touchStartY) {
        return;
    }

    let touchEndX = event.touches[0].clientX;
    let touchEndY = event.touches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            handleKeyDown({ key: 'd' });
        } else {
            handleKeyDown({ key: 'a' });
        }
    } else {
        if (dy > 0) {
            handleKeyDown({ key: 's' });
        } else {
            handleKeyDown({ key: 'w' });
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}

function draw() {
    gameBoard.innerHTML = '';
    const foodElement = document.createElement('div');
    foodElement.style.left = food.x + 'px';
    foodElement.style.top = food.y + 'px';
    foodElement.classList.add('food');
    gameBoard.appendChild(foodElement);

    snake.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.left = segment.x + 'px';
        snakeElement.style.top = segment.y + 'px';
        snakeElement.classList.add(index === 0 ? 'snake-head' : 'snake');

        if (index === 0) {
            const leftEye = document.createElement('div');
            const rightEye = document.createElement('div');
            const tongue = document.createElement('div');
            leftEye.classList.add('snake-eye');
            rightEye.classList.add('snake-eye');
            tongue.classList.add('snake-tongue');

            leftEye.style.left = '6px';
            leftEye.style.top = '6px';
            rightEye.style.left = '12px';
            rightEye.style.top = '6px';
            tongue.style.left = '6px';
            tongue.style.top = '14px';

            snakeElement.appendChild(leftEye);
            snakeElement.appendChild(rightEye);
            snakeElement.appendChild(tongue);
        }

        gameBoard.appendChild(snakeElement);
    });
}

function getRandomPosition() {
    const x = Math.floor(Math.random() * 20) * 20;
    const y = Math.floor(Math.random() * 20) * 20;
    return { x, y };
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const collisionThreshold = 10;
    if (
        head.x >= food.x - collisionThreshold &&
        head.x <= food.x + collisionThreshold &&
        head.y >= food.y - collisionThreshold &&
        head.y <= food.y + collisionThreshold
    ) {
        food = getRandomPosition();
        score++;
        clearInterval(gameLoop);
        if (gameSpeed > 50) {
            gameSpeed -= 5;
        }
        gameLoop = setInterval(moveSnake, gameSpeed);
    } else {
        snake.pop();
    }

    if (
        head.x < 0 ||
        head.x >= 400 ||
        head.y < 0 ||
        head.y >= 400 ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y && head !== segment)
    ) {
        clearInterval(gameLoop);
        endGame();
    }

    draw();
}

function endGame() {
    messageText.textContent = `Game Over! Pontuação: ${score}`;
    message.classList.add('active');
    overlay.classList.add('active');
    updateScoreList();
    previousScores.push(score);
    localStorage.setItem('snakeScores', JSON.stringify(previousScores));
    snake = [{ x: 200, y: 200 }];
    food = getRandomPosition();
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 150;
    draw();
}

function handleKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (dy !== 20) {
                dy = -20;
                dx = 0;
            }
            break;
        case 'ArrowDown':
        case 's':
            if (dy !== -20) {
                dy = 20;
                dx = 0;
            }
            break;
        case 'ArrowLeft':
        case 'a':
            if (dx !== 20) {
                dx = -20;
                dy = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
            if (dx !== -20) {
                dx = 20;
                dy = 0;
            }
            break;
    }
}

function highlightButton(buttonId) {
    const buttons = ['easy-button', 'medium-button', 'hard-button'];
    buttons.forEach(id => {
        const button = document.getElementById(id);
        if (id === buttonId) {
            button.style.backgroundColor = '#008000';
            button.style.fontWeight = 'bold';
        } else {
            button.style.backgroundColor = '#4caf50';
            button.style.fontWeight = 'normal';
        }
    });
}

function updateScoreList() {
    scoreList.innerHTML = '';
    previousScores.forEach(score => {
        const scoreItem = document.createElement('li');
        scoreItem.textContent = `Pontuação: ${score}`;
        scoreList.appendChild(scoreItem);
    });
}

function startGame() {
    snake = [{ x: 200, y: 200 }];
    food = getRandomPosition();
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 150;
    draw();
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    gameLoop = setInterval(moveSnake, gameSpeed);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
}

function restartGame() {
    message.classList.remove('active');
    overlay.classList.remove('active');
    startGame();
    document.body.style.overflow = 'auto';
}

document.getElementById('close-instructions').addEventListener('click', function () {
    document.getElementById('mobile-instructions').style.display = 'none';
});

