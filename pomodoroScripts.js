const allTimersDisplays = document.querySelectorAll('.timer-display');
const allButtons = document.querySelectorAll('button[id$="-session"]');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const alarmSound = document.getElementById('alarm-sound');
const stopAlarmBtn = document.getElementById('stop-alarm-btn');

let timerInterval = null;
let isRunning = false;

let currentTimerElement = document.getElementById('pomodoro-timer'); 
let timeLeft = parseInt(currentTimerElement.dataset.duration) * 60;

/**
 * Updates the text content of the currently active timer display.
 * @param {number} timeInSeconds - The time to display.
 */
function updateDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    // Add leading zeros (e.g., "5:9" becomes "05:09")
    const formattedTime = 
        `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    currentTimerElement.textContent = formattedTime;
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
        timeLeft = parseInt(currentTimerElement.dataset.duration) * 60; 
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
        
        alarmSound.play();  

        stopAlarmBtn.style.display = "block";

        startButton.style.display = "none";
        stopButton.style.display = "none";
        
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

function dismissAlarm() {
    // 1. Pause the audio
    alarmSound.pause();
    
    // 2. Rewind audio to the start (so it's ready for next time)
    alarmSound.currentTime = 0;

    // 3. Hide the Stop Alarm button
    stopAlarmBtn.style.display = "none";

    // 4. Show the Start button again
    startButton.style.display = "block";
    stopButton.style.display = "block";
    startButton.textContent = "START";

    // 5. Reset the timer value (rewind the clock)
    timeLeft = parseInt(currentTimerElement.dataset.duration) * 60;
    updateDisplay(timeLeft);
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

// Don't forget to listen for the click!
if (stopAlarmBtn) {
    stopAlarmBtn.addEventListener('click', dismissAlarm);
}

// 3. Attach listener to the Stop button
if (stopButton) {
    stopButton.addEventListener('click', () => {
        stopTimer();
        // Optional: Make it clear the timer is paused
        startButton.textContent = "RESUME"; 
    });
}