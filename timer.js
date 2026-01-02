// ##################################################################
// Globals
// ##################################################################

// Do you want to allow people to change certain settings?
var warningSoundsAllowed = false;
var changeTimesAllowed = false;

// Are we on an Apple device? We'll need a different speech rate
const isApple = navigator.userAgent.toLowerCase().indexOf("mac os") > -1;

// Device preferences
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

// Running variables
var state;
var startTime;
var interval;
var gaveWarning = false;
var counter = 0;
var counterInterval;
var voiceGetterInterval;
var numPositiveVoiceCheck = 0;
var initializedSound = 0;

// Settings variables
var fullTime = 15;
var partTime = 5;
var lang = "en-us";
var playEndVoice = true;
var playEndBeep = false;
var playWarnVoice = false;
var playWarnBeep = false;
var voiceIndex;
var rate;
var voices;
var showCounter = false;
var darkTheme = false;


// Sound fragments
var sayNothing = new SpeechSynthesisUtterance("");
var sayTime = new SpeechSynthesisUtterance("Time");
var sayWarning;
function updateWarnVoice(number) {
    var sayString = number.toLocaleString("en") + " seconds";
    sayWarning = new SpeechSynthesisUtterance(sayString);
    sayWarning.lang = lang;
    sayWarning.rate = rate;
}
var silence = new Audio("/timer/media/sounds/silence.mp3");
var beep = new Audio("/timer/media/sounds/beep.mp3");

// References to document elements; we will fill these once the page loads
var settingsPageElem;
var warnDiv;
var timesDiv;
var endSoundsSelectorElem;
var warnSoundsSelectorElem;
var fullTimeBoxElem;
var partTimeBoxElem;
var speechVoiceSelectorElem;
var speechRateSelectorElem;
var showCounterSelectorElem;
var darkModeSwitchElem;
var touchCaptureDivElem;
var okButtonElem;
var cancelButtonElem;
var readyElem;
var timeElem;
var counterElem;
var settingsElem;
var helpElem;
var jumpElem;

// ##################################################################
// Initialization
// ##################################################################


// Initial setup function, called when page loads
function initialize() {
    // Prevent screen from moving around
    document.ontouchmove = function(event) {event.preventDefault();}

    // Initialize element variables
    settingsPageElem = document.getElementById("settings");
    warnDiv = document.getElementById("warnSoundsEnabled");
    timesDiv = document.getElementById("timeOptionsEnabled");
    endSoundsSelectorElem = document.getElementById("endSoundSelector");
    warnSoundsSelectorElem = document.getElementById("warnSoundSelector");
    fullTimeBoxElem = document.getElementById("fullTimeBox");
    partTimeBoxElem = document.getElementById("warnTimeBox");
    speechVoiceSelectorElem = document.getElementById("speechVoiceSelector");
    speechRateSelectorElem = document.getElementById("speechRateSelector");
    darkModeSwitchElem = document.getElementById("darkModeSwitch");
    showCounterSelectorElem = document.getElementById("showCounterSelector");
    touchCaptureDivElem = document.getElementById("touchCaptureDiv");
    okButtonElem = document.getElementById("okButton");
    cancelButtonElem = document.getElementById("cancelButton");
    readyElem = document.getElementById("ready");
    timeElem = document.getElementById("time");
    counterElem = document.getElementById("counter");
    helpElem = document.getElementById("helpButton");
    settingsElem = document.getElementById("settingsButton");
    jumpElem = document.getElementById("jumpButton");
    
    // Allow modification of "advanced" settings as at top
    if (warningSoundsAllowed) {
        warnDiv.style.display="block";
    } else {
        warnDiv.style.display="none";
    }
    if (changeTimesAllowed) {
        timesDiv.style.display="block";
    } else {
        timesDiv.style.display="none";
    }

    // Add event listeners (instead of defining buttons with onclick)
    if ("ontouchend" in window) {
        // If we have touchscreen events, create those listeners
        touchCaptureDivElem.addEventListener("touchend", doTap, false);
        jumpElem.addEventListener("touchend", jumpToShortTime, false);
        settingsElem.addEventListener("touchend", showSettings, false);
        okButtonElem.addEventListener("touchend", settingsOK, false);
        cancelButtonElem.addEventListener("touchend", settingsCancel, false);
    } else {
        // Listen for mouseup otherwise
        touchCaptureDivElem.addEventListener("mouseup", doTap, false);
        jumpElem.addEventListener("mouseup", jumpToShortTime, false);
        settingsElem.addEventListener("mouseup", showSettings, false);
        okButtonElem.addEventListener("mouseup", settingsOK, false);
        cancelButtonElem.addEventListener("mouseup", settingsCancel, false);
    }
    darkModeSwitchElem.addEventListener("change", themeToggle, false);

    // Default speech rate
    if (isApple) {
        rate = 1.4;
    } else {
        rate = 2.0;
    }
    // Populate speech rate selector
    for(var i=11; i<=30; i++) {
            var val = i/10.0;
            var el = document.createElement("option");
            if((val == 1.4 && isApple) ||
                    (val == 2.0 && !isApple)) {
                    el.textContent = val + " (Default)";
            } else {
                    el.textContent = val;
            }
            el.value = val;
            speechRateSelectorElem.appendChild(el);
    }

    // Get simple settings from storage if present, set in storage otherwise
    if (typeof localStorage === "object") {
        // end sound
        try {
            // possible stored values: 1=none, 2=voice, 3=beep
            if (localStorage.storedEndSound > 0 && localStorage.storedEndSound < 4) {
                endSound = localStorage.storedEndSound - 1;
                playEndVoice = (endSound == 1)? 1 : 0; // ternary operator for shorter code
                playEndBeep = (endSound == 2)? 1 : 0;
            } else {
                localStorage.storedEndSound = 1 + (1 * playEndVoice) + (2 * playEndBeep);
                endSound = (1 * playEndVoice) + (2 * playEndBeep);
            }
        } catch (e) {} // silently ignore
        // warn sound
        try {
            // possible stored values: 1=none, 2=voice, 3=beep
            if (localStorage.storedWarnSound > 0 && localStorage.storedWarnSound < 4) {
                warnSound = localStorage.storedWarnSound - 1;
                playWarnVoice = (warnSound == 1)? 1 : 0; // ternary operator for shorter code
                playWarnBeep = (warnSound == 2)? 1 : 0;
            } else {
                localStorage.storedWarnSound = 1 + (1 * playWarnVoice) + (2 * playWarnBeep);
                warnSound = playWarnVoice + (2 * playWarnBeep);
            }
        } catch (e) {}
        // full time
        try {
            if (localStorage.storedFullTime > 0) {
                fullTime = localStorage.storedFullTime;
            } else {
                localStorage.storedFullTime = fullTime;
            }
        } catch (e) {}
        // part time
        try {
            if (localStorage.storedPartTime > 0) {
                partTime = localStorage.storedPartTime;
            } else {
                localStorage.storedPartTime = partTime;
            }
        } catch (e) {}
        // show counter
        try {
            if (localStorage.storedShowCounter == 1) {
                showCounter = true;
            } else {
                localStorage.storedShowCounter = 0;
            }
        } catch (e) {}
        // speech rate
        try {
            if (!localStorage.storedSpeechRate) {
                localStorage.storedSpeechrate = rate;
            } else {
                rate = localStorate.storedSpeechRate;
            }
        } catch (e) {}
        // dark mode: 
        try {
            if (localStorage.storedDarkMode == false) {
                darkMode = false;
            } else if (localStorage.storedDarkMode || prefersDark.matches) {
                localStorage.storedDarkMode = 1;
                darkMode = true;
            } else {
                localStorage.storedDarkMode = 0;
                darkMode = false;
            }
        } catch (e) {}
    }

    // Change everything to agree with current settings
    timeElem.innerHTML = fullTime;
    fullTimeBoxElem.value = fullTime;
    partTimeBoxElem.value = partTime;
    endSoundsSelectorElem.options[endSound].selected = true;
    warnSoundsSelectorElem.options[warnSound].selected = true;
    fullTimeBoxElem.innerHTML = fullTime;
    partTimeBoxElem.innerHTML = partTime;
    jumpElem.innerHTML = partTime + " seconds";
    showCounterSelectorElem.checked = showCounter;
    counterElem.style.visibility = (showCounter)? "visible" : "hidden";
    for (var i=0; i<speechRateSelectorElem.options.length; i++) {
        if (speechRateSelectorElem.options[i].value == rate) {
            speechRateSelectorElem.options[i].selected = true;
            break;
        }
    }
    updateWarnVoice(partTime);
    sayTime.rate = rate;
    sayWarning.rate = rate;
    darkModeSwitchElem.checked = darkMode;
    setTheme(darkMode);

    // Get voice list (runs repeatedly to make sure we get the full list)
    voiceGetterInterval = setInterval(function() {getVoicesList();}, 200);

    // Initial states
    counterElem.innerHTML = "00";
    state = 0;

    // Run backup counter forever
    counterInterval = setInterval(function() {updateCounter();}, 1000);
}

function getVoicesList() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length !== 0) {
        numPositiveVoiceCheck++;
        if (numPositiveVoiceCheck < 2) {
            // not enough positive checks yet
            // we're not certain list is complete
            return;
        }
    } else {
        // don't have any voices yet, keep looking!
        return;
    }
    // If we reach this code, we have enough positive checks that there are voices
    // Populate voice list
    for (var i=0; i<voices.length; i++) {
        // add offline voices only
        if (voices[i].localService) {
            var el = document.createElement("option");
            el.textContent = voices[i].name + " " + voices[i].lang;
            el.value = i;
            speechVoiceSelectorElem.appendChild(el);
        }
    }
    // Select first en-US entry by default
    // Android uses underscore so we check for en_US, too
    var defaultIndex = 0;
    for (var i=0; i<speechVoiceSelectorElem.options.length; i++) {
        if (voices[speechVoiceSelectorElem.options[i].value].lang == "en-US" ||
            voices[speechVoiceSelectorElem.options[i].value].lang == "en_US") {
                speechVoiceSelectorElem.options[i].selected = true;
                defaultIndex = i;
                break;
            }
    }
    // Check for stored voice. If none, update local storage.
    // If found, look in voices list and select. If not in voices list, default will be kept.
    if (typeof localStorage === "object") {
        try {
            if (typeof localStorage.storedVoiceName == "undefined") {
                localStorage.storedVoiceName = voices[defaultIndex].name
                                               + " " + voices[defaultIndex].lang;
            } else {
                var targetName = localStorage.storedVoiceName;
                for (var i=0; i<speechVoiceSelectorElem.options.length; i++) {
                    if (targetName == voices[i].name + " " + voices[i].lang) {
                        speechVoiceSelectorElem.options[i].selected = true;
                        defaultIndex = i;
                        break;
                    }
                }
                localStorage.storedVoiceName = voices[defaultIndex].name
                                               + " " + voices[defaultIndex].lang;
            }
            voiceIndex = defaultIndex;
        } catch (e) {} // silently ignore exceptions
    }
    // Update speech fragments if we have a selected voice
    if (defaultIndex >= 0) {
        var voice = voices[defaultIndex];
        sayTime.lang = voice.lang;
        sayTime.voice = voice;
        sayWarning.lang = voice.lang;
        sayWarning.voice = voice;
    }
    // Stop looking for new voices
    clearInterval(voiceGetterInterval);
}

// ##################################################################
// Run timer
// ##################################################################

// Handles clicking anywhere except buttons to start or reset full timer
function doTap(event) {
    // Initialize sound if not done already so that iOS will play it
    if (!initializedSound) {
        window.speechSynthesis.speak(sayNothing);
        silence.play();
        initializedSound = true;
    }
    // Start/reset timer based on state
    if (state == 0) {
        // In ready state; switch to counting down
        state = 1;
        gaveWarning = false;
        var d = new Date();
        startTime = d.getTime();
        readyElem.style.visibility = "hidden";
        timeElem.classList.remove("ready");
        timeElem.classList.add("running");
        // Actually counts down
        interval = setInterval(function() {updateTimer();}, 100);
    } else {
        // Reset to ready state
        if (state == 1) {
            clearInterval(interval);
        }
        state = 0;
        readyElem.style.visibility = "visible";
        timeElem.innerHTML = fullTime;
        timeElem.classList.remove("running","done");
        timeElem.classList.add("ready");
    }
}

// Updates timer
function updateTimer() {
    // Calculate time left
    var d = new Date();
    var remaining = Math.ceil(fullTime - (d.getTime() - startTime)/1000);
    if (remaining < 0) {
        remaining = 0; // don't go negative
    }
    // Update timer
    timeElem.innerHTML = remaining;

    // Warning
    if (remaining == partTime && !gaveWarning) {
        gaveWarning = true;
        if (playWarnVoice) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(sayWarning);
        }
        if (playWarnBeep) {
            beep.play();
        }
    }

    // Time up
    if (remaining == 0) {
        // Make timer red
        timeElem.classList.remove("running");
        timeElem.classList.add("done");
        // Stop updating and set state
        clearInterval(interval);
        state = 2;
        // Sounds
        if (playEndVoice) {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(sayTime);
        }
        if (playEndBeep) {
            beep.play();
        }
    }
}

// Runs backup counter
function updateCounter() {
    counter++;
    // Format to exactly 2 digits
    counter = counter % 100;
    var counterText = (counter < 10)? "0" + counter : counter; // conditional
    // Update counter element
    counterElem.innerHTML = counterText;
}

function jumpToShortTime(event) {
    // Stop any current countdown/event
    clearInterval(interval);
    event.stopPropagation();
    event.preventDefault();
    // Make sure sounds initialized for iOS
    if (!initializedSound) {
        window.speechSynthesis.speak(sayNothing);
        silence.play();
        initializedSound = true;
    }
    // Count down
    state = 1;
    gaveWarning = false;
    var d = new Date();
    startTime = d.getTime() - (fullTime - partTime)*1000;
    readyElem.style.visibility = "hidden";
    timeElem.classList.remove("ready","done");
    timeElem.classList.add("running");
    interval = setInterval(function() {updateTimer();}, 100);
}

// ##################################################################
// Settings
// ##################################################################

// Shows settings panel
function showSettings(event) {
    // Stop current timer/event
    // clearInterval(interval);
    event.stopPropagation();
    event.preventDefault();
    // Show settings
    settingsPageElem.style.visibility = "visible";
}

// Save changes and close settings
function settingsOK(event) {
    // Stop current event
    if (typeof event === "object") {
        event.stopPropagation();
        event.preventDefault();
    }
    // Parse, check, and save new settings
    // Time settings
    if (changeTimesAllowed) {
        var newFullTime = parseInt(fullTimeBoxElem.value);
        var newPartTime = parseInt(partTimeBoxElem.value);
        if (newFullTime < newPartTime) {
            alert("Full question time must be longer than shortened time!");
        } else {
            fullTime = newFullTime;
            if (state !== 2) {timeElem.innerHTML = fullTime};
            partTime = newPartTime;
            jumpElem.innerHTML = partTime + " seconds";
            updateWarnVoice(partTime);
        }
    }
    // End sounds
    playEndVoice = (endSoundsSelectorElem.selectedIndex == "1")? true : false;
    playEndBeep = (endSoundsSelectorElem.selectedIndex == "2")? true : false;
    if (playWarnVoice && playWarnBeep) {
        playWarnBeep = false;
    }
    var endSound = 1 + playEndVoice + 2*playEndBeep;
    // Warning sounds
    playWarnVoice = (warnSoundsSelectorElem.selectedIndex == "1")? true : false;
    playWarnBeep = (warnSoundsSelectorElem.selectedIndex == "2")? true : false;
    if (playWarnVoice && playWarnBeep) {
        playWarnBeep = false;
    }
    var warnSound = 1 + playWarnVoice + 2*playWarnBeep;
    // Speech voice
    voiceIndex = speechVoiceSelectorElem.selectedIndex;
    if (voiceIndex >= 0) {
        var voice = voices[voiceIndex];
        sayTime.lang = voice.lang;
        sayTime.voice = voice;
        sayWarning.lang = voice.lang;
        sayWarning.voice = voice;
    }
    // Speech rate
    var rateIndex = speechRateSelectorElem.selectedIndex;
    rate = speechRateSelectorElem.options[rateIndex].value;
    sayTime.rate = rate;
    sayWarning.rate = rate;
    // Backup counter
    showCounter = showCounterSelectorElem.checked;
    if (showCounter) {
        counterElem.style.visibility = "visible";
    } else {
        counterElem.style.visibility = "hidden";
    }
    // Dark mode
    var darkMode = darkModeSwitchElem.checked;
    setTheme(darkMode);

    // Save new settings
    if (typeof localStorage === "object") {
        try {
            localStorage.storedFullTime = fullTime;
            localStorage.storedPartTime = partTime;
            localStorage.storedEndSound = endSound;
            localStorage.storedWarnSound = warnSound;
            localStorage.storedVoiceName = voice.name + " " + voice.lang;
            localStorage.storedSpeechRate = rate;
            localStorage.storedShowCounter = (showCounter)? 1 : 0;
            localStorage.storedDarkMode = (darkMode)? 1 : 0;
        } catch (e) {}
    }

    // Hide settings pane
    settingsPageElem.style.visibility = "hidden";
}

function settingsCancel(event) {
    event.stopPropagation();
    event.preventDefault();
    // Reset settings page elements
    if (state !== 2) {timeElem.innerHTML = fullTime};
    fullTimeBoxElem.value = fullTime;
    partTimeBoxElem.value = partTime;
    endSoundsSelectorElem.options[endSound].selected = true;
    warnSoundsSelectorElem.options[warnSound].selected = true;
    fullTimeBoxElem.innerHTML = fullTime;
    partTimeBoxElem.innerHTML = partTime;
    jumpElem.innerHTML = partTime + " seconds";
    showCounterSelectorElem.checked = showCounter;
    counterElem.style.visibility = (showCounter)? "visible" : "hidden";
    for (var i=0; i<speechRateSelectorElem.options.length; i++) {
        if (speechRateSelectorElem.options[i].value == rate) {
            speechRateSelectorElem.options[i].selected = true;
            break;
        }
    }
    speechVoiceSelectorElem.options[voiceIndex].selected = true;
    setTheme(darkMode);
    // Close settings
    settingsPageElem.style.visibility = "hidden";
}

// ##################################################################
// Dark mode
// ##################################################################

// Set correct theme
function setTheme(dark) {
    if (dark) {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }
}

function themeToggle() {
    setTheme(darkModeSwitchElem.checked);
}