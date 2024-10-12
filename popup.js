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