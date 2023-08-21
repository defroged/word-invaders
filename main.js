const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let animationStartTime = null;

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

document.addEventListener("DOMContentLoaded", function() {
    initializeGlobals();  // Initialize global variables and constants
    init();               // Initialize the rest of the game
});
