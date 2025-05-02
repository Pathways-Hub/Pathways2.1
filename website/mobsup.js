// Function to check if the device is mobile
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }
  
  // Create the overlay only if the device is mobile
  if (isMobileDevice()) {
    // Create a div to act as the full-screen overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#f9f9f9';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
  
    // Add the warning message
    const message = document.createElement('h1');
    message.textContent = 'Uh oh! You’re on an unsupported device!';
    message.style.color = '#333';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.textAlign = 'center';
    message.style.marginBottom = '20px';
    overlay.appendChild(message);
  
    // Add the image
    const image = document.createElement('img');
    image.src = 'https://assets.streamlinehq.com/image/private/w_800,h_800,ar_1/f_auto/v1/icons/london/product/product/page-under-construction-wmtenb7keckg4up70p7kc7.png?_a=DAJFJtWIZAAC';
    image.alt = 'Page Under Construction';
    image.style.width = '200px';
    image.style.height = '200px';
    image.style.objectFit = 'contain';
    overlay.appendChild(image);
  
    // Add the additional message (non-bold, with line breaks)
    const additionalMessage = document.createElement('p');
    additionalMessage.innerHTML = 'Please use a non mobile device<br>or install the mobile app'; // Using <br> to break the line
    additionalMessage.style.color = '#333';
    additionalMessage.style.fontFamily = 'Arial, sans-serif';
    additionalMessage.style.textAlign = 'center';
    additionalMessage.style.marginTop = '20px';
    additionalMessage.style.fontWeight = 'normal'; // Non-bold
    overlay.appendChild(additionalMessage);
  
    // Append the overlay to the body
    document.body.appendChild(overlay);
  }
  