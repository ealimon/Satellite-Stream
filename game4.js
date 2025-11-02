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
let wrongSound;         // Distinct sound for incorrect answer
let startButton; 

// --- Helper Functions ---

/** Removes any flash feedback classes after a short delay. */
function clearFeedback() {
    messageElement.classList.remove('correct-feedback', 'incorrect-feedback');
}


// --- Game Logic ---

/** Initializes DOM elements only. Audio loading is moved to startGame(). */
function initializeGame() {
    // 1. Get the start button reference and prepare it
    startButton = document.getElementById('start-button');
    startButton.addEventListener('click', startGame);

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
}

/** Function called ONLY by the user's first click to unlock audio and start the game. */
function startGame() {
    // 1. Create and initialize ALL audio objects ONLY after the user clicks 
    sequenceSound = new Audio('./Space_Button.mp3'); 
    sequenceSound.preload = 'auto';
    sequenceSound.volume = 0.5; 

    playerClickSound = new Audio('./Space_Button.mp3'); 
    playerClickSound.preload = 'auto';
    playerClickSound.volume = 0.3; 
    
    wrongSound = new Audio('./error.wav');
    wrongSound.preload = 'auto';
    wrongSound.volume = 0.7;
    
    // CRITICAL FIX: Play and immediately pause ALL sound files to unlock the audio context for all streams.
    sequenceSound.play().catch(e => console.log('Initial sequence audio unlock failed:', e));
    sequenceSound.pause(); 
    
    wrongSound.play().catch(e => console.log('Initial wrong audio unlock failed:', e));
    wrongSound.pause();
    
    // 2. Hide the start screen immediately
    document.getElementById('start-screen').style.display = 'none';
    messageElement.textContent = "Get ready!";
    
    // 3. Prevent this function from running again
    startButton.removeEventListener('click', startGame);

    // 4. Start the game loop after a brief delay
    setTimeout(newRound, 1000); 
}

/** Displays the sequence to the player (Plays sequenceSound). (1200ms delay for easier tracking) */
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

/** Handles the player clicking one of the buttons. (Plays appropriate sound, adds visual flash, and checks sequence) */
function handlePlayerClick(event) {
    if (!isPlaying) return;

    const clickedButton = event.target;
    clearFeedback(); 

    // Visual Click Flash
    clickedButton.classList.add('active');
    setTimeout(() => {
        clickedButton.classList.remove('active');
    }, 200); 
    
    const clickedColor = clickedButton.getAttribute('data-color');
    playerSequence.push(clickedColor);

    const currentStep = playerSequence.length - 1;
    
    // Sequence Check
    if (playerSequence[currentStep] === gameSequence[currentStep]) {
        
        // Correct Action: Play neutral click sound and show green flash
        playerClickSound.currentTime = 0;
        playerClickSound.play().catch(e => console.log('Audio playback failed:', e));
        messageElement.classList.add('correct-feedback');

        if (playerSequence.length === gameSequence.length) {
            // Sequence is complete and correct
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
        } else {
            // Correct but sequence is not complete, clear the flash quickly
            setTimeout(clearFeedback, 300);
        }
    } else {
        // Incorrect Action: Play wrong sound and show red flash
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log('Wrong audio playback failed:', e));
        
        messageElement.classList.add('incorrect-feedback');
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
    clearFeedback(); // Ensure no flash is left over
    generateSequence();
    messageElement.textContent = "WATCH! Sequence length: " + sequenceLength;
    isPlaying = false;
    
    // Give a brief moment before the sequence starts
    setTimeout(displaySequence, 1500);
}


// --- Start the Game! ---
initializeGame();
