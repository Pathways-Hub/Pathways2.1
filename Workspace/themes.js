// Select the button element
const menuButton = document.getElementById('pmenu');

// Create the menu element
const menu = document.createElement('div');
menu.id = 'curved-menu';
menu.style.position = 'fixed';
menu.style.top = '0'; // Align the menu to the top of the screen
menu.style.right = '0'; // Align the menu to the right of the screen
menu.style.bottom = '0'; // Extend the menu to the bottom of the screen
menu.style.width = '250px'; // Set the menu width
menu.style.backgroundColor = 'white';
menu.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
menu.style.transform = 'translateX(100%)'; // Hide the menu initially
menu.style.transition = 'transform 0.3s ease-in-out, visibility 0s 0.3s'; // Add visibility transition
menu.style.visibility = 'hidden'; // Initially set the menu as invisible
menu.style.overflow = 'hidden'; // Ensure content doesn’t overflow
menu.style.display = 'flex';
menu.style.flexDirection = 'column';
menu.style.zIndex = '1002'; // Ensure the menu is above all other content

// Add the title to the menu
const menuTitle = document.createElement('div');
menuTitle.innerText = 'Menu';
menuTitle.style.fontSize = '16px';
menuTitle.style.fontWeight = 'bold';
menuTitle.style.padding = '10px';
menuTitle.style.borderBottom = '1px solid #ddd';
menuTitle.style.textAlign = 'left';

// Create the close icon button
const closeButton = document.createElement('button');
closeButton.style.position = 'absolute';
closeButton.style.top = '10px';
closeButton.style.left = '10px';
closeButton.style.border = 'none';
closeButton.style.backgroundColor = 'transparent';
closeButton.style.cursor = 'pointer';
closeButton.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
closeButton.addEventListener('click', () => {
  isMenuVisible = false;
  menu.style.transform = 'translateX(100%)';
  menu.style.visibility = 'hidden';
  menu.style.transition = 'transform 0.3s ease-in-out, visibility 0s 0.3s';
});

// Append the close button next to the menu title
menuTitle.style.paddingLeft = '40px'; // Ensure the menu title doesn’t overlap with the close button
menu.appendChild(menuTitle);
menu.appendChild(closeButton);

// Add buttons and other elements (the same as in your original code)
// [button creation code here]

// Append the menu to the body
document.body.appendChild(menu);

// Add buttons and other elements
const buttons = [
  { text: 'Workspaces', link: 'workspaces.html' },
  { text: 'Dates', link: 'calendar.html' },
  { text: 'Account', link: 'interfaces.html' },
  { text: 'Settings', link: 'documents.html' },
  { text: 'Hub', link: 'hub.html' }
];

buttons.forEach((buttonData, index) => {
  const button = document.createElement('button');
  button.innerText = buttonData.text;
  button.style.padding = '10px';
  button.style.border = 'none';
  button.style.backgroundColor = 'white';
  button.style.textAlign = 'left';
  button.style.cursor = 'pointer';
  button.style.width = '100%';

  // Highlight active button
  if (index === 0) {
    button.style.backgroundColor = '#f0f0f0';
    button.style.fontWeight = 'bold';
  }

  button.addEventListener('click', () => {
    buttons.forEach((_, idx) => {
      const allButtons = document.querySelectorAll('#curved-menu button');
      allButtons[idx].style.backgroundColor = 'white';
      allButtons[idx].style.fontWeight = 'normal';
    });

    button.style.backgroundColor = '#f0f0f0';
    button.style.fontWeight = 'bold';
    if (buttonData.link) {
      window.location.href = buttonData.link;
    }
    updateLastEdited();
  });

  menu.appendChild(button);
});

// Add a divider line after the zone buttons
const zoneDivider = document.createElement('div');
zoneDivider.style.borderBottom = '1px solid #ddd';
zoneDivider.style.margin = '10px 0';
menu.appendChild(zoneDivider);

// Add subtitle above the theme toggle section
const themeSubtitle = document.createElement('div');
themeSubtitle.innerText = 'Theme';
themeSubtitle.style.fontSize = '14px';
themeSubtitle.style.fontWeight = 'normal';
themeSubtitle.style.padding = '10px';
themeSubtitle.style.textAlign = 'left';
menu.appendChild(themeSubtitle);

// Add sun and moon icons for theme toggle
const themeToggleContainer = document.createElement('div');
themeToggleContainer.style.display = 'flex';
themeToggleContainer.style.justifyContent = 'space-between';
themeToggleContainer.style.padding = '10px';

// Create the sun button (light mode)
const sunButton = document.createElement('button');
sunButton.innerHTML = '<i class="fas fa-sun" style="color: #f0c100;"></i>';
sunButton.style.border = 'none';
sunButton.style.backgroundColor = 'white';
sunButton.style.cursor = 'pointer';
sunButton.addEventListener('click', () => {
  document.body.classList.remove('dark-mode');
  document.body.classList.add('light-mode');
  updateHeaderBackground();
  localStorage.setItem('theme', 'light');
});

// Create the moon button (dark mode)
const moonButton = document.createElement('button');
moonButton.innerHTML = '<i class="fas fa-moon" style="color: #6c757d;"></i>';
moonButton.style.border = 'none';
moonButton.style.backgroundColor = 'white';
moonButton.style.cursor = 'pointer';
moonButton.addEventListener('click', () => {
  document.body.classList.remove('light-mode');
  document.body.classList.add('dark-mode');
  updateHeaderBackground();
  localStorage.setItem('theme', 'dark');
});

themeToggleContainer.appendChild(sunButton);
themeToggleContainer.appendChild(moonButton);
menu.appendChild(themeToggleContainer);

// Append the menu to the body
document.body.appendChild(menu);

// Set default theme based on localStorage or use light mode by default
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme + '-mode');
updateHeaderBackground();

// Function to update header background color based on theme
function updateHeaderBackground() {
  const header = document.querySelector('header');
  if (document.body.classList.contains('dark-mode')) {
    header.style.backgroundColor = '#121212';
  } else {
    header.style.backgroundColor = '#ffffff';
  }
}

// Add a line divider above the subtitle
const divider = document.createElement('div');
divider.style.borderTop = '1px solid #ddd';
divider.style.marginTop = '20px'; // Space above the divider

// Append the divider to the menu
menu.appendChild(divider);

// Add a subtitle for the Templates section
const templatesSubtitle = document.createElement('div');
templatesSubtitle.innerText = 'Resources';
templatesSubtitle.style.fontSize = '14px';
templatesSubtitle.style.fontWeight = 'normal';
templatesSubtitle.style.color = '#555'; // Subtle gray color for the subtitle
templatesSubtitle.style.padding = '10px';
templatesSubtitle.style.marginTop = '10px'; // Space above the subtitle
templatesSubtitle.style.textAlign = 'left';

// Append the subtitle to the menu
menu.appendChild(templatesSubtitle);

// Add the "Templates" button
const hubpage = document.createElement('button');
hubpage.innerHTML = '<i class="fa-solid fa-house"></i> Home'; // Add the icon before the text
hubpage.style.padding = '10px';
hubpage.style.border = 'none';
hubpage.style.backgroundColor = 'white';
hubpage.style.textAlign = 'left';
hubpage.style.cursor = 'pointer';
hubpage.style.width = '100%';
hubpage.style.fontSize = '14px';
hubpage.style.display = 'flex'; // Flex to align icon and text
hubpage.style.alignItems = 'center'; // Center the icon and text vertically
hubpage.style.gap = '10px'; // Add space between the icon and the text
hubpage.addEventListener('click', () => {
  window.location.href = 'hub.html'; // Redirect to the Templates page
});

// Append the Templates button to the menu
menu.appendChild(hubpage);

// Add the "Templates" button
const templatesButton = document.createElement('button');
templatesButton.innerHTML = '<i class="fa-solid fa-shapes"></i> Templates'; // Add the icon before the text
templatesButton.style.padding = '10px';
templatesButton.style.border = 'none';
templatesButton.style.backgroundColor = 'white';
templatesButton.style.textAlign = 'left';
templatesButton.style.cursor = 'pointer';
templatesButton.style.width = '100%';
templatesButton.style.fontSize = '14px';
templatesButton.style.display = 'flex'; // Flex to align icon and text
templatesButton.style.alignItems = 'center'; // Center the icon and text vertically
templatesButton.style.gap = '10px'; // Add space between the icon and the text
templatesButton.addEventListener('click', () => {
  window.location.href = 'templates.html'; // Redirect to the Templates page
});

// Append the Templates button to the menu
menu.appendChild(templatesButton);

// Add the "Inbox" button
const inboxbutton = document.createElement('button');
inboxbutton.innerHTML = '<i class="fa-solid fa-inbox fa-fade"></i> Inbox'; // Add the icon before the text
inboxbutton.style.padding = '10px';
inboxbutton.style.border = 'none';
inboxbutton.style.backgroundColor = 'white';
inboxbutton.style.textAlign = 'left';
inboxbutton.style.cursor = 'pointer';
inboxbutton.style.width = '100%';
inboxbutton.style.fontSize = '14px';
inboxbutton.style.display = 'flex'; // Flex to align icon and text
inboxbutton.style.alignItems = 'center'; // Center the icon and text vertically
inboxbutton.style.gap = '10px'; // Add space between the icon and the text

// Append the button to the menu
menu.appendChild(inboxbutton);

// Append the button to the menu
menu.appendChild(inboxbutton);

// Create the popup overlay and container
const popupOverlay = document.createElement('div');
popupOverlay.id = 'popupOverlay';
popupOverlay.style.position = 'fixed';
popupOverlay.style.top = '0';
popupOverlay.style.left = '0';
popupOverlay.style.width = '100%';
popupOverlay.style.height = '100%';
popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
popupOverlay.style.display = 'none';
popupOverlay.style.zIndex = '9998';

const popupContainer = document.createElement('div');
popupContainer.id = 'popupContainer';
popupContainer.style.position = 'fixed';
popupContainer.style.top = '50%';
popupContainer.style.left = '50%';
popupContainer.style.transform = 'translate(-50%, -50%)';
popupContainer.style.width = '400px';
popupContainer.style.backgroundColor = 'white';
popupContainer.style.padding = '20px';
popupContainer.style.borderRadius = '8px';
popupContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
popupContainer.style.display = 'none';
popupContainer.style.zIndex = '9999';

// Add popup content
const imageElement = document.createElement('img');
imageElement.id = 'popupImage';
imageElement.src = 'Workspace/images/inbox.png';
imageElement.alt = 'Inbox';
imageElement.style.width = '100%';
imageElement.style.borderRadius = '8px';

const titleElement = document.createElement('div');
titleElement.id = 'popupTitle';
titleElement.textContent = 'Pathways Inbox';
titleElement.style.marginTop = '15px';
titleElement.style.fontSize = '18px';
titleElement.style.fontWeight = 'bold';
titleElement.style.textAlign = 'center';

// Create a function to generate a message box
function createMessageBox(title, content) {
    const messageBox = document.createElement('div');
    messageBox.style.backgroundColor = '#f2f2f2'; // Light blue background
    messageBox.style.borderRadius = '5px';
    messageBox.style.padding = '10px';
    messageBox.style.marginTop = '10px';
    messageBox.style.textAlign = 'left';

    const messageTitle = document.createElement('div');
    messageTitle.textContent = title;
    messageTitle.style.fontWeight = 'bold';
    messageTitle.style.color = 'black'; // Black text for the title

    const messageContent = document.createElement('div');
    messageContent.textContent = content;
    messageContent.style.color = '#333'; // Dark text for better contrast

    messageBox.appendChild(messageTitle);
    messageBox.appendChild(messageContent);
    return messageBox;
}

// Add message boxes
popupContainer.appendChild(imageElement);
popupContainer.appendChild(titleElement);
popupContainer.appendChild(createMessageBox('Update 1', 'Example text for the first update.'));

// Add "No More Updates" message
const noMoreUpdates = document.createElement('div');
noMoreUpdates.textContent = '...';
noMoreUpdates.style.color = 'grey';
noMoreUpdates.style.marginTop = '20px';
noMoreUpdates.style.textAlign = 'center';
popupContainer.appendChild(noMoreUpdates);

// Append the popup and overlay to the body
document.body.appendChild(popupOverlay);
document.body.appendChild(popupContainer);

// Add event listener to the Inbox button
inboxbutton.addEventListener('click', () => {
    // Show the popup
    popupOverlay.style.display = 'block';
    popupContainer.style.display = 'block';
});

// Close popup when clicking outside
popupOverlay.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
    popupContainer.style.display = 'none';
});

// Toggle menu visibility
let isMenuVisible = false;
menuButton.addEventListener('click', () => {
  isMenuVisible = !isMenuVisible;
  menu.style.transform = isMenuVisible ? 'translateX(0)' : 'translateX(100%)';
  menu.style.visibility = isMenuVisible ? 'visible' : 'hidden';
  menu.style.transition = isMenuVisible ? 'transform 0.3s ease-in-out' : 'transform 0.3s ease-in-out, visibility 0s 0.3s';
});

// Create a "Last Edited" section
const lastEdited = document.createElement('div');
lastEdited.id = 'last-edited';
lastEdited.style.fontSize = '12px';
lastEdited.style.fontStyle = 'italic';
lastEdited.style.textAlign = 'left';
lastEdited.style.padding = '10px';
lastEdited.style.borderTop = '1px solid #ddd';
lastEdited.innerText = 'Last edited: Never'; // Default text
menu.appendChild(lastEdited);

// Function to update the "Last Edited" timestamp
function updateLastEdited() {
  const now = new Date();
  const formattedTime = now.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  lastEdited.innerText = `Last edited: ${formattedTime}`;
}

// Listen for keydown events to detect typing
document.addEventListener('keydown', () => {
  updateLastEdited();
});

// Update logo based on theme
function updateLogo() {
  const logo = document.querySelector('#logo');
  if (document.body.classList.contains('dark-mode')) {
    logo.src = 'images/pathways light.png';
  } else {
    logo.src = 'images/pathways.png';
  }
}
sunButton.addEventListener('click', updateLogo);
moonButton.addEventListener('click', updateLogo);
updateLogo();
