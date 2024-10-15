# Tab Manager Chrome Extension

## Overview

The **Tab Manager** Chrome extension helps you manage your browser tabs efficiently. It allows you to search, tag, pin, and unpin tabs, making it easier to organize and navigate through your open tabs.

## Features

- **Search Tabs**: Quickly search through your open tabs using the search bar.
- **Tag Tabs**: Add tags to your tabs for better organization.
- **Pin/Unpin Tabs**: Easily pin or unpin tabs to keep important tabs accessible.
- **Short cut Close Tabs**: hover over a specific tab and close it with a single right click.
- **Voice Commands**: Control your tabs using voice commands for hands-free management.

## Installation
1. Clone the repository to your local machine:
  ```bash
  git clone https://github.com/abdel2000-dply/tab-manager.git
  ```
2. Open Chrome and navigate to chrome://extensions/.

3. Enable "Developer mode" by toggling the switch in the top right corner.

4. Click on "Load unpacked" and select the directory where you cloned the repository.

## Usage

1. Click on the Tab Manager extension icon in the Chrome toolbar to open the popup.

2. Use the search bar to find specific tabs by title, URL, or tags.

3. Add tags to your tabs using the input field and the "Add Tag" button.

4. Pin or unpin tabs using the pin icon next to each tab.

5. Close tabs using the right click of your mouse

6. **Voice Commands**:
   - Click on the microphone button in the popup to start voice recognition.
   - Speak commands like:
     - "search [query]" to search for tabs.
     - "add tag [tag]" to add a tag to selected tabs.
     - "close tab [query]" to close tabs matching the query.
     - "open [query]" to activate a tab matching the query.
     - "pin tab [query]" to pin a tab matching the query.
     - "unpin tab [query]" to unpin a tab matching the query.
   - The recognized commands will be processed only if the popup is open !!!

## File Structure

- `popup.html`: The HTML file for the extension's popup interface.
- `popup.css`: The CSS file for styling the popup interface.
- `popup.js`: The main JavaScript file for handling user interactions in the popup.
- `tabs.js`: JavaScript file for managing tab-related functionalities.
- `tags.js`: JavaScript file for managing tag-related functionalities.
- `storage.js`: JavaScript file for handling storage operations.

## Acknowledgements

- Font Awesome for the icons used in the extension.
- Chrome Extensions API for providing the necessary tools to build this extension.

## Author

- [Abdellah Abnoune](https://abdellahabnoune.engineer/)

Feel free to reach out if you have any questions or suggestions!
   