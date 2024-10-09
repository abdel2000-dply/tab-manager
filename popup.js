const searchInput = document.getElementById('search-tabs');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('tabs-container');
const allTabs = document.getElementById('allTabs');

document.addEventListener('DOMContentLoaded', () => {
  // Display all tabs when popup is opened
  renderAllTabs();
});

searchBtn.addEventListener('click', () => {
  // Display search results when search button is clicked
  searchTabs();
});

searchInput.addEventListener('keyup', (event) => {
  // Display search results when Enter key is pressed
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});

function renderAllTabs() {
  // Get all tabs and display them in the popup
  chrome.tabs.query({}, (tabs) => {
    allTabs.innerHTML = '';
    const ul = document.createElement('ul');
    tabs.forEach((tab) => {
      const tabEl = createTabElement(tab);
      // Now we have title, url, and favIconUrl in tabEl(li)
      ul.appendChild(tabEl);
    });
    // Now we have all tabs in ul
    allTabs.appendChild(ul);
  });
}

function searchTabs() {
  // Get search query and display search results in the popup
  const query = searchInput.value.toLowerCase();

  chrome.tabs.query({}, (tabs) => {
    searchResults.innerHTML = '';
    const ul = document.createElement('ul');
    tabs.forEach((tab) => {
      const title = tab.title.toLowerCase();
      const url = tab.url.toLowerCase();
      if (title.includes(query) || url.includes(query)) {
        // only display tabs that match the search query
        const tabEl = createTabElement(tab); // create tab element(contains title, url, and favIconUrl)
        ul.appendChild(tabEl); // Until all found tabs are appended to ul
      }
    });
    searchResults.appendChild(ul);
  });
}

function createTabElement(tab) {
  // Create a list item element for the tab
  const tabEl = document.createElement('li');

  const icon = document.createElement('img');
  icon.src = tab.favIconUrl; // the style of the icon is defined in popup.css

  const tabTitle = document.createElement('h4');
  tabTitle.textContent = tab.title; // the style of the title is defined in popup.css
  
  const text = document.createElement('p');
  text.textContent = tab.url; // the style of the text is defined in popup.css

  tabEl.addEventListener('click', () => {
    chrome.tabs.update(tab.id, { active: true });
  });

  tabEl.addEventListener('contextmenu', (event) => {
    // right-clicking on a tab will close it
    event.preventDefault();
    chrome.tabs.remove(tab.id);
    // After closing the tab, the tab will be removed from the popup
    tabEl.remove();
  });

  tabEl.addEventListener('mouseover', () => {
    // Preview the tab when hovering over it
    
  });

  tabEl.appendChild(icon);
  tabEl.appendChild(tabTitle);
  tabEl.appendChild(text);

  return tabEl;
}