chrome.tabs.onCreated.addListener((tab) => {
  console.log('New tab created:', tab);
});