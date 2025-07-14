// Function to check if the device is mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Show warning only on mobile devices
if (isMobileDevice()) {
  // Create the overlay
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

  // Add headline
  const message = document.createElement('h1');
  message.textContent = 'Uh oh! You’re on an unsupported device!';
  message.style.color = '#333';
  message.style.fontFamily = 'Arial, sans-serif';
  message.style.textAlign = 'center';
  message.style.marginBottom = '20px';
  overlay.appendChild(message);

  // Add image
  const image = document.createElement('img');
  image.src = 'https://assets.streamlinehq.com/image/private/w_800,h_800,ar_1/f_auto/v1/icons/london/product/product/page-under-construction-wmtenb7keckg4up70p7kc7.png?_a=DAJFJtWIZAAC';
  image.alt = 'Page Under Construction';
  image.style.width = '200px';
  image.style.height = '200px';
  image.style.objectFit = 'contain';
  overlay.appendChild(image);

  // Add additional text with a link
  const additionalMessage = document.createElement('p');
  additionalMessage.innerHTML = 'Please use a non-mobile device<br>or try <a href="mworkspace.html" class="nav-link">workspace mobile</a>.';
  additionalMessage.style.color = '#333';
  additionalMessage.style.fontFamily = 'Arial, sans-serif';
  additionalMessage.style.textAlign = 'center';
  additionalMessage.style.marginTop = '20px';
  additionalMessage.style.fontWeight = 'normal';
  additionalMessage.style.lineHeight = '1.6';
  overlay.appendChild(additionalMessage);

  // Add to page
  document.body.appendChild(overlay);
}

// Chat Button Hover Animation Logic (GIF)
// ----------------------------------------
const chatButton = document.querySelector('.chat-button img');

chatButton.addEventListener('mouseenter', () => {
  chatButton.src = 'workspace/images/chat_anim.gif';
});

chatButton.addEventListener('mouseleave', () => {
  chatButton.src = 'workspace/images/chat_btn.jpg';
});

