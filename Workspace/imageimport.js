// imageimport.js

document.addEventListener('DOMContentLoaded', () => {
    let currentlySelected = null; // Track the currently selected image

    // Event listener for photo import button
    document.getElementById('photoImportButton').addEventListener('click', () => {
        // Prompt the user to enter an image URL
        const imageUrl = prompt('Please enter an image URL:');

        if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;

            // Set image styling and positioning
            img.style.position = 'absolute';
            img.style.left = '50px'; // Example positioning, adjust as needed
            img.style.top = '100px'; // Example positioning, adjust as needed
            img.style.maxWidth = '200px'; // Example max size, adjust as needed
            img.style.zIndex = '1001'; // Ensure it's above other content
            img.style.cursor = 'move'; // Change cursor to indicate draggable

            // Check if the image loads successfully
            img.onload = () => {
                document.body.appendChild(img);
                makeImageDraggable(img); // Make the image draggable
                makeImageSelectable(img); // Make the image selectable
            };

            // Handle image loading error
            img.onerror = () => {
                alert('Failed to load the image. Please check the URL and try again.');
            };
        }
    });

    // Function to make an image draggable
    function makeImageDraggable(image) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        image.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt(image.style.left, 10);
            initialY = parseInt(image.style.top, 10);
            image.style.zIndex = '1002'; // Bring the image to the front while dragging

            // Select the image when dragging starts
            if (currentlySelected !== image) {
                deselectCurrentlySelected();
                currentlySelected = image;
                image.classList.add('selected');
                disableTextEditing(true); // Disable text editing
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                image.style.left = `${initialX + deltaX}px`;
                image.style.top = `${initialY + deltaY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                image.style.zIndex = '1001'; // Reset zIndex after dragging
            }
        });
    }

    // Function to make an image selectable
    function makeImageSelectable(image) {
        // Select the image on click
        image.addEventListener('click', (event) => {
            // Prevent deselection on click
            event.stopPropagation();
            if (currentlySelected !== image) {
                deselectCurrentlySelected();
                currentlySelected = image;
                image.classList.add('selected');
                disableTextEditing(true); // Disable text editing
            }
        });
    }

    // Function to deselect the currently selected item
    function deselectCurrentlySelected() {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
            currentlySelected = null;
            disableTextEditing(false); // Re-enable text editing
        }
    }

    // Function to enable or disable text editing
    function disableTextEditing(disable) {
        const editableElements = document.querySelectorAll('[contenteditable]');
        editableElements.forEach(el => {
            el.contentEditable = !disable; // Enable or disable contentEditable
        });
        document.querySelectorAll('.text-preview, .input-area').forEach(el => {
            el.style.pointerEvents = disable ? 'none' : 'auto'; // Enable or disable pointer events
        });
    }

    // Deselect image when clicking outside of it
    document.addEventListener('click', (event) => {
        if (currentlySelected && !currentlySelected.contains(event.target)) {
            deselectCurrentlySelected();
        }
    });

    // Deselect image when a new text area is created
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (target.isContentEditable) {
            deselectCurrentlySelected();
        }
    });

    // Event listener for delete button in the header
    document.getElementById('binButton').addEventListener('click', () => {
        // Find the selected image
        const selectedImage = document.querySelector('.selected');
        if (selectedImage) {
            selectedImage.remove(); // Remove the image from the DOM
        }
    });
});
