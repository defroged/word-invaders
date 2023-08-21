const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const audioContext = new(window.AudioContext || window.webkitAudioContext)();

const createAudioBuffer = async (url) => {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	return audioBuffer;
};
const playAudioBuffer = (buffer) => {
	const source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	source.start();
};

let bulletAudioBuffer;
let gameOverAudioBuffer;
let animationStartTime = null;


const loadBulletSound = async () => {
	bulletAudioBuffer = await createAudioBuffer('audio/bullet.mp3');
};

loadBulletSound();

const loadGameOverSound = async () => {
	gameOverAudioBuffer = await createAudioBuffer('audio/game_over.mp3');
};

loadGameOverSound();

const playTenPointsSound = async () => {
	const tenPointsAudioBuffer = await createAudioBuffer('audio/ten_points.mp3');
	setTimeout(() => {
    	playAudioBuffer(tenPointsAudioBuffer);
	}, 10); // Delay
};
const playUnderTenPointsSound = async () => {
	const underTenPointsAudioBuffer = await createAudioBuffer('audio/under_ten_points.mp3');
	setTimeout(() => {
    	playAudioBuffer(underTenPointsAudioBuffer);
	}, 10); // Delay
};

// Game objects
const words = ['cat', 'dog', 'ball', 'girl', 'pig'];

// Stage 2 game objects
const stage2Words = ['and', 'this', 'the', 'like', 'see'];
const stage2SpaceshipImage = new Image();
stage2SpaceshipImage.src = 'images/invader2.png';


// Word audio files
const wordAudioFiles = {};

// Images
const spaceshipImage = new Image();
spaceshipImage.src = 'images/invader1.png';

const playerImage = new Image();
playerImage.src = 'images/player.png';

const gameOverImage = new Image();
gameOverImage.src = 'images/game_over.png';

const explosionImage = new Image();
explosionImage.src = 'images/explosion.png';


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

// Word audio
let hitAudio, wrongAudio;


// speed modifier
let speedModifier = 0.5;
let isGameOver = false;

const playerName = "player";

let invaderPadding = 10;

const loadAudioFile = (src) => {
	return new Promise((resolve) => {
    	const audio = new Audio(src);
    	audio.addEventListener('canplaythrough', () => {
        	resolve(audio);
    	});
	});
};

const preloadWordAudioFiles = async () => {
	const audioPromises = words.map((word) => {
    	return loadAudioFile(`audio/${word}.mp3`).then((audio) => {
        	wordAudioFiles[word] = audio;
    	});
	});

	await Promise.all(audioPromises);
};

let remainingWords = [...words];

const playWordAudio = () => {
	// Refill the remainingWords array if it's empty
	if (remainingWords.length === 0) {
    	remainingWords = [...words];
	}

	// Pick a random word from the remainingWords array
	const randomIndex = Math.floor(Math.random() * remainingWords.length);
	currentWord = remainingWords[randomIndex];
	remainingWords.splice(randomIndex, 1); // Remove the chosen word from the remainingWords array

	const wordAudio = wordAudioFiles[currentWord];

	if (!wordAudio) {
    	console.error(`Audio not found for word: ${currentWord}`);
    	return;
	}

	// Stop the current word audio before playing the new one
	for (const audio of Object.values(wordAudioFiles)) {
    	audio.pause();
    	audio.currentTime = 0;
	}

	wordAudio.currentTime = 0;
	wordAudio.play();
};


const shootBullet = () => {
	const bulletX = player.x + player.width / 2 - 2.5;
	const bulletY = player.y;
	const bullet = new Bullet(bulletX, bulletY);
	bullets.push(bullet);

	// Play the bullet sound effect
	playAudioBuffer(bulletAudioBuffer);
};


let scoreColor = 'white';

const gameLoop = (timestamp) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(playerImage, player.x, player.y, 107, 115);

	ctx.fillStyle = 'red';
	bullets.forEach((bullet) => {
    	ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
	});

	ctx.fillStyle = 'white';
	ctx.font = '30px Comic Sans MS';
	wordInvaders.forEach((wordInvader) => {
    	if (!wordInvader.isHit) {
        	ctx.drawImage(
            	spaceshipImage,
            	wordInvader.x - wordInvader.invaderWidth / 2,
            	wordInvader.y - 20,
            	wordInvader.invaderWidth,
            	wordInvader.invaderHeight
        	);
    	}

    	const textWidth = ctx.measureText(wordInvader.text).width;
    	const centeredTextX = wordInvader.x - textWidth / 2;

    	// Draw a black rectangle behind the text
    	const textHeight = parseInt(ctx.font, 8); // Get the font size from the ctx.font property
    	const padding = 5; // Add some padding around the text
    	ctx.fillStyle = '#383838';
    	ctx.fillRect(centeredTextX - padding, wordInvader.y + wordInvader.height - textHeight + padding, textWidth + 2 * padding, textHeight);

    	// Draw the text on top of the black rectangle
    	ctx.fillStyle = wordInvader.isHit ? 'transparent' : 'white';
    	ctx.fillText(wordInvader.text, centeredTextX, wordInvader.y + wordInvader.height + 10);
    	// Update word invader positions
    	if (performance.now() > wordInvader.fallingDelay) {
        	wordInvader.y += wordInvader.speed * speedModifier;
    	}
    	if (wordInvader.isHit) {
        	const scaleFactor = 1.5;
        	ctx.drawImage(explosionImage, wordInvader.x - (wordInvader.invaderWidth * scaleFactor) / 2, wordInvader.y - 20, wordInvader.invaderWidth * scaleFactor, wordInvader.invaderHeight * scaleFactor);


        	if (wordInvader.explosionStartTime === null) {
            	wordInvader.explosionStartTime = performance.now();
        	}

        	if (performance.now() - wordInvader.explosionStartTime >= 1000) {
            	wordInvaders.splice(wordInvaders.indexOf(wordInvader), 1);
        	}
    	}
	});

	ctx.fillStyle = scoreColor;
	ctx.font = '24px Orbitron';
	ctx.fillText(`Score: ${score}`, 10, 30);

	// Draw the "Level up" text
	ctx.font = score < 10 ? '12px Orbitron' : '20px Orbitron';
	ctx.fillStyle = score < 10 ? 'gray' : 'lawngreen';
	ctx.fillText('Level up', 10, 60);

	bullets.forEach((bullet, index) => {
    	bullet.y -= bullet.speed;

    	// Remove bullets that are off the screen
    	if (bullet.y < 0) {
        	bullets.splice(index, 1);
    	}
	});


	// Collision detection
	bullets.forEach((bullet, bulletIndex) => {
    	wordInvaders.forEach((wordInvader, wordIndex) => {
        	if (
            	bullet.x < wordInvader.x + wordInvader.invaderWidth / 2 + invaderPadding &&
            	bullet.x + bullet.width > wordInvader.x - wordInvader.invaderWidth / 2 - invaderPadding &&
            	bullet.y < wordInvader.y + wordInvader.height &&
            	bullet.y + bullet.height > wordInvader.y
        	) {
            	if (wordInvader.text === currentWord) {
                	playAudioBuffer(hitAudioBuffer);

                	bullets.splice(bulletIndex, 1);
                	wordInvader.isHit = true;

                	// Draw the explosion image at the wordInvader's position
                	ctx.drawImage(explosionImage, wordInvader.x - wordInvader.invaderWidth / 2, wordInvader.y - 20, wordInvader.invaderWidth, wordInvader.invaderHeight);

                	// Clear the explosion image after half a second
                	setTimeout(() => {
                    	ctx.clearRect(wordInvader.x - wordInvader.invaderWidth / 2, wordInvader.y - 20, wordInvader.invaderWidth, wordInvader.invaderHeight);
                	}, 500);

                	setTimeout(() => {
                    	playWordAudio();
                	}, 500);

                	score++;

                	if (score === 10) {
                    	playTenPointsSound();
                	}
                	scoreColor = 'green';
                	setTimeout(() => {
                    	scoreColor = 'white';
                	}, 500);
                	// Increase the speed modifier
                	speedModifier *= 1.1;

                	// Update the global scoreboard
                	globalScoreboard[playerName] = score;

                	setTimeout(() => {
                    	// Remove all wordInvaders
                    	wordInvaders.splice(0, wordInvaders.length);
                	}, 200);
            	} else {
                	playAudioBuffer(wrongAudioBuffer);

                	// Add a condition to play the "under_ten_points" sound when the score goes from 10 to 9
                	if (score === 10) {
                    	playUnderTenPointsSound();
                	}

                	bullets.splice(bulletIndex, 1);
                	score--;
                	scoreColor = 'red';
                	setTimeout(() => {
                    	scoreColor = 'white';
                	}, 500);
            	}

        	}
    	});
	});

	// detect when invaders reach bottom of screen
	wordInvaders.forEach((wordInvader) => {
    	if (wordInvader.y + wordInvader.invaderHeight >= canvas.height) {
        	isGameOver = true;
    	}
	});

	// Player movement
	if (keys.ArrowLeft && player.x > 0) {
    	player.x -= playerSpeed;
	}

	if (keys.ArrowRight && player.x + player.width < canvas.width) {
    	player.x += playerSpeed;
	}

	if (wordInvaders.length === 0) {
    	bullets.length = 0;
    	spawnWordInvaders();
	}
	if (isGameOver) {
    	showGameOverScreen();
    	return;
	}

	requestAnimationFrame(gameLoop);
};

document.addEventListener('keydown', (event) => {
	if (event.code in keys) {
    	keys[event.code] = true;

    	if (event.code === 'Space' && !spacebarPressed) {
        	spacebarPressed = true;
        	shootBullet();
    	}
	}
});

document.addEventListener('keyup', (event) => {
	if (event.code in keys) {
    	keys[event.code] = false;

    	if (event.code === 'Space') {
        	spacebarPressed = false;
    	}
	}
});

canvas.addEventListener('click', (event) => {
	if (!isGameOver) {
    	return;
	}

	// Get the mouse click coordinates relative to the canvas
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	/// Check if the click is inside the "No" button
	if (
    	mouseX >= canvas.width / 2 + 20 &&
    	mouseX <= canvas.width / 2 + 120 &&
    	mouseY >= canvas.height / 2 &&
    	mouseY <= canvas.height / 2 + 50
	) {
    	// If the player clicks "No", you can choose to end the game or show the main menu
    	console.log('Game Over. Thanks for playing!'); // This is a placeholder for now
	}
});

function resetGameState() {
	isGameOver = false;
	score = 0;
	speedModifier = 0.5;
	wordInvaders.length = 0;
	playWordAudio();
	spawnWordInvaders();
}

// Add the displayScoreAnimation function
const displayScoreAnimation = async (targetScore) => {
	const startTime = performance.now();
	const animationDuration = 1000; // 1000 ms = 1 second
	let currentDisplayedScore = 0;

	const animateScore = () => {
    	const elapsedTime = performance.now() - startTime;
    	const progress = Math.min(elapsedTime / animationDuration, 1);
    	currentDisplayedScore = Math.floor(progress * targetScore);

    	// Clear the previous score
    	ctx.clearRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 150);

    	// Draw the "overall score:" text
    	ctx.fillStyle = 'white';
    	ctx.font = '30px Orbitron';
    	ctx.fillText('Overall score:', canvas.width / 2 - 90, canvas.height / 2 - 50);

    	// Draw the animated score
    	ctx.fillText(currentDisplayedScore, canvas.width / 2 - 20, canvas.height / 2);

    	if (currentDisplayedScore < targetScore) {
        	requestAnimationFrame(animateScore);
    	}
	};

	animateScore();
};

function showGameOverScreen() {
	playAudioBuffer(gameOverAudioBuffer);
	// Determine if the player has completed the stage
	const isStageComplete = score >= 10;

	if (isStageComplete) {
    	// Stop the current audio
    	wordAudioFiles[currentWord].pause();
    	wordAudioFiles[currentWord].currentTime = 0;
    	// Display the animated score
    	displayScoreAnimation(score);

    	setTimeout(() => {
        	// Increase the speed modifier for the next stage
        	speedModifier += 0.25;

        	// Reset game state and start a new game
        	resetGameState();

        	// Start the second stage
        	startSecondStage();

        	// Start the game loop
        	requestAnimationFrame(gameLoop);

    	}, 5000); // Start the next stage after 5 seconds
	} else {
    	// Draw the game over image
    	ctx.drawImage(gameOverImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 150);

    	// Draw the "Try Again?" text
    	ctx.fillStyle = 'white';
    	ctx.font = '30px Orbitron';
    	ctx.fillText('Try Again?', canvas.width / 2 - 75, canvas.height / 2 + 50);

    	// Add a click event listener to the canvas to restart the game
    	canvas.addEventListener('click', (event) => {
        	// Get the mouse click coordinates relative to the canvas
        	const rect = canvas.getBoundingClientRect();
        	const mouseX = event.clientX - rect.left;
        	const mouseY = event.clientY - rect.top;

        	// Check if the click is inside the "Try Again?" text area
        	if (
            	mouseX >= canvas.width / 2 - 75 &&
            	mouseX <= canvas.width / 2 + 75 &&
            	mouseY >= canvas.height / 2 + 20 &&
            	mouseY <= canvas.height / 2 + 80
        	) {
            	// Reset game state and start a new game
            	resetGameState();

            	// Start the game loop
            	requestAnimationFrame(gameLoop);
        	}
    	}, {
        	once: true
    	});
	}
}

const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
    	const j = Math.floor(Math.random() * (i + 1));
    	[array[i], array[j]] = [array[j], array[i]];
	}
};

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

const init = async () => {
	await preloadWordAudioFiles();

	// Load the hit and wrong audio files
	hitAudioBuffer = await createAudioBuffer('audio/hit.mp3');

	wrongAudioBuffer = await createAudioBuffer('audio/wrong.mp3');


	// Spawn word invaders
	spawnWordInvaders();

	// Add a click event listener to the canvas to start the game
	canvas.addEventListener('click', startGame, {
    	once: true
	});

	// Show a "Click to start" message on the canvas
	ctx.fillStyle = 'white';
	ctx.font = '30px Orbitron';
	ctx.fillText('Click to start', canvas.width / 2 - 80, canvas.height / 2);
};

const startGame = () => {
	// Start the game loop
	requestAnimationFrame(gameLoop);

	// Play the first word audio
	playWordAudio();

};

async function updateWordAudioFiles() {
	const audioPromises = stage2Words.map((word) => {
    	return loadAudioFile(`audio/${word}.mp3`).then((audio) => {
        	wordAudioFiles[word] = audio;
    	});
	});

	await Promise.all(audioPromises);
}

function startSecondStage() {
	// Update the words array for the second stage
	words.splice(0, words.length, ...stage2Words);

	// Update the remainingWords array for the second stage
	remainingWords = [...stage2Words];

	// Clear the wordInvaders array
	wordInvaders.length = 0;

	// Update the wordAudioFiles object with the new audio files
	updateWordAudioFiles().then(() => {
    	playWordAudio();

	});

	// Spawn word invaders for the second stage
	spawnWordInvaders();

	// Update the spaceship image for the second stage
	spaceshipImage.src = stage2SpaceshipImage.src;
}

init();
