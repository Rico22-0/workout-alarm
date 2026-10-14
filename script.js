// DOM Elements
const currentTimeDisplay = document.getElementById('current-time');
const currentDateDisplay = document.getElementById('current-date');
const alarmTimeInput = document.getElementById('alarm-time-input');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const alarmStatus = document.getElementById('alarm-status');
const setupSection = document.getElementById('setup-section');
const ringingSection = document.getElementById('ringing-section');
const shakeCountDisplay = document.getElementById('shake-count');
const progressFill = document.getElementById('progress-fill');

// State Variables
let alarmTime = null;
let alarmInterval = null;
let isRinging = false;

// Target shakes required to stop the alarm
const targetShakes = 15;
let currentShakes = 0;

// Update clock and check alarm every second
function updateClock() {
    const now = new Date();
    
    // Format Time (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    // Format Date
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);

    // Check if alarm should trigger (matches HH:MM and seconds is 00)
    if (alarmTime && !isRinging) {
        const currentTimeString = `${hours}:${minutes}`;
        if (currentTimeString === alarmTime && seconds === '00') {
            triggerAlarm();
        }
    }
}

// Run clock loop
setInterval(updateClock, 1000);

// Set Alarm Button Click Event
setAlarmBtn.addEventListener('click', () => {
    if (!alarmTimeInput.value) {
        alert('Please select a valid time for your alarm!');
        return;
    }

    alarmTime = alarmTimeInput.value;
    alarmStatus.textContent = `Alarm set for ${alarmTime}`;
    alarmStatus.style.color = '#38bdf8';
    
    // Request permission for device motion (required for iOS/Android browsers later)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    console.log('Motion sensor permission granted.');
                }
            })
            .catch(console.error);
    }
});

// Trigger Alarm State
function triggerAlarm() {
    isRinging = true;
    setupSection.classList.add('hidden');
    ringingSection.classList.remove('hidden');
    
    // Play vibration or sound here if needed
    if ('vibrate' in navigator) {
        navigator.vibrate([500, 250, 500, 250]); // Continuous vibration pattern
    }

    // Start Listening for shakes
    initMotionDetection();
}

// Motion Detection Logic (Phase 2 preview integrated early)
function initMotionDetection() {
    let lastX = 0, lastY = 0, lastZ = 0;
    let threshold = 15; // Sensitivity threshold for a "shake"

    window.addEventListener('devicemotion', (event) => {
        if (!isRinging) return;

        let acc = event.accelerationIncludingGravity;
        if (!acc) return;

        let deltaX = Math.abs(acc.x - lastX);
        let deltaY = Math.abs(acc.y - lastY);
        let deltaZ = Math.abs(acc.z - lastZ);

        if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
            currentShakes++;
            updateProgress();
        }

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    });
}

// Update Progress Bar
function updateProgress() {
    if (currentShakes > targetShakes) {
        currentShakes = targetShakes;
    }

    let percentage = (currentShakes / targetShakes) * 100;
    shakeCountDisplay.textContent = currentShakes;
    progressFill.style.width = `${percentage}%`;

    // Check goal is met
    if (currentShakes >= targetShakes) {
        stopAlarm();
    }
}

// Stop Alarm and Reset UI
function stopAlarm() {
    isRinging = false;
    currentShakes = 0;
    alarmTime = null;
    
    // Reset display
    progressFill.style.width = '0%';
    shakeCountDisplay.textContent = '0';
    alarmStatus.textContent = 'Alarm is OFF';
    alarmStatus.style.color = '#f43f5e';
    alarmTimeInput.value = '';

    ringingSection.classList.add('hidden');
    setupSection.classList.remove('hidden');

    alert('Great job! You woke up successfully! 💪');
}