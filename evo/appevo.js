// Create a new img element
const evoImage = document.createElement('img');
evoImage.src = 'evo/evoai.png';  // Image source
evoImage.alt = 'Evo Image'; // Alt text for accessibility

// Set the image styles to fix its position, size, and offset
evoImage.style.position = 'fixed';
evoImage.style.bottom = '10px';  // Move 10px from the bottom
evoImage.style.right = '30px';    // Move 10px from the left
evoImage.style.zIndex = '9999';  // Ensure it's on top of other elements
evoImage.style.width = '50px';  // Set the width
evoImage.style.height = 'auto';  // Maintain aspect ratio
evoImage.style.cursor = 'pointer'; // Change cursor to pointer on hover

// Append the image to the body
document.body.appendChild(evoImage);

// Create the popup box for the cooldown message
let popupBox;
function createPopup() {
    // Create a popup element if it doesn't exist
    if (!popupBox) {
        popupBox = document.createElement('div');
        popupBox.style.position = 'fixed';
        popupBox.style.bottom = '70px';  // Position it above the image
        popupBox.style.right = '30px';
        popupBox.style.backgroundColor = '#333';  // Dark grey background
        popupBox.style.color = 'white';  // White text color
        popupBox.style.padding = '10px';
        popupBox.style.borderRadius = '5px';
        popupBox.style.zIndex = '9998';  // Ensure it's above other elements
        popupBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
        popupBox.style.display = 'none'; // Hidden by default

        // Create the text inside the popup
        const title = document.createElement('div');
        title.innerHTML = '<strong>Information</strong>';  // Bold text for title
        popupBox.appendChild(title);

        const message = document.createElement('div');
        message.innerHTML = 'Evo is currently unavalable.';  // Normal text for message
        popupBox.appendChild(message);

        // Append the popup to the body
        document.body.appendChild(popupBox);
    }
}

// Variable to track if the button is in cooldown state
let isCooldown = false;

// Function to create the inward glow effect and play the sound
function createGlowEffect() {
    // If the button is in cooldown, show the popup only if it's pressed again
    if (isCooldown) {
        // Show the popup if the user presses it more than once
        popupBox.style.display = 'block'; // Show the popup
        return; // Exit the function to prevent further actions
    }

    // Otherwise, start the glow effect and sound
    let glowElement = document.getElementById('screen-glow');
    if (!glowElement) {
        // Create a div element for the glow effect
        glowElement = document.createElement('div');
        glowElement.id = 'screen-glow';

        // Set styles for the inward glow effect (thinner glow)
        glowElement.style.position = 'fixed';
        glowElement.style.top = '0';
        glowElement.style.left = '0';
        glowElement.style.width = '100%';
        glowElement.style.height = '100%';
        glowElement.style.pointerEvents = 'none'; // Make it non-interactive
        glowElement.style.zIndex = '9998'; // Below the image but above other content
        glowElement.style.boxShadow = 
            'inset 0px 0px 50px 15px rgba(70, 130, 180, 0.7)'; // Thinner glow initially
        glowElement.style.opacity = '0'; // Start with invisible
        glowElement.style.transition = 'opacity 1s ease-in-out'; // Smooth fade-in and fade-out

        // Append the glow effect to the body
        document.body.appendChild(glowElement);

        // Trigger the animation for color transition and opacity change
        setTimeout(() => {
            glowElement.style.opacity = '1'; // Fade in
            glowElement.style.boxShadow = 
                'inset 0px 0px 50px 15px rgba(135, 206, 250, 0.9)'; // Brighter blue glow after fade-in
        }, 100); // Start color transition after the initial opacity transition starts

        // Remove the glow effect after 1.5 seconds
        setTimeout(() => {
            glowElement.style.opacity = '0'; // Fade out
            setTimeout(() => {
                glowElement.remove(); // Remove from DOM
            }, 1000); // Wait for fade-out transition
        }, 1500); // Duration of the visible glow effect
    }

    // Play the sound effect
    const sound = new Audio('evo/evo.mp3'); // Make sure the path is correct
    sound.play();

    // Start the cooldown (disable the button for 5 seconds)
    isCooldown = true;

    // Hide the popup after 5 seconds if the button is pressed again
    setTimeout(() => {
        isCooldown = false; // Enable button again after cooldown
        popupBox.style.display = 'none'; // Hide the popup
    }, 5000); // 5-second cooldown
}

// Add an event listener for click on the image
evoImage.addEventListener('click', createGlowEffect);

// Function to check the screen width and hide/show the image
function checkScreenSize() {
    if (window.innerWidth <= 768) {
        evoImage.style.display = 'none';  // Hide the image if screen width is 768px or smaller
    } else {
        evoImage.style.display = 'block'; // Show the image if screen width is larger than 768px
    }
}

// Initial check
checkScreenSize();

// Add an event listener to handle screen resize
window.addEventListener('resize', checkScreenSize);

// Initialize the popup
createPopup();
