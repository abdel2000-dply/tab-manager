// welcome.js

document.getElementById('request-microphone').addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      console.log('Microphone access granted.');
      startRecognition();
    })
    .catch(err => {
      console.error('Microphone access denied:', err);
    });
});

function startRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    console.log('You said: ', transcript);
    // Send the recognized speech to the popup
    chrome.runtime.sendMessage({ type: 'recognized-speech', transcript });
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.start();
}