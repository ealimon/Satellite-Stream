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
let sequenceLength = 3; // Starts easy with a 3-step sequence
let score = 0;
const SCORE_TO_WIN = 10;
let isPlaying = false; 

// --- DOM Elements ---
const messageElement = document.getElementById('message');
const scoreElement = document.getElementById('score');
const sequenceDisplay = document.getElementById('sequence-display');
let sequenceSound; 

// --- Game Logic ---

/** Creates the four initial buttons and starts the game. (UPDATED WITH CORRECT SOUND FILE NAME) */
function initializeGame() {
    // 1. Setup Audio Element
    sequenceSound = new Audio('./Space_Button.mp3'); 
    sequenceSound.preload = 'auto';
    sequenceSound.volume = 0.5; // Set volume to 50% for a soft sound

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

/** Displays the sequence to the player. (UPDATED with sound playback) */
function displaySequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < gameSequence.length) {
            const color = gameSequence[i];
            const button = document.querySelector(`.sequence-button.${color}`);
            
            // Highlight the button
            button.classList.add('active');
            
            // 🔊 Play the sound simultaneously with the light-up
            sequenceSound.currentTime = 0; 
            sequenceSound.play().catch(e => console.log('Audio playback blocked:', e)); 
            
            // Turn it off after a short time
            setTimeout(() => {
                button.classList.remove('active');
            }, 500); 
            
            i++;
        } else {
            clearInterval(interval);
            messageElement.textContent = "Your turn! Repeat the sequence.";
            // Enable buttons for player input
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'auto');
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '1'); 
            isPlaying = true;
            playerSequence = [];
        }
    }, 800); 
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

/** Handles the player clicking one of the buttons. */
function handlePlayerClick(event) {
    if (!isPlaying) return;

    const clickedColor = event.target.getAttribute('data-color');
    playerSequence.push(clickedColor);

    const currentStep = playerSequence.length - 1;
    
    // Check if the current click matches the sequence
    if (playerSequence[currentStep] === gameSequence[currentStep]) {
        // Correct click
        
        if (playerSequence.length === gameSequence.length) {
            // Sequence is complete and correct!
            score++;
            scoreElement.textContent = "Score: " + score;
            messageElement.textContent = "SUCCESS! Get ready for the next sequence.";
            
            if (score >= SCORE_TO_WIN) {
                handleWin();
                return;
            }
            
            // Disable buttons and start next round
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.pointerEvents = 'none');
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '0.5'); 
            isPlaying = false;
            setTimeout(newRound, 1800); 
        }
    } else {
        // Incorrect click
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
