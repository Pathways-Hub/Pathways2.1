window.onload = function() {
    // Create a container for the loading screen
    let loadingContainer = document.createElement('div');
    loadingContainer.id = 'loadingContainer';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '100%';
    loadingContainer.style.backgroundColor = 'white';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.zIndex = '9999';

    // Create the loading image element
    let loadingImage = document.createElement('img');
    loadingImage.id = 'loadingImage';
    loadingImage.src = 'images/loading_anim_test.gif'; // Path to your loading image
    loadingImage.style.maxWidth = '300px'; // Increased size

    // Apply fade effect on left and right sides of the image
    loadingImage.style.webkitMaskImage = 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)';
    loadingImage.style.maskImage = 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)';
    loadingImage.style.webkitMaskSize = '100% 100%';
    loadingImage.style.maskSize = '100% 100%';
    loadingImage.style.webkitMaskRepeat = 'no-repeat';
    loadingImage.style.maskRepeat = 'no-repeat';

    // Append the image to the container
    loadingContainer.appendChild(loadingImage);

    // Append the loading container to the body
    document.body.appendChild(loadingContainer);

    // Function to hide the loading screen after a random time between 2 and 10 seconds
    function hideLoadingScreen() {
        const duration = Math.random() * (10000 - 2000) + 2000;
        setTimeout(() => {
            loadingContainer.style.display = 'none';
        }, duration);
    }

    // Hide the screen after a random time
    hideLoadingScreen();
};
