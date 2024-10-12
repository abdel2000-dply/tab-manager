// storage.js

export function saveTagsToStorage(tabId, tags, callback) {
  chrome.storage.local.get(['tabTags'], (result) => {
    const tabTags = result.tabTags || {};
    tabTags[tabId] = tags;
    chrome.storage.local.set({ tabTags }, callback);
  });
}

export function loadTagsFromStorage(callback) {
  chrome.storage.local.get(['tabTags'], (result) => {
    const tabTags = result.tabTags || {};
    callback(tabTags);
  });
}