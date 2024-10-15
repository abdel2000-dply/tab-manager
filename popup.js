// popup.js
import { renderAllTabs, searchTabs, addTagToSelectedTabs } from './tabs.js';
import { renderTagButtons } from './tags.js';

const searchInput = document.getElementById('search-tabs');
const searchBtn = document.getElementById('search-btn');
const addTagBtn = document.getElementById('add-tag-btn');
const tagInput = document.getElementById('tag-input');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  renderAllTabs();
  renderTagButtons(); // Render tag filter buttons
});

searchBtn.addEventListener('click', searchTabs);
searchInput.addEventListener('input', () => {
  if (searchInput.value === '') {
    renderAllTabs();
  } else {
    searchTabs();
  }
});

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});

addTagBtn.addEventListener('click', addTagToSelectedTabs);

tagInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    addTagBtn.click();
  }
});

// Voice recognition setup
const startBtn = document.getElementById('voice-btn');
startBtn.addEventListener('click', () => {
  // Open a new tab to request microphone access
  chrome.tabs.create({
    url: chrome.runtime.getURL('request-microphone.html'),
    active: true
  });
});

// Listen for messages from request-microphone.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'recognized-speech') {
    console.log('Recognized speech received: ', message.transcript);
    handleVoiceCommand(message.transcript);
  }
});

// Function to handle voice commands
function handleVoiceCommand(command) {
  if (command.includes('search')) {
    const query = command.replace('search', '').trim();
    searchInput.value = query;
    searchTabs();
  } else if (command.includes('add tag')) {
    const tag = command.replace('add tag', '').trim();
    tagInput.value = tag;
    addTagToSelectedTabs();
  } else if (command.includes('close tab')) {
    const query = command.replace('close tab', '').trim();
    closeTabsByQuery(query);
  } else if (command.includes('open')) {
    const query = command.replace('open', '').trim();
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
