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
let sequenceSound;      // Sound for sequence playback
let playerClickSound;   // Sound for player button clicks (NEW)

// --- Game Logic ---

/** Creates the four initial buttons and sets up audio elements. (UPDATED) */
function initializeGame() {
    // 1. Setup Audio Elements
    sequenceSound = new Audio('./Space_Button.mp3'); 
    sequenceSound.preload = 'auto';
    sequenceSound.volume = 0.5; 

    // NEW: Use the same sound file for player clicks, but you can change the name later
    playerClickSound = new Audio('./Space_Button.mp3'); 
    playerClickSound.preload = 'auto';
    playerClickSound.volume = 0.3; // Slightly softer feedback sound

    // 2. Setup Buttons
    COLOR_NAMES.forEach(colorName => {
        const button = document.createElement('button');
        button.classList.add('sequence-button', colorName);
        button.style.backgroundColor = COLORS[colorName];
        button.textContent = colorName.toUpperCase();
        button.setAttribute('data-color', colorName);
        button.addEventListener('click', handlePlayerClick);
        sequenceDisplay.appendChild(button);
    });
    
    // Start the game loop
    setTimeout(newRound, 1000);
}

/** Displays the sequence to the player (Plays sequenceSound). */
function displaySequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < gameSequence.length) {
            const color = gameSequence[i];
            const button = document.querySelector(`.sequence-button.${color}`);
            
            button.classList.add('active');
            
            // 🔊 Play the sequence cue sound
            sequenceSound.currentTime = 0; 
            sequenceSound.play().catch(e => console.log('Audio playback blocked:', e)); 
            
            setTimeout(() => {
                button.classList.remove('active');
            }, 500); 
            
            i++;
        } else {
            clearInterval(interval);
            messageElement.textContent = "Your turn! Repeat the sequence.";
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'auto');
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '1'); 
            isPlaying = true;
            playerSequence = [];
        }
    }, 800); 
}

/** Handles the player clicking one of the buttons. (UPDATED to play sound) */
function handlePlayerClick(event) {
    if (!isPlaying) return;

    // 🔊 Play the player click sound immediately
    playerClickSound.currentTime = 0;
    playerClickSound.play().catch(e => console.log('Audio playback blocked:', e));
    
    const clickedColor = event.target.getAttribute('data-color');
    playerSequence.push(clickedColor);

    const currentStep = playerSequence.length - 1;
    
    // Check if the current click matches the sequence
    if (playerSequence[currentStep] === gameSequence[currentStep]) {
        // Correct logic remains the same
        
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
        // Incorrect logic remains the same
        messageElement.textContent = "MISSION FAILED! Watch the sequence again.";
        document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'none');
        document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '0.5'); 
        isPlaying = false;
        
        setTimeout(newRound, 2500); 
    }
}

/** Generates a new random sequence. (Includes difficulty increase) */
function generateSequence() {
    gameSequence = [];
    // Increase sequence length every 3 successful rounds
    if (score > 0 && score % 3 === 0) {
        sequenceLength++;
        messageElement.textContent = `LEVEL UP! Sequence length is now ${sequenceLength}!`;
    }
    
    for (let i = 0; i < sequenceLength; i++) {
        const randomColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        gameSequence.push(randomColor);
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
