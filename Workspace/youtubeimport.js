document.addEventListener('DOMContentLoaded', () => {
    const cameraButton = document.getElementById('cameraButton');
    let currentlySelected = null;
    let isDragging = false;

    // Function to remove the existing video and its controls
    function removeExistingVideo() {
        const existingIframe = document.querySelector('iframe.video-container');
        if (existingIframe) {
            existingIframe.remove();
            // Remove associated control buttons
            document.querySelectorAll('.control-button').forEach(btn => btn.remove());
            document.querySelectorAll('.zoom-in-button').forEach(btn => btn.remove());
            document.querySelectorAll('.zoom-out-button').forEach(btn => btn.remove());
        }
    }

    // Event listener for the camera button
    cameraButton.addEventListener('click', () => {
        // Check if there is already a video
        if (document.querySelector('iframe.video-container')) {
            alert('You may only have one video at a time.');
            return;
        }

        // Prompt the user to enter a YouTube video URL
        const videoUrl = prompt('Please enter the URL of the YouTube video:');

        if (videoUrl) {
            // Extract the video ID from the URL
            const videoId = extractVideoId(videoUrl);

            if (videoId) {
                // Remove any existing video and controls
                removeExistingVideo();

                // Create an iframe element to embed the YouTube video
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.width = '560'; // Example width, adjust as needed
                iframe.height = '315'; // Example height, adjust as needed
                iframe.style.position = 'absolute';
                iframe.style.top = '50px'; // Example positioning, adjust as needed
                iframe.style.left = '50px'; // Example positioning, adjust as needed
                iframe.style.zIndex = '1001'; // Ensure it's above other content
                iframe.style.border = 'none'; // Remove border
                iframe.classList.add('video-container'); // Add a class for styling if needed

                // Append the iframe to the body
                document.body.appendChild(iframe);

                // Create and attach control buttons for the iframe
                createControlButtons(iframe);
            } else {
                alert('Invalid YouTube URL. Please try again.');
            }
        }
    });

    // Function to extract video ID from a YouTube URL
    function extractVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|v=)?([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Function to create control buttons for an iframe
    function createControlButtons(iframe) {
        // Create and style control buttons
        const controlButton = document.createElement('button');
        controlButton.innerHTML = '<i class="fa-solid fa-up-down-left-right"></i>'; // Move icon
        controlButton.style.position = 'absolute';
        controlButton.style.zIndex = '1002'; // Ensure it is above the iframe
        controlButton.classList.add('icon-button', 'control-button'); // Add a class for styling

        const zoomInButton = document.createElement('button');
        zoomInButton.innerHTML = '<i class="fa-solid fa-plus"></i>'; // Zoom in icon
        zoomInButton.style.position = 'absolute';
        zoomInButton.style.zIndex = '1002'; // Ensure it is above the iframe
        zoomInButton.classList.add('icon-button', 'zoom-in-button'); // Add a class for styling

        const zoomOutButton = document.createElement('button');
        zoomOutButton.innerHTML = '<i class="fa-solid fa-minus"></i>'; // Zoom out icon
        zoomOutButton.style.position = 'absolute';
        zoomOutButton.style.zIndex = '1002'; // Ensure it is above the iframe
        zoomOutButton.classList.add('icon-button', 'zoom-out-button'); // Add a class for styling

        // Append control buttons to the body
        document.body.appendChild(controlButton);
        document.body.appendChild(zoomInButton);
        document.body.appendChild(zoomOutButton);

        // Update control button positions initially
        updateControlButtonPosition(iframe, controlButton, zoomInButton, zoomOutButton);

        // Make the iframe and control buttons draggable and selectable
        makeElementDraggable(iframe, controlButton);
        makeElementSelectable(iframe, controlButton);

        // Event listeners for zoom buttons
        zoomInButton.addEventListener('click', () => zoomIframe(iframe, 1.1)); // Zoom in
        zoomOutButton.addEventListener('click', () => zoomIframe(iframe, 0.9)); // Zoom out

        // Update button positions when the iframe is resized
        new ResizeObserver(() => updateControlButtonPosition(iframe, controlButton, zoomInButton, zoomOutButton)).observe(iframe);
    }

    // Function to make an element draggable (similar to table system)
    function makeElementDraggable(element, controlButton) {
        let startX, startY, offsetX, offsetY;

        const onMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // Mark dragging to distinguish from a click
            controlButton.dataset.dragging = 'true';

            element.style.zIndex = '1003'; // Bring the element to the front while dragging
        };

        const onMouseMove = (e) => {
            if (isDragging) {
                const left = e.clientX - offsetX;
                const top = e.clientY - offsetY;
                element.style.left = `${left}px`;
                element.style.top = `${top}px`;

                // Update control button positions
                updateControlButtonPosition(element, controlButton, document.querySelector('.zoom-in-button'), document.querySelector('.zoom-out-button'));
            }
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '1001'; // Reset zIndex after dragging
                controlButton.dataset.dragging = 'false';
            }
        };

        controlButton.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Function to update the position of the control button and zoom buttons
    function updateControlButtonPosition(element, controlButton, zoomInButton, zoomOutButton) {
        const elementRect = element.getBoundingClientRect();
        controlButton.style.left = `${elementRect.left}px`;
        controlButton.style.top = `${elementRect.bottom + 5}px`; // Position the button below the iframe
        zoomInButton.style.left = `${elementRect.left + 40}px`; // Example offset
        zoomInButton.style.top = `${elementRect.bottom + 5}px`; // Same as control button
        zoomOutButton.style.left = `${elementRect.left + 80}px`; // Example offset
        zoomOutButton.style.top = `${elementRect.bottom + 5}px`; // Same as control button
    }

    // Function to zoom in or out on the iframe
    function zoomIframe(iframe, scale) {
        const currentWidth = parseInt(window.getComputedStyle(iframe).width, 10);
        const currentHeight = parseInt(window.getComputedStyle(iframe).height, 10);
        iframe.style.width = `${currentWidth * scale}px`;
        iframe.style.height = `${currentHeight * scale}px`;

        // Update button positions after zooming
        updateControlButtonPosition(iframe, document.querySelector('.control-button'), document.querySelector('.zoom-in-button'), document.querySelector('.zoom-out-button'));
    }

    // Function to make an element selectable
    function makeElementSelectable(element, controlButton) {
        const select = () => {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
                currentlySelected.style.border = 'none'; // Remove border from previously selected element
            }
            selectElement(element);
        };

        element.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isDragging) {
                select();
            }
        });

        controlButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isDragging) {
                select();
            }
        });
    }

    // Function to select an element and add a red border
    function selectElement(element) {
        currentlySelected = element;
        currentlySelected.classList.add('selected');
        currentlySelected.style.border = '3px solid red'; // Add red border
    }

    // Deselect the currently selected element if clicked outside
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('video-container') && !target.classList.contains('control-button') && !target.classList.contains('zoom-in-button') && !target.classList.contains('zoom-out-button') && !target.classList.contains('selected')) {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
                currentlySelected.style.border = 'none'; // Remove red border
                currentlySelected = null;
            }
        }
    });

    // Event listener for delete button in the header
    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove(); // Remove the element from the DOM
            // Remove associated control buttons
            document.querySelectorAll('.control-button').forEach(btn => btn.remove());
            document.querySelectorAll('.zoom-in-button').forEach(btn => btn.remove());
            document.querySelectorAll('.zoom-out-button').forEach(btn => btn.remove());
            currentlySelected = null;
        }
    });
});
