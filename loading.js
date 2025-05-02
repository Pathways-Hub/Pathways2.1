window.onload = function() {
    // Create a container for the loading screen if it doesn't exist
    let loadingContainer = document.createElement('div');
    loadingContainer.id = 'loadingContainer';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '100%';
    loadingContainer.style.backgroundColor = 'white';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.flexDirection = 'column';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.zIndex = '9999'; // To make sure it's on top of everything

    // Create the loading image element
    let loadingImage = document.createElement('img');
    loadingImage.id = 'loadingImage';
    loadingImage.src = 'images/loading.png';
    loadingImage.style.maxWidth = '150px';
    loadingImage.style.marginBottom = '20px';

    // Create the loading text element
    let loadingText = document.createElement('div');
    loadingText.id = 'loadingText';
    loadingText.style.fontSize = '18px';  // Reduced font size to 18px
    loadingText.style.color = 'black';  // Removed bold styling

    // Append the image and text to the container
    loadingContainer.appendChild(loadingImage);
    loadingContainer.appendChild(loadingText);

    // Append the loading container to the body
    document.body.appendChild(loadingContainer);

    // Function to animate the ellipsis
    function animateEllipsis() {
        let ellipsis = "";
        setInterval(() => {
            ellipsis = (ellipsis.length < 3) ? ellipsis + "." : "";
            loadingText.textContent = "Pathways is loading" + ellipsis;
        }, 500);
    }

    // Function to hide the loading screen after a random time between 2 and 10 seconds
    function hideLoadingScreen() {
        const duration = Math.random() * (10000 - 2000) + 2000; // Random duration between 2 and 10 seconds
        setTimeout(() => {
            loadingContainer.style.display = 'none'; // Hide the loading screen
        }, duration);
    }

    // Start the animation and hide the screen after a random time
    animateEllipsis();
    hideLoadingScreen();
};
