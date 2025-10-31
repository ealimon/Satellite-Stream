// --- Game Configuration ---
const COLORS = {
    red: '#FF4500',
    blue: '#1E90FF',
    green: '#3CB371',
    yellow: '#FFD700'
};
const COLOR_NAMES = Object.keys(COLORS); // ['red', 'blue', 'green', 'yellow']

let gameSequence = []; // Stores the sequence to be played
let playerSequence = []; // Stores the player's clicks
let sequenceLength = 3; // Starts easy with a 3-step sequence
let score = 0;
const SCORE_TO_WIN = 10;
let isPlaying = false; // Prevents clicks during the display sequence

// --- DOM Elements ---
const messageElement = document.getElementById('message');
const scoreElement = document.getElementById('score');
const sequenceDisplay = document.getElementById('sequence-display');

// --- Game Logic ---

/** Creates the four initial buttons and starts the game. */
function initializeGame() {
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

/** Generates a new random sequence. */
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

/** Displays the sequence to the player. */
function displaySequence() {
    let i = 0;
    const interval = setInterval(() => {
        if (i < gameSequence.length) {
            const color = gameSequence[i];
            const button = document.querySelector(`.sequence-button.${color}`);
            
            // Highlight the button
            button.classList.add('active');
            
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
            document.querySelectorAll('.sequence-button').forEach(btn => btn.style.opacity = '1'); // Make them fully visible
            isPlaying = true;
            playerSequence = [];
        }
    }, 800); 
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
        
        // Reset score or simply repeat the round (for a gentle learning approach)
        // score = 0; // Uncomment this to make the game harder
        // scoreElement.textContent = "Score: 0";
        
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