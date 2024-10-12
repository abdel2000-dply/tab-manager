// tags.js

import { loadTagsFromStorage, saveTagsToStorage } from './storage.js';
import { renderAllTabs, filterTabsByTag } from './tabs.js';

export function renderTagButtons() {
  loadTagsFromStorage((tabTags) => {
    const uniqueTags = new Set();
    Object.values(tabTags).forEach((tags) => {
      tags.forEach((tag) => uniqueTags.add(tag));
    });

    const tagsContainer = document.getElementById('tag-container');
    tagsContainer.innerHTML = ''; // Clear previous buttons
    uniqueTags.forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.classList.add('tag');
      tagEl.innerHTML = `${tag} <i class="fa-solid fa-xmark tag-icon"></i>`;
      tagEl.querySelector('.tag-icon').addEventListener('click', (event) => {
        event.stopPropagation();
        deleteTagFromGlobal(tag);
        tagEl.remove();
      });

      // Add event listener for filtering by tag
      tagEl.addEventListener('click', (event) => {
        event.stopPropagation();
        filterTabsByTag(tag);
      });

      tagsContainer.appendChild(tagEl);
    });
  });
}

export function deleteTagFromGlobal(tagName) {
  loadTagsFromStorage((tabTags) => {
    for (const tabId in tabTags) {
      tabTags[tabId] = tabTags[tabId].filter((tag) => tag !== tagName);
    }
    chrome.storage.local.set({ tabTags }, () => {
      renderAllTabs();
      renderTagButtons();
    });
  });
}