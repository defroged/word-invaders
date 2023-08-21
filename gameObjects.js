
const stage2SpaceshipImage = new Image();
stage2SpaceshipImage.src = 'images/invader2.png';

// Add the keys object
const keys = {
	ArrowLeft: false,
	ArrowRight: false,
	Space: false,
};

let spacebarPressed = false;
let currentWord = '';
const player = {
	x: canvas.width / 2,
	y: canvas.height - 150,
	width: 100,
	height: 20
};
let score = 0;
const bullets = [];
const wordInvaders = [];

// Global scoreboard
const globalScoreboard = {};

// Player speed and movement
const playerSpeed = 10;
let speedModifier = 0.5;
let isGameOver = false;
const playerName = "player";
let invaderPadding = 10;

class WordInvader {
    constructor(x, y, speed, text) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.text = text;
        this.height = 20;
        this.invaderWidth = 100;
        this.invaderHeight = 50;
        this.isHit = false;
        this.fallingDelay = performance.now() + 1000; // 1000 ms delay
        this.explosionStartTime = null;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 10;
    }
}

const spawnWordInvaders = () => {
	const commonSpeed = 1.5;
	const commonY = 60;

	// Shuffle the words array
	const shuffledWords = [...words];
	shuffleArray(shuffledWords);

	shuffledWords.forEach((word, index) => {
    	const x = (canvas.width / (shuffledWords.length + 1)) * (index + 1);
    	const y = commonY;
    	const speed = commonSpeed;
    	const text = word;
    	const wordInvader = new WordInvader(x, y, speed, text);

    	wordInvaders.push(wordInvader);
	});
};