// --- Game Configuration ---
const COLORS = {
    red: '#FF4500',
    blue: '#1E90FF',
    green: '#3CB371',
    yellow: '#FFD700'
};
const COLOR_NAMES = Object.keys(COLORS); 

let gameSequence = []; 
let playerSequence = []; 
let sequenceLength = 3; 
let score = 0;
const SCORE_TO_WIN = 10;
let isPlaying = false; 

// --- DOM Elements ---
const messageElement = document.getElementById('message');
const scoreElement = document.getElementById('score');
const sequenceDisplay = document.getElementById('sequence-display');
let sequenceSound;      
let playerClickSound;   
let startButton; 

// --- Game Logic ---

/** Initializes DOM elements only. Audio loading is moved to startGame(). */
function initializeGame() {
    // 1. Get the start button reference and prepare it
    startButton = document.getElementById('start-button');
    // We attach the listener here, but the function itself now loads audio
    startButton.addEventListener('click', startGame);

    // 2. Setup Buttons (Still needed for the DOM structure)
    COLOR_NAMES.forEach(colorName => {
        const button = document.createElement('button');
        button.classList.add('sequence-button', colorName);
        button.style.backgroundColor = COLORS[colorName];
        button.textContent = colorName.toUpperCase();
        button.setAttribute('data-color', colorName);
        button.addEventListener('click', handlePlayerClick);
        sequenceDisplay.appendChild(button);
    });
}

/** Function called ONLY by the user's first click to unlock audio and start the game. (NEW FIX) */
function startGame() {
    // 🌟🌟🌟 THE CRITICAL FIX IS HERE 🌟🌟🌟
    // 1. Create and initialize audio objects ONLY after the user clicks
    sequenceSound = new Audio('./Space_Button.mp3'); 
    sequenceSound.preload = 'auto';
    sequenceSound.volume = 0.5; 

    playerClickSound = new Audio('./Space_Button.mp3'); 
    playerClickSound.preload = 'auto';
    playerClickSound.volume = 0.3; 
    
    // 2. Hide the start screen immediately
    document.getElementById('start-screen').style.display = 'none';
    messageElement.textContent = "Get ready!";
    
    // 3. Prevent this function from running again
    startButton.removeEventListener('click', startGame);

    // 4. Start the game loop after a brief delay
    setTimeout(newRound, 1000); 
}

/** Displays the sequence to the player (Plays sequenceSound). (1200ms delay) */
function displaySequence() {
    let i = 0;
    const lightDuration = 500;
    const intervalDelay = 1200; 

    const interval = setInterval(() => { 
        if (i < gameSequence.length) {
            const color = gameSequence[i];
            const button = document.querySelector(`.sequence-button.${color}`);
            
            button.classList.add('active');
            
            // Play the sequence cue sound
            // This is now guaranteed to work because audio objects were created during the click.
            sequenceSound.currentTime = 0; 
            sequenceSound.play().catch(e => console.log('Audio playback failed:', e)); 
            
            setTimeout(() => {
                button.classList.remove('active');
            }, lightDuration); 
            
            i++;
        } else {
            clearInterval(interval);
            messageElement.textContent = "Your turn! Repeat the sequence.";
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'auto');
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '1'); 
            isPlaying = true;
            playerSequence = [];
        }
    }, intervalDelay); 
}

/** Generates a new random sequence. (Includes difficulty increase) */
function generateSequence() {
    gameSequence = [];
    if (score > 0 && score % 3 === 0) {
        sequenceLength++;
        messageElement.textContent = `LEVEL UP! Sequence length is now ${sequenceLength}!`;
    }
    
    for (let i = 0; i < sequenceLength; i++) {
        const randomColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        gameSequence.push(randomColor);
    }
}

/** Handles the player clicking one of the buttons. (Plays player click sound) */
function handlePlayerClick(event) {
    if (!isPlaying) return;

    // Play the player click sound immediately
    playerClickSound.currentTime = 0;
    playerClickSound.play().catch(e => console.log('Audio playback failed:', e));
    
    const clickedColor = event.target.getAttribute('data-color');
    playerSequence.push(clickedColor);

    const currentStep = playerSequence.length - 1;
    
    // Check if the current click matches the sequence
    if (playerSequence[currentStep] === gameSequence[currentStep]) {
        // Correct logic
        if (playerSequence.length === gameSequence.length) {
            score++;
            scoreElement.textContent = "Score: " + score;
            messageElement.textContent = "SUCCESS! Get ready for the next sequence.";
            
            if (score >= SCORE_TO_WIN) {
                handleWin();
                return;
            }
            
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'none');
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '0.5'); 
            isPlaying = false;
            setTimeout(newRound, 1800); 
        }
    } else {
        // Incorrect logic
        messageElement.textContent = "MISSION FAILED! Watch the sequence again.";
        document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'none');
        document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '0.5'); 
        isPlaying = false;
        
        setTimeout(newRound, 2500); 
    }
}

/** Handles the winning condition for Game 4. */
function handleWin() {
    messageElement.textContent = "🎉 SERIES COMPLETE! You are a Cosmic Sequence Master!";
    scoreElement.textContent = "Final Score: " + score;
    
    sequenceDisplay.innerHTML = '';
    const congratsMessage = document.createElement('h2');
    congratsMessage.textContent = "Thank you for playing Cosmic Crew Adventures!";
    congratsMessage.style.color = '#4B0082';
    
    sequenceDisplay.appendChild(congratsMessage);
}

/** Sets up and starts a new round. */
function newRound() {
    generateSequence();
    messageElement.textContent = "WATCH! Sequence length: " + sequenceLength;
    isPlaying = false;
    
    // Give a brief moment before the sequence starts
    setTimeout(displaySequence, 1500);
}


// --- Start the Game! ---
initializeGame();
