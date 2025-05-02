// Create the popup element
const popup = document.createElement('div');
popup.id = 'updatePopup';
popup.style.position = 'fixed';
popup.style.bottom = '20px'; // Adjust the distance from the bottom of the window
popup.style.left = '50%'; 
popup.style.transform = 'translateX(-50%)'; // Center the popup horizontally
popup.style.backgroundColor = '#d9534f'; // Light matte red
popup.style.color = 'white';
popup.style.padding = '15px 30px';
popup.style.borderRadius = '5px';
popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
popup.style.zIndex = '1000';
popup.style.display = 'flex';
popup.style.justifyContent = 'space-between';
popup.style.alignItems = 'center';
popup.style.minWidth = '300px';
popup.style.fontFamily = 'Arial, sans-serif';

// Add the content
const popupContent = `
    <div>
        <strong>New Updates</strong><br>
        <span>Pathways is currently in a closed beta state and is not open to the public.</span>
    </div>
    <span id="closePopup" style="cursor: pointer; margin-left: 20px; font-weight: bold;">&times;</span>
`;

popup.innerHTML = popupContent;

// Append to the body
document.body.appendChild(popup);

// Add close functionality
document.getElementById('closePopup').addEventListener('click', function() {
    popup.style.display = 'none';
});
