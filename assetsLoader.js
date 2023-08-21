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

let bulletAudioBuffer;
let gameOverAudioBuffer;

const loadBulletSound = async () => {
	bulletAudioBuffer = await createAudioBuffer('audio/bullet.mp3');
};

loadBulletSound();

const loadGameOverSound = async () => {
	gameOverAudioBuffer = await createAudioBuffer('audio/game_over.mp3');
};

loadGameOverSound();

// Update the spaceship image for the second stage
spaceshipImage.src = stage2SpaceshipImage.src;

