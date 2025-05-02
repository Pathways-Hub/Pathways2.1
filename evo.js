// Create a new anchor element
const evoLink = document.createElement('a');
evoLink.href = 'evo.html';  // Set the link destination to evo.html
evoLink.style.display = 'inline-block';  // Make the anchor tag an inline-block to wrap the image

// Create a new img element
const evoImage = document.createElement('img');
evoImage.src = 'images/evo.png';  // Image source
evoImage.alt = 'Evo Image'; // Alt text for accessibility

// Set the image styles to fix its position, size, and offset
evoImage.style.position = 'fixed';
evoImage.style.bottom = '10px';  // Move 10px from the bottom
evoImage.style.left = '10px';    // Move 10px from the left
evoImage.style.zIndex = '9999';  // Ensure it's on top of other elements
evoImage.style.width = '260px';  // Set the width
evoImage.style.height = 'auto';  // Maintain aspect ratio

// Append the image to the anchor element
evoLink.appendChild(evoImage);

// Append the anchor tag to the body
document.body.appendChild(evoLink);

// Function to check the screen width and hide/show the image
function checkScreenSize() {
    if (window.innerWidth <= 768) {
        evoLink.style.display = 'none';  // Hide the image if screen width is 768px or smaller
    } else {
        evoLink.style.display = 'inline-block'; // Show the image if screen width is larger than 768px
    }
}

// Initial check
checkScreenSize();

// Add an event listener to handle screen resize
window.addEventListener('resize', checkScreenSize);
