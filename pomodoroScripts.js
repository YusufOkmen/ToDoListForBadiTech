const allTimersDisplays = document.querySelectorAll('.timer-display');
const allButtons = document.querySelectorAll('button[id$="-session"]');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const alarmSound = document.getElementById('alarm-sound');
const stopAlarmBtn = document.getElementById('stop-alarm-btn');
const taskSelect = document.getElementById("activeTaskSelect");
const taskTimeDisplay= document.getElementById("taskTimeDisplay")
const timeSpentValue = document.getElementById("timeSpentValue");

//Get the current user to find their specific tasks
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const userTasksKey = currentUser ? `tasks_${currentUser.email}` : "null";

let timerInterval = null;
let isRunning = false;
let endTime = null;

let currentTimerElement = document.getElementById('pomodoro-timer');
let timeLeft = parseInt(currentTimerElement.dataset.duration) * 60;


//Load tasks into the dropdown
function loadTasksIntoDropdown() {
    if (!userTasksKey) {
        return;
    }

    const savedTasks = JSON.parse(localStorage.getItem(userTasksKey)) || [];

    //Clear existing options (except the default one)
    taskSelect.innerHTML = '<option value="">-- Select a task --</option>';

    //Loop through tasks and only add the ones that are not completed
    savedTasks.forEach((task, index) => {
        if (!task.completed) {
            const option = document.createElement("option");
            option.value = index; //We use the array index to identify the task later
            option.textContent = task.text;

            //If the task doesn't have a timeSpent property yet, give it one
            if (task.timeSpent === undefined) {
                task.timeSpent = 0;
            }

            //Store the time spent right on the option element for easy access
            option.dataset.timeSpent = task.timeSpent;

            taskSelect.appendChild(option);
        }
    });
};

loadTasksIntoDropdown();

taskSelect.addEventListener("change", (e) => {
    const selectedOption =taskSelect.options[taskSelect.selectedIndex];

    if (taskSelect.value === "") {
        //If they select the default, hide the time
        taskTimeDisplay.style.display = "none";
    } else {
        //Show the time spent for the chosen task
        taskTimeDisplay.style.display = "block";

        //Grab the time data we attached to the option
        const minutesSpent = selectedOption.dataset.timeSpent || 0;
        timeSpentValue.textContent = minutesSpent;
    }
});

function addTimeToSelectedTask() {
    // Check if the user actually selected a task from the dropdown
    const taskSelect = document.getElementById("activeTaskSelect");
    const selectedIndex = taskSelect.value;

    if (selectedIndex === "") {
        return;
    }

    // Open the database (LocalStorage) to get the user's tasks
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!currentUser) {
        return;
    }

    const userTasksKey = `tasks_${currentUser.email}`;
    let savedTasks = JSON.parse(localStorage.getItem(userTasksKey)) || [];

    // Figure out how many minutes to add 
    // Grab the duration of the timer just finished
    const minutesCompleted = parseInt(currentTimerElement.dataset.duration);

    // Go to the exact same task using the index, and add the minutes
    // Include safety check just in case
    if (savedTasks[selectedIndex].timeSpent === undefined) {
        savedTasks[selectedIndex].timeSpent = 0;
    }
    savedTasks[selectedIndex].timeSpent += minutesCompleted;

    // Save the updated list back into LocalStorage
    localStorage.setItem(userTasksKey, JSON.stringify(savedTasks));
    
    // Refresh the dropdown UI so the new time shows up instantly
    loadTasksIntoDropdown();

    // Make sure the dropdown stays on the task they were just working on
    taskSelect.value = selectedIndex;

    // Update the text display below the dropdown
    const timeSpentValue = document.getElementById("timeSpentValue")
    if (timeSpentValue) {
        timeSpentValue.textContent = savedTasks[selectedIndex].timeSpent;
    }
};

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

    // Tab Title Feature for #5 issue. 
    document.title = `(${formattedTime}) Do!Do!`;
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

    stopButton.disabled = true;
    stopButton.style.opacity = "0.5";
    stopButton.style.pointerEvents = "none";
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

    // 1. Calculate the REAL time left by comparing Now vs. Target
    const now = Date.now();
    const secondsLeft = Math.ceil((endTime - now) / 1000);

    // 2. Sync it with your global variable so the pause button still works
    timeLeft = secondsLeft;


    if (timeLeft <= 0) {

        // Update the task before stopping the timer
        addTimeToSelectedTask();

        stopTimer(); // Clear interval and reset state
        updateDisplay(0);

        alarmSound.play();

        stopAlarmBtn.style.display = "block";

        startButton.style.display = "none";
        stopButton.style.display = "none";

        return;
    }

    // Decrease time and update display
    updateDisplay(timeLeft);
}

/**
 * Initializes and starts the countdown for the currently selected timer.
 */
function startCountdown() {
    if (isRunning) {
        return; // Already running
    }

    // --- NEW LOGIC START ---
    // Calculate exactly when the timer should end based on current timeLeft
    // Date.now() gives milliseconds, so we multiply timeLeft by 1000
    endTime = Date.now() + (timeLeft * 1000);
    // --- NEW LOGIC END ---

    // Set state and disable start button
    isRunning = true;
    startButton.disabled = true;
    startButton.textContent = "Running...";
    startButton.style.opacity = "0.5";
    startButton.style.pointerEvents = "none";

    stopButton.disabled = false;
    stopButton.style.opacity = "1";
    stopButton.style.pointerEvents = "auto";

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

stopButton.disabled = true;
stopButton.style.opacity = "0.5";
stopButton.style.pointerEvents = "none";

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
        startButton.style.opacity = "1";
        startButton.style.pointerEvents = "auto";
    });
}