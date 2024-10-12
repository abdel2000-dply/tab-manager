const searchInput = document.getElementById('search-tabs');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('tabs-container');
const allTabs = document.getElementById('allTabs');
const addTagBtn = document.getElementById('add-tag-btn');
const tagInput = document.getElementById('tag-input');
const tagsContainer = document.getElementById('tag-container');

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

// Helper function to save tags to storage
function saveTagsToStorage(tabId, tags) {
  chrome.storage.local.get(['tabTags'], (result) => {
    const tabTags = result.tabTags || {};
    tabTags[tabId] = tags;
    chrome.storage.local.set({ tabTags });
    renderTagButtons(); // Update the tag filter buttons when a tag is added
  });
}

// Helper function to load tags from storage
function loadTagsFromStorage(callback) {
  chrome.storage.local.get(['tabTags'], (result) => {
    const tabTags = result.tabTags || {};
    callback(tabTags);
  });
}

// Function to render all tabs
function renderAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    allTabs.innerHTML = '';
    const ul = document.createElement('ul');
    loadTagsFromStorage((tabTags) => {
      tabs.forEach((tab) => {
        const tabEl = createTabElement(tab, tabTags[tab.id] || []);
        ul.appendChild(tabEl);
      });
      allTabs.appendChild(ul);
    });
  });
}

// Function to search for tabs
function searchTabs() {
  const query = searchInput.value.toLowerCase();
  chrome.tabs.query({}, (tabs) => {
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

// Function to create tab element
function createTabElement(tab, tags) {
  const tabEl = document.createElement('li');
  tabEl.dataset.tabId = tab.id;
  tabEl.innerHTML = `
    <div class="tab-content">
      <input type="checkbox" class="tab-checkbox">
      <img src="${tab.favIconUrl}" alt="Favicon" class="tab-icon">
      <div class="tags" style="float: right;">
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

// Function to activate tab
function activateTab(tabId) {
  chrome.tabs.update(tabId, { active: true });
}

// Function to close tab
function closeTab(event, tabId, tabEl) {
  event.preventDefault();
  chrome.tabs.remove(tabId);
  tabEl.remove();
}

// Function to add tags to selected tabs
function addTagToSelectedTabs() {
  const tag = tagInput.value.trim();
  if (tag) {
    const checkboxes = document.querySelectorAll('.tab-checkbox:checked');
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

    tagInput.value = '';
  }
}

// Function to render unique tag filter buttons
function renderTagButtons() {
  loadTagsFromStorage((tabTags) => {
    const uniqueTags = new Set();
    Object.values(tabTags).forEach((tags) => {
      tags.forEach((tag) => uniqueTags.add(tag));
    });

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

// Function to filter tabs by a specific tag
function filterTabsByTag(tag) {
  chrome.tabs.query({}, (tabs) => {
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

// Function to delete a tag from a specific tab
function deleteTagFromTab(tabId, tagName) {
  loadTagsFromStorage((tabTags) => {
    const tags = tabTags[tabId] || [];
    const updatedTags = tags.filter((tag) => tag !== tagName);
    tabTags[tabId] = updatedTags;
    chrome.storage.local.set({ tabTags }, renderTagButtons);
  });
}

// Function to delete a tag from the global tag container
function deleteTagFromGlobal(tagName) {
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
