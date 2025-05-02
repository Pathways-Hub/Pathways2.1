// Create the line element
const line = document.body.appendChild(document.createElement('div'));

// Create the button element
const button = document.body.appendChild(document.createElement('button'));

// Add Font Awesome icon to the button
const icon = document.createElement('i');
icon.classList.add('fas', 'fa-bars'); // Font Awesome bars icon
button.appendChild(icon);

// Style the line element with initial properties
Object.assign(line.style, {
  position: 'fixed',
  top: '45vh',              // Centers the line vertically for a shorter line
  right: '10px',            // Inset from the right edge
  width: '2px',             // Thin line
  height: '10vh',           // Short line (10% of the viewport height)
  backgroundColor: '#e0e0e0', // Slightly darker off-white color
  borderRadius: '0',        // No border radius initially
  transition: 'all 0.3s ease', // Smooth transition
  transformOrigin: 'center', // Expansion occurs from the center
  pointerEvents: 'none',    // Allows mouse events to pass through the line
});

// Style the button element (initially hidden)
Object.assign(button.style, {
  position: 'absolute',
  width: '60px',            // Button size
  height: '60px',           // Button size
  backgroundColor: 'transparent', // Fully transparent background
  borderRadius: '50%',      // Make it a circle
  opacity: '0',             // Initially hidden (fade-in effect)
  transition: 'opacity 0.5s ease', // Smooth fade-in transition
  border: 'none',           // No border for the button
  pointerEvents: 'all',     // Make it clickable
  display: 'flex',          // Align the icon in the center
  justifyContent: 'center', // Center the icon horizontally
  alignItems: 'center',     // Center the icon vertically
});

// Adjust the icon style
Object.assign(icon.style, {
  fontSize: '24px',         // Icon size
  color: '#000',            // Set the icon color to black
});

// Set the distance threshold (in pixels) for transformation to occur
const proximityThresholdX = 50;    // Horizontal distance threshold (right/left)
const proximityThresholdY = 150;   // Vertical distance threshold (above/below)

// Add event listener to track mouse movement
document.addEventListener('mousemove', (e) => {
  // Get the line's bounding rectangle
  const rect = line.getBoundingClientRect();
  const lineCenterX = rect.left + rect.width / 2;
  const lineCenterY = rect.top + rect.height / 2;

  // Calculate the distance between the mouse and the center of the line
  const distanceX = Math.abs(e.clientX - lineCenterX); // Horizontal distance
  const distanceY = Math.abs(e.clientY - lineCenterY); // Vertical distance

  // If the mouse is within both proximity thresholds, expand and round the line
  if (distanceX < proximityThresholdX && distanceY < proximityThresholdY) {
    line.style.width = '60px';         // Make the line 60px wide (thicker)
    line.style.height = '30vh';        // Make the rectangle much taller
    line.style.top = '35vh';           // Re-center vertically to account for new height
    line.style.borderRadius = '30px';  // Apply curve to top and bottom (adjust as needed)

    // Position the button in the center of the expanded rectangle
    button.style.top = `calc(35vh + 15vh - 30px)`; // 35vh (top) + half height of the rectangle - half button size
    button.style.right = '15px';        // Move the button further to the right (from 25px to 15px)

    // Make the button fade in smoothly
    button.style.opacity = '1';        // Show the button (fade in)
  } else {
    line.style.width = '2px';          // Revert to original thin width
    line.style.height = '10vh';        // Revert to original height
    line.style.top = '45vh';           // Reset position to original center
    line.style.borderRadius = '0';     // Remove border radius

    // Hide the button (fade out)
    button.style.opacity = '0';        // Hide the button (fade out)
  }
});
