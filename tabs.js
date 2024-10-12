// tabs.js

import { loadTagsFromStorage, saveTagsToStorage } from './storage.js';
import { renderTagButtons } from './tags.js';

export function renderAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    try {
      const allTabs = document.getElementById('allTabs');
      allTabs.innerHTML = '';
      const ul = document.createElement('ul');
      loadTagsFromStorage((tabTags) => {
        tabs.forEach((tab) => {
          const tabEl = createTabElement(tab, tabTags[tab.id] || []);
          ul.appendChild(tabEl);
        });
        allTabs.appendChild(ul);
      });
    } catch (error) {
      return;
    }
  });
}

export function searchTabs() {
  const searchInput = document.getElementById('search-tabs');
  const query = searchInput.value.toLowerCase();
  chrome.tabs.query({}, (tabs) => {
    const searchResults = document.getElementById('tabs-container');
    searchResults.innerHTML = '';
    const ul = document.createElement('ul');
    loadTagsFromStorage((tabTags) => {
      tabs.forEach((tab) => {
        const title = tab.title.toLowerCase();
        const url = tab.url.toLowerCase();
        const tabTagsStr = (tabTags[tab.id] || []).join(' ').toLowerCase();

        if (
          title.includes(query) ||
          url.includes(query) ||
          tabTagsStr.includes(query)
        ) {
          const tabEl = createTabElement(tab, tabTags[tab.id] || []);
          ul.appendChild(tabEl);
        }
      });
      searchResults.appendChild(ul);
    });
  });
}

export function createTabElement(tab, tags) {
  const tabEl = document.createElement('li');
  tabEl.dataset.tabId = tab.id;
  tabEl.innerHTML = `
    <div class="tab-content">
      <input type="checkbox" class="tab-checkbox">
      <img src="${tab.favIconUrl}" alt="Favicon" class="tab-icon">
      <div class="tags"">
        ${tags
          .map(
            (tag) =>
              `<span class="tag">${tag} <i class="fa-solid fa-xmark tag-icon"></i></span>`
          )
          .join('')}
      </div>
      <div class="tab-details">
        <h4 class="tab-title">${tab.title}</h4>
        <p class="tab-url">${tab.url}</p>
      </div>
    </div>
  `;

  tabEl.querySelector('.tab-details').addEventListener('click', (event) => {
    if (!event.target.classList.contains('tag')) {
      activateTab(tab.id);
    }
  });
  tabEl.querySelector('.tab-icon').addEventListener('click', () => {
    activateTab(tab.id);
  });
  tabEl.addEventListener('contextmenu', (event) => {
    if (!event.target.classList.contains('tag')) {
      closeTab(event, tab.id, tabEl);
    }
  });

  // Add event listeners for removing tags
  tabEl.querySelectorAll('.tag-icon').forEach((tagIcon) => {
    tagIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      const tagEl = event.target.closest('.tag');
      const tagName = tagEl.textContent.trim();
      deleteTagFromTab(tab.id, tagName);
      tagEl.remove();
    });
  });

  // Add event listeners for filtering by tag
  tabEl.querySelectorAll('.tag').forEach(tagEl => {
    tagEl.addEventListener('click', (event) => {
      event.stopPropagation();
      const tagName = tagEl.textContent.trim();
      filterTabsByTag(tagName);
    });
  });

  return tabEl;
}

export function activateTab(tabId) {
  chrome.tabs.update(tabId, { active: true });
}

export function closeTab(event, tabId, tabEl) {
  event.preventDefault();
  chrome.tabs.remove(tabId);
  tabEl.remove();
}

export function addTagToSelectedTabs() {
  const tagInput = document.getElementById('tag-input');
  const tag = tagInput.value.trim();
  const noTabsSelectedMessage = document.getElementById('no-tabs-selected-message');
  const checkboxes = document.querySelectorAll('.tab-checkbox:checked');

  if (checkboxes.length === 0) {
    noTabsSelectedMessage.textContent = 'No tabs selected to add the tag.';
    noTabsSelectedMessage.style.display = 'block';
    return;
  } else {
    noTabsSelectedMessage.style.display = 'none';
  }

  if (!tag) {
    noTabsSelectedMessage.textContent = 'Tag input cannot be empty.';
    noTabsSelectedMessage.style.display = 'block';
    return;
  } else {
    noTabsSelectedMessage.style.display = 'none';
  }

  if (tag) {
    const tabIds = Array.from(checkboxes).map((checkbox) => {
      const tabEl = checkbox.closest('li');
      return parseInt(tabEl.dataset.tabId, 10);
    });

    loadTagsFromStorage((tabTags) => {
      tabIds.forEach((tabId) => {
        const tags = tabTags[tabId] || [];
        if (!tags.includes(tag)) {
          tags.push(tag);
          tabTags[tabId] = tags;
          const tabEl = document.querySelector(`li[data-tab-id="${tabId}"]`);
          const tagsContainer = tabEl.querySelector('.tags');
          const tagEl = document.createElement('span');
          tagEl.className = 'tag';
          tagEl.innerHTML = `${tag} <i class="fa-solid fa-xmark tag-icon"></i>`;
          tagsContainer.appendChild(tagEl);

          // Add event listener for the new tag's delete icon
          tagEl
            .querySelector('.tag-icon')
            .addEventListener('click', (event) => {
              event.stopPropagation();
              deleteTagFromTab(tabId, tag);
              tagEl.remove();
            });

          // Add event listener for filtering by the new tag
          tagEl.addEventListener('click', (event) => {
            event.stopPropagation();
            filterTabsByTag(tag);
          });
        }
      });

      chrome.storage.local.set({ tabTags }, () => {
        renderTagButtons(); // Update the tag filter buttons when a tag is added
      });
    });

    // Uncheck all checkboxes
    checkboxes.forEach(checkbox => checkbox.checked = false);

    tagInput.value = '';
  }
}

export function filterTabsByTag(tag) {
  chrome.tabs.query({}, (tabs) => {
    const searchResults = document.getElementById('tabs-container');
    if (!searchResults) {
      console.error('Element with ID "tabs-container" not found.');
      return;
    }
    searchResults.innerHTML = '';
    const ul = document.createElement('ul');
    loadTagsFromStorage((tabTags) => {
      tabs.forEach((tab) => {
        const tabTagsArray = tabTags[tab.id] || [];
        if (tabTagsArray.includes(tag)) {
          const tabEl = createTabElement(tab, tabTagsArray);
          ul.appendChild(tabEl);
        }
      });
      searchResults.appendChild(ul);
    });
  });
}

export function deleteTagFromTab(tabId, tagName) {
  loadTagsFromStorage((tabTags) => {
    const tags = tabTags[tabId] || [];
    const updatedTags = tags.filter((tag) => tag !== tagName);
    tabTags[tabId] = updatedTags;
    chrome.storage.local.set({ tabTags }, renderTagButtons);
  });
}