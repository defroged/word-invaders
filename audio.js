let audioContext;

// Initialize audio context on user interaction
document.addEventListener('click', function initializeAudio() {
    audioContext = new(window.AudioContext || window.webkitAudioContext)();
    document.removeEventListener('click', initializeAudio);
});

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

const playTenPointsSound = async () => {
    const tenPointsAudioBuffer = await createAudioBuffer('audio/ten_points.mp3');
    setTimeout(() => {
        playAudioBuffer(tenPointsAudioBuffer);
    }, 10); 
};

const playUnderTenPointsSound = async () => {
    const underTenPointsAudioBuffer = await createAudioBuffer('audio/under_ten_points.mp3');
    setTimeout(() => {
        playAudioBuffer(underTenPointsAudioBuffer);
    }, 10); 
};

let hitAudio, wrongAudio;

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

async function updateWordAudioFiles() {
    const audioPromises = stage2Words.map((word) => {
        return loadAudioFile(`audio/${word}.mp3`).then((audio) => {
            wordAudioFiles[word] = audio;
        });
    });

    await Promise.all(audioPromises);
}
