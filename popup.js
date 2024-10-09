const searchInput = document.getElementById('search-tabs');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('tabs');

const allTabs = document.getElementById('allTabs');

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({}, (tabs) => {
    allTabs.innerHTML = '';
    tabs.forEach((tab) => {
      const title = tab.title.toLowerCase();
      const tabEl = document.createElement('li');
        tabEl.textContent = tab.title;
        tabEl.addEventListener('click', () => {
          chrome.tabs.update(tab.id, { active: true });
        });
        allTabs.appendChild(tabEl);
    });
  });
});

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase();

  chrome.tabs.query({}, (tabs) => {
    searchResults.innerHTML = '';
    tabs.forEach((tab) => {
      const title = tab.title.toLowerCase();
      const url = tab.url.toLowerCase();
      if (title.includes(query) || url.includes(query)) {
        const tabEl = document.createElement('li');
        tabEl.textContent = tab.title;
        tabEl.addEventListener('click', () => {
          chrome.tabs.update(tab.id, { active: true });
        });
        searchResults.appendChild(tabEl);
      }
    });
  });
});

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});
