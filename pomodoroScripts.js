const allTimersDisplays = document.querySelectorAll('.timer-display');
const allButtons = document.querySelectorAll('button[id$="-session"]');
const startButton = document.getElementById('start');

let timerInterval = null;
let isRunning = false;

let currentTimerElement = document.getElementById('pomodoro-timer'); 
let timeLeft = parseInt(currentTimerElement.dataset.duration);

/**
 * Updates the text content of the currently active timer display.
 * @param {number} timeInSeconds - The time to display.
 */
function updateDisplay(timeInSeconds) {
    const displayTime = timeInSeconds.toFixed(2);
    currentTimerElement.textContent = displayTime;
}


/**
 * Stops any running timer and resets the display buttons' text.
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    isRunning = false;
    startButton.disabled = false;
    startButton.textContent = "START";
}


/**
 * Hides all timers and shows only the target element.
 * @param {string} targetElementId - The ID of the timer element to show.
 */
function showOnly(targetElementId) {
    // 1. Stop the current timer before switching
    stopTimer();

    // 2. Hide all timer elements
    allTimersDisplays.forEach(timer => {
        timer.style.display = "none";
    });     

    // 3. Find and display the specific timer
    const targetTimer = document.getElementById(targetElementId);
    if (targetTimer) {
        targetTimer.style.display = "block";
        currentTimerElement = targetTimer; // Update the global target reference

        // 4. Reset timeLeft to the new timer's initial duration
        timeLeft = parseInt(currentTimerElement.dataset.duration);
        updateDisplay(timeLeft);
        
    }
}

// --- Countdown Logic (Starting) ---

/**
 * The core function executed every second.
 */
function countdown() {
    if (timeLeft <= 0) {
        stopTimer(); // Clear interval and reset state
        updateDisplay(0);
        
        alert("Countdown Finished!");
        startButton.textContent = "START"

        // Reset the time for the finished timer
        timeLeft = parseInt(currentTimerElement.dataset.duration);
        updateDisplay(timeLeft);
        return; 
    }

    // Decrease time and update display
    timeLeft -= 1;
    updateDisplay(timeLeft);
}

/**
 * Initializes and starts the countdown for the currently selected timer.
 */
function startCountdown() {
    if (isRunning) {
        return; // Already running
    }
    
    // Set state and disable start button
    isRunning = true;
    startButton.textContent = "Running...";
    startButton.disabled = true;

    // Start the interval
    timerInterval = setInterval(countdown, 1000); 
}

// --- Event Handlers ---

// 1. Attach listener to all Display buttons (Switching logic)
allButtons.forEach(button => {  
    button.addEventListener("click", (event) => {
        const targetId = event.currentTarget.dataset.targetId;
        showOnly(targetId);
    })
});

// 2. Attach listener to the Start button (Starting logic)
startButton.addEventListener('click', startCountdown);

updateDisplay(timeLeft);