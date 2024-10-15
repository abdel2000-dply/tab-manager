// background.js

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', (event) => {
  // --
});

// Voice recognition setup
if (!('webkitSpeechRecognition' in self)) {
  console.error('Sorry, your browser does not support speech recognition.');
} else {
  const recognition = new self.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US'; // English

  recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    console.log('You said: ', transcript);
    handleVoiceCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  // Start voice recognition
  recognition.start();
}

// Function to handle voice commands
function handleVoiceCommand(command) {
  if (command.includes('search')) {
    const query = command.replace('search', '').trim();
    searchTabs(query);
  } else if (command.includes('add tag')) {
    const tag = command.replace('add tag', '').trim();
    addTagToSelectedTabs(tag);
  } else if (command.includes('close tab')) {
    const query = command.replace('close tab', '').trim();
    closeTabsByQuery(query);
  } else if (command.includes('open tab')) {
    const query = command.replace('open tab', '').trim();
    activateTabByQuery(query);
  } else if (command.includes('pin tab')) {
    const query = command.replace('pin tab', '').trim();
    pinTabByQuery(query);
  } else if (command.includes('unpin tab')) {
    const query = command.replace('unpin tab', '').trim();
    unpinTabByQuery(query);
  }
}

function closeTabsByQuery(query) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
        chrome.tabs.remove(tab.id);
      }
    });
  });
}

function activateTabByQuery(query) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
        chrome.tabs.update(tab.id, { active: true });
      }
    });
  });
}

function pinTabByQuery(query) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
        chrome.tabs.update(tab.id, { pinned: true });
      }
    });
  });
}

function unpinTabByQuery(query) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
        chrome.tabs.update(tab.id, { pinned: false });
      }
    });
  });
}

function searchTabs(query) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query)) {
        chrome.tabs.update(tab.id, { active: true });
      }
    });
  });
}

function addTagToSelectedTabs(tag) {
  chrome.tabs.query({ highlighted: true }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.storage.local.get({ tags: {} }, (result) => {
        const tags = result.tags;
        if (!tags[tab.id]) {
          tags[tab.id] = [];
        }
        if (!tags[tab.id].includes(tag)) {
          tags[tab.id].push(tag);
        }
        chrome.storage.local.set({ tags: tags }, () => {
          console.log(`Tag "${tag}" added to tab ${tab.id}`);
        });
      });
    });
  });
}

// Listen for messages from Welcome.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'recognized-speech') {
    console.log('Recognized speech received: ', message.transcript);
    handleVoiceCommand(message.transcript);
  }
});
