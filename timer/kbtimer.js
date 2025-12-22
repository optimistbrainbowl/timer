////////////////////////////////////////////
// Brain Bowl Bowl Timer
//
// Original KBTimer Copyright 2017 Casey Smith
// Modified 2025 for Colorado/Wyoming Optimist Brain Bowl by Silas Mitchell
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
////////////////////////////////////////////


////////////////////////////////////////////
// Globals

//Speech rate on apple devices (ios, macos) is faster
// than android and windows, so we need to know
// if we're on an apple device
var isMac = navigator.userAgent.toLowerCase().indexOf("mac os") > -1;

//For keeping track of what's happening
var state=0;
var startTime;
var interval;
var voiceGetterInteravl;
var gaveWarning = false;
var counter = 0;
var numPositiveVoiceCheck = 0;
var initializedSpeech = 0;

//Parameters the user can change
var maxTime = 15;
var lang = "en-gb";
var playEndVoices = false;
var playWarningVoices = false;
var playEndBeep = false;
var playWarningBeep = false;
var rate = 2.0;
if(isMac) {
		rate = 1.4;
}
var voiceIndex;

//Speech utterances
var sayTime = new SpeechSynthesisUtterance("Time");
sayTime.lang = lang;
sayTime.rate = rate;
var sayNothing = new SpeechSynthesisUtterance("");
sayNothing.lang = lang;
sayNothing.rate = rate;
var sayFiveSeconds = new SpeechSynthesisUtterance("Five seconds");
sayFiveSeconds.lang = lang;
sayFiveSeconds.rate = rate;

//General storage
var voices;

//References to DOM elements
var readyElem;
var timeElem;
var counterElem;
var playEndVoicesSelectorElem;
var playWarningVoicesSelectorElem;
var playWarningBeepSelectorElem;
var playEndBeepSelectorElem;
var maxTimeBoxElem;
var speechRateSelectorElem;
var settingsElem;
var speechVoiceSelectorElem;
var speechRateSelectorElem;
var touchCaptureDivElem;
var jumpButtonElem;
var settingsButtonElem;
var okButtonElem;
var cancelButtonElem;

// Globals
///////////////////////////////////////////




///////////////////////////////////////////
// Functions

//Taps anywhere on the sreen (other than buttons)
//  start or reset the timer
function doTapMouse(evt) {
		evt.preventDefault();
		doTap(evt, "mouse");
}

function doTapTouch(evt) {
		evt.preventDefault();
		doTap(evt);
}

function doTap(event, method) {
		//iOS won't start speaking until speech is triggered
		//  by an onclick function, so we'll say nothing here
		//  to turn on speech synthesis
		if(!initializedSpeech) {
				window.speechSynthesis.speak(sayNothing);
				playSound("silence.mp3");
				initializedSpeech = 1;
		}
		if(state==0) {
				// was ready, now counting down
				state = 1;
				gaveWarning = false;
				var d = new Date();
				startTime = d.getTime();
				readyElem.style.visibility="hidden";
				timeElem.style.color="#000";

				interval = setInterval(function() {updateTimer();}, 100);
		} else {
				//Reset
				if(state==1) {
						//If the timer was still counting down, stop
						//  calling that function
						clearInterval(interval);
				}
				state = 0;
				readyElem.style.visibility="visible";
				timeElem.innerHTML = maxTime;
				timeElem.style.color="#999";
		}

}

// Play sounds
function playSound(sound_name) {
	const beep = new Audio(sound_name);
	beep.play();
}

//This function gets called regularly by a setInterval call.
//It runs the countdown timer.
function updateTimer() {

		//Calculate how much time we have left
		var d = new Date();
		var remaining = Math.ceil(maxTime - (d.getTime() - startTime)/1000);
		//but don't go negative
		if(remaining < 0) {
				remaining = 0;
		}

		//Display that time
		timeElem.innerHTML = remaining;

		//Give the five second warning
		if(remaining == 5 && !gaveWarning) {
				gaveWarning = true;
				if(playWarningVoices) {
						window.speechSynthesis.cancel();
						window.speechSynthesis.speak(sayFiveSeconds);
				}
				if (playWarningBeep) {
					playSound("beep.wav");
				}
		}

		//Call time
		if(remaining == 0) {
				//stop calling updateTimer()
				clearInterval(interval);
				//Set the state to time expired (2)
				state=2;
				if(playEndVoices) {
						window.speechSynthesis.cancel();
						window.speechSynthesis.speak(sayTime);
				}
				if(playEndBeep) {
					playSound("beep.wav");
				}
				
				//Alert the operator with a nice red number
				timeElem.style.color="#A11";
		}
}

//This function runs the second counter at the bottom
//(providing a backup that the user can count seconds on
// in case of an error)
function updateCounter() {
		counter++;
		if(counter > 99) {
				counter = 0;
		}
		var counterText = (counter < 10)? "0" + counter : counter;
		counterElem.innerHTML = counterText;
}


//Called by an onload on the body
function initialize() {
		//stop the screen from rubber banding around pointlessly
		document.ontouchmove = function(event) { event.preventDefault(); }

		//get references to DOM elements into global variables for faster access
		readyElem = document.getElementById('ready');
		timeElem = document.getElementById('time');
		counterElem = document.getElementById("counter");
		playEndBeepSelectorElem = document.getElementById("playEndBeepSelector");
		playWarningBeepSelectorElem = document.getElementById("play5SecondBeepSelector");
		playEndVoicesSelectorElem = document.getElementById("playEndVoicesSelector");
		playWarningVoicesSelectorElem = document.getElementById("playWarningVoicesSelector");
		maxTimeBoxElem = document.getElementById("maxTimeBox");
		speechRateSelectorElem = document.getElementById("speechRateSelector");
		settingsElem = document.getElementById("settings");
		speechVoiceSelectorElem = document.getElementById("speechVoiceSelector");
		speechRateSelectorElem = document.getElementById("speechRateSelector");
		touchCaptureDivElem = document.getElementById("touchCaptureDiv");
		jumpButtonElem = document.getElementById("jumpButton");
		settingsButtonElem = document.getElementById("settingsButton");
		okButtonElem = document.getElementById("okButton");
		cancelButtonElem = document.getElementById("cancelButton");

		//add event listeners
		if("ontouchend" in window) {
				touchCaptureDivElem.addEventListener("touchend", doTapTouch, false);
				jumpButtonElem.addEventListener("touchend", jumpToFiveSeconds, false);
				settingsButtonElem.addEventListener("touchend", showSettings, false);
				okButtonElem.addEventListener("touchend", settingsOK, false);
				cancelButtonElem.addEventListener("touchend", settingsCancel, false);
		} else {
				touchCaptureDivElem.addEventListener("mouseup", doTapMouse, false);
				jumpButtonElem.addEventListener("mouseup", jumpToFiveSeconds, false);
				settingsButtonElem.addEventListener("mouseup", showSettings, false);
				okButtonElem.addEventListener("mouseup", settingsOK, false);
				cancelButtonElem.addEventListener("mouseup", settingsCancel, false);
		}

		//get maxTime from storage if it's there
		if(typeof localStorage === 'object') {
				try {
						if(localStorage.storedMaxTime > 0) {
								maxTime = localStorage.storedMaxTime;
						} else {
								localStorage.storedMaxTime = maxTime;
						}
				} catch (e) {
						//silently ignore
				}
		}

		// get beep options from local storage if there, set if not
		if (typeof localStorage === 'object') {
			// end beep settings
			try {
				if (localStorage.storedEndBeep == 'undefined') {
					playEndBeep = 0;
				} else {
					var temp = parseInt(localStorage.storedEndBeep);
					playEndBeep = (temp == 1)? 1 : 0;
				}
			} catch (e) {
				// silently ignore exceptions
				playEndBeep = 0;
			}
			// 5 second warning beep settings
			try {
				if (localStorage.storedWarningBeep == 'undefined') {
					playWarningBeep = 0;
				} else {
					var temp = parseInt(localStorage.storedWarningBeep);
					playWarningBeep = (temp == 1)? 1 : 0;
				}
			} catch (e) {
				// silently ignore exceptions
				playWarningBeep = 0;
			}
		}

		// get playVoices from storage if it's there
		if(typeof localStorage === 'object') {
				try {
						if(typeof localStorage.storedPlayEndVoices == 'undefined') {
								playEndVoices = 0;
						} else {
								var temp = parseInt(localStorage.storedPlayEndVoices);
								playEndVoices = (temp == 1)? 1 : 0;
						}
				} catch (e) {
						//silently ignore
						playEndVoices = 0;
				}
				try {
						if(typeof localStorage.storedPlayWarningVoices == 'undefined') {
								playWarningVoices = 0;
						} else {
								var temp = parseInt(localStorage.storedPlayWarningVoices);
								playWarningVoices = (temp == 1)? 1 : 0;
						}
				} catch (e) {
						//silently ignore
						playWarningVoices = 0;
				}
		}
		// Change settings options to be correct
		// Each boolean one is 0 or 1 and the selector is "no" or "yes", so the
		// correct selected state can be indexed by the boolean
		playEndBeepSelectorElem.options[playEndBeep].selected = true;
		playWarningBeepSelectorElem.options[playWarningBeep].selected = true;
		playEndVoicesSelectorElem.options[playEndVoices].selected = true;
		playWarningVoicesSelectorElem.options[playWarningVoices].selected = true;
		timeElem.innerHTML = maxTime;
		maxTimeBoxElem.value = maxTime;
		// set initial states
		counterElem.innerHTML = "00";
		state = 0;

		//now populate the speech speed selector
		for(var i=11; i<=30; i++) {
				var val = i/10.0;
				var el = document.createElement("option");
				if((val == 1.4 && isMac) ||
					 (val == 2.0 && !isMac)) {
						el.textContent = val + " (Default)";
				} else {
						el.textContent = val;
				}
				el.value = val;
				speechRateSelectorElem.appendChild(el);
		}

		//check storage for the speech rate
		if(typeof localStorage === 'object') {
				try {
						if(!localStorage.storedSpeechRate) {
								localStorage.storedSpeechRate = rate;
						}
						rate = localStorage.storedSpeechRate;
				} catch (e) {
						//silently ignore
				}
		}
		// loop through the speed selector drop down and select
		// the appropriate one
		var numOptions = speechRateSelectorElem.options.length;
		for(var i=0; i<numOptions; i++) {
				if(speechRateSelectorElem.options[i].value == rate) {
						speechRateSelectorElem.options[i].selected = true;
				}
		}

		numPositiveVoiceCheck = 0;
		initializedSpeech = 0;

		//getVoicesList returns nothing for a while as the browser
		//  loads the speech module, so we'll just keep calling
		//  it until we're confident it loaded the full list
		voiceGetterInterval = setInterval(function() {getVoicesList();}, 200);

		//The timer in the lower right just runs forever, updating
		//  once a second
		var myVar = setInterval(function() {updateCounter();}, 1000);

		settingsOK();
}

//If the user forgot to start and wants to jump straight to the five
//  second warning, this function will do that.
function jumpToFiveSeconds(event) {
		clearInterval(interval);
		event.stopPropagation();
		event.preventDefault();

		//iOS won't speak until speech is generated in an onclick function,
		// so we'll say nothing here in case the user clicks
		// "jump to 5 second warning" as the first thing
		if(!initializedSpeech) {
				speechSynthesis.speak(sayNothing);
				playSound("silence.mp3");
				initializedSpeech = 1;
		}

		state = 1;
		gaveWarning = false;
		d = new Date();
		startTime = d.getTime() - (maxTime-5)*1000;
		readyElem.style.visibility="hidden";
		timeElem.style.color="#000";
		interval = setInterval(function() {updateTimer();}, 100);
}

//Show the panel where the user can change the settings
function showSettings(event) {
		event.stopPropagation();
		event.preventDefault();
		settingsElem.style.visibility="visible";
}

//When the user changes maxTime, make sure it's a sane value
function checkMaxTime() {
		var newMaxTime = parseInt(maxTimeBoxElem.value);
		if(newMaxTime < 5 || newMaxTime > 1000) {
				alert("Max seconds must be between 5 and 1000");
				//overwrite the contents of the text box with the previous value
				maxTimeBoxElem.value = maxTime;
				return false;
		} else {
				//if it's a good value, replace the text box with the parseInt version
				maxTimeBoxElem.value = newMaxTime;
		}
}

function blurAll() {
		playEndVoicesSelectorElem.blur();
		playWarningVoicesSelectorElem.blur();
		maxTimeBoxElem.blur();
		speechRateSelectorElem.blur();
		speechVoiceSelectorElem.blur();
}

//Store settings when the user clicks okay
function settingsOK(evt) {
		if(typeof evt === 'object') {
				evt.stopPropagation();
				evt.preventDefault();
		}

		blurAll();

		//maxTime
		maxTime = parseInt(maxTimeBoxElem.value);
		//If we're ready to start timing, adjust the start time
		if(state == 0) {
				timeElem.innerHTML = maxTime;
		}
		//Store it to localStorage
		if(typeof localStorage === 'object') {
				try {
						localStorage.storedMaxTime = maxTime;
				} catch (e) {
						//silently ignore
				}
		}

		// beeps
		playEndBeep = playEndBeepSelectorElem.selectedIndex;
		playWarningBeep = playWarningBeepSelectorElem.selectedIndex;
		// save settings to local storage
		if (typeof localStorage === 'object') {
			try {
				localStorage.storedEndBeep = playEndBeep;
				localStorage.storedWarningBeep = playWarningBeep;
			} catch (e) {
				// silently ignore by doing nothing
			}
		}

		//playVoices
		playEndVoices = playEndVoicesSelectorElem.selectedIndex;
		playWarningVoices = playWarningVoicesSelectorElem.selectedIndex;
		//store it to localStorage
		if(typeof localStorage === 'object') {
				try {
						localStorage.storedPlayEndVoices = playEndVoices;
				} catch (e) {
						//silently ignore
				}
		}
		playWarningVoices = playEndVoicesSelectorElem.selectedIndex;
		//store it to localStorage
		if(typeof localStorage === 'object') {
				try {
						localStorage.storedPlayWarningVoices = playEndVoices;
				} catch (e) {
						//silently ignore
				}
		}

		//voice
		voiceIndex = speechVoiceSelectorElem.selectedIndex;
		if(voiceIndex >= 0) {
				//update the utterances
				var voice = voices[speechVoiceSelectorElem.options[voiceIndex].value];
				sayFiveSeconds.lang = voice.lang;
				sayFiveSeconds.voice = voice;
				sayTime.lang = voice.lang;
				sayTime.voice = voice;
				//store to localStorage
				if(typeof localStorage === 'object') {
						try {
								localStorage.storedVoiceName = voice.name + " " + voice.lang;
						} catch (e) {
								//silently ignore
						}
				}
		}

		//rate
		var rateIndex = speechRateSelectorElem.selectedIndex;
		rate = speechRateSelectorElem.options[rateIndex].value;
		//store it to localStorage
		if(typeof localStorage === 'object') {
				try {
						localStorage.storedSpeechRate = rate;
				} catch (e) {
						//silently ignore
				}
		}
		//update the utterances
		sayFiveSeconds.rate = rate;
		sayTime.rate = rate;

		//Hide settings panel
		settingsElem.style.visibility="hidden";
}

//User clicked cancel -- replace settings with stored values
function settingsCancel(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		blurAll();

		//playVoices is 0 or 1 and the selector is "no" or "yes", so the
		//  correct selected state can be indexed by playVoices
		playEndVoicesSelectorElem.options[playEndVoices].selected = true;
		playWarningVoicesSelectorElem.options[playWarningVoices].selected = true;
		playEndBeepSelectorElem.options[playEndBeep].selected = true;
		playWarningBeepSelectorElem.options[playWarningBeep].selected = true;

		//reset the voices selector
		speechVoiceSelectorElem.options[voiceIndex].selected = true;

		//reset the speech rate
		var numOptions = speechRateSelectorElem.options.length;
		for(var i=0; i<numOptions; i++) {
				if(speechRateSelectorElem.options[i].value == rate) {
						speechRateSelectorElem.options[i].selected = true;
				}
		}

		//Max seconds
		maxTimeBoxElem.value = maxTime;

		//finally, hide the panel
		settingsElem.style.visibility="hidden";
}

//In theory, if the appcache file is updated, the app will find out
//  (assumedly it checks the server when there's an internet connection?_
//Then, the app can update itself accordingly
function updateSite(event) {
		window.applicationCache.swapCache();
}
window.applicationCache.addEventListener('updateready', updateSite, false);

//Check what voices are available
//This won't work when the page first loads, so we'll
//  callit several times with delays between, and wait until we have
//  a list that's full multiple times.
function getVoicesList() {
		voices = window.speechSynthesis.getVoices();
		if (voices.length !== 0) {
				numPositiveVoiceCheck++;
				if(numPositiveVoiceCheck < 2) {
						//Make sure it's been populated for a while so that
						//  we didn't accidentally get an incomplete list
						return;
				}

				//populate the selector with the available voices
				var numVoices = voices.length;
				for(var i=0; i<numVoices; i++) {
						//only include ones that don't require internet access
						if(voices[i].localService) {
								var el = document.createElement("option");
								el.textContent = voices[i].name + " " + voices[i].lang;
								el.value = i;
								speechVoiceSelectorElem.appendChild(el);
						}
				}
		} else {
				return;
		}

		//By default, select the first en-US entry
		var numSelector = speechVoiceSelector.options.length;
		for(var i=0; i<numSelector; i++) {
				if(voices[speechVoiceSelectorElem.options[i].value].lang == "en-US" ||
					 voices[speechVoiceSelectorElem.options[i].value].lang == "en_US") { //android uses underscore
						speechVoiceSelectorElem.options[i].selected = true;
						break;
				}
		}

		//now check local storage -- if we've already stored the voice, then select it.  Otherwise, store the default
		if(typeof localStorage === 'object') {
				try {
						if(typeof localStorage.storedVoiceName == 'undefined') {
								localStorage.storedVoiceName = voices[speechVoiceSelector.options[speechVoiceSelectorElem.selectedIndex].value].name + " " + voices[speechVoiceSelector.options[selectV.selectedIndex].value].lang;;
						} else {
								var targetName = localStorage.storedVoiceName;
								for(var i=0; i<numSelector; i++) {
										if(voices[speechVoiceSelector.options[i].value].name + " " + voices[speechVoiceSelector.options[i].value].lang == targetName) {
												speechVoiceSelector.options[i].selected = true;;
												break;
										}
								}
						}
				} catch (e) {
						//silently ignore
				}
		}
		voiceIndex = speechVoiceSelector.selectedIndex;
		if(voiceIndex >= 0) {
				//If we have a voice selected, update the utterances
				var voice = voices[speechVoiceSelector.options[voiceIndex].value];
				sayFiveSeconds.lang = voice.lang;
				sayFiveSeconds.voice = voice;
				sayTime.lang = voice.lang;
				sayTime.voice = voice;
		}

    clearInterval(voiceGetterInterval);
}

// Functions
///////////////////////////////////////////


