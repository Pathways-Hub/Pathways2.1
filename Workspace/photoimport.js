const photoButton = document.getElementById('photoButton');
const photoImportButton = document.getElementById('photoImportButton');

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';

document.body.appendChild(fileInput);

// Handle File Import (Local Image Upload)
photoButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            createImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Handle Web Image Import (URL Input)
photoImportButton.addEventListener('click', () => {
    const url = prompt('Enter the URL of the image:');
    if (url) {
        createImage(url);
    }
});

// Function to create and handle an image
function createImage(imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.position = 'fixed';
    img.style.top = '50%';
    img.style.left = '50%';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.borderRadius = '20px';
    img.style.cursor = 'grab';
    img.style.zIndex = '1000';

    // Store initial width and height to preserve aspect ratio
    let originalWidth = img.width;
    let originalHeight = img.height;

    const createCircle = (position) => {
        const circle = document.createElement('div');
        circle.style.width = '10px';
        circle.style.height = '10px';
        circle.style.backgroundColor = 'blue';
        circle.style.borderRadius = '50%';
        circle.style.position = 'absolute';
        circle.style.zIndex = '1001';
        circle.style.display = 'none'; // Hidden by default
        circle.dataset.position = position; // Store position info
        return circle;
    };

    const corners = {
        topLeft: createCircle('topLeft'),
        topRight: createCircle('topRight'),
        bottomLeft: createCircle('bottomLeft'),
        bottomRight: createCircle('bottomRight'),
    };

    Object.values(corners).forEach((circle) => {
        document.body.appendChild(circle);
    });

    const updateCornerPositions = () => {
        const rect = img.getBoundingClientRect();
        corners.topLeft.style.left = `${rect.left - 5}px`;
        corners.topLeft.style.top = `${rect.top - 5}px`;
        corners.topRight.style.left = `${rect.right - 5}px`;
        corners.topRight.style.top = `${rect.top - 5}px`;
        corners.bottomLeft.style.left = `${rect.left - 5}px`;
        corners.bottomLeft.style.top = `${rect.bottom - 5}px`;
        corners.bottomRight.style.left = `${rect.right - 5}px`;
        corners.bottomRight.style.top = `${rect.bottom - 5}px`;
    };

    const isMouseNear = (x, y) => {
        const rect = img.getBoundingClientRect();
        const margin = 20; // Range within which circles will show up
        return (
            x >= rect.left - margin &&
            x <= rect.right + margin &&
            y >= rect.top - margin &&
            y <= rect.bottom + margin
        );
    };

    // Show/hide corners based on mouse proximity
    document.addEventListener('mousemove', (event) => {
        if (isMouseNear(event.clientX, event.clientY)) {
            Object.values(corners).forEach((circle) => (circle.style.display = 'block'));
        } else {
            Object.values(corners).forEach((circle) => (circle.style.display = 'none'));
        }
    });

    // Dragging functionality for the image
    let isDragging = false;
    let offsetX, offsetY;

    img.addEventListener('mousedown', (event) => {
        // Disable interaction with the background and other elements
        document.body.style.pointerEvents = 'none';

        isDragging = true;
        img.style.cursor = 'grabbing';
        const rect = img.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        event.preventDefault();
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            img.style.left = `${event.clientX - offsetX}px`;
            img.style.top = `${event.clientY - offsetY}px`;
            img.style.transform = 'translate(0, 0)';
            updateCornerPositions();
        }
    });

    document.addEventListener('mouseup', () => {
        // Re-enable interaction with the background after dragging
        document.body.style.pointerEvents = 'auto';

        isDragging = false;
        img.style.cursor = 'grab';
    });

    // Resize functionality
    let resizing = false;
    let resizeCorner = null;
    let startX, startY, startWidth, startHeight;

    const startResize = (event, corner) => {
        resizing = true;
        resizeCorner = corner;
        startX = event.clientX;
        startY = event.clientY;
        const rect = img.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        originalWidth = startWidth; // Store original width for aspect ratio
        originalHeight = startHeight; // Store original height for aspect ratio
        event.preventDefault();
    };

    const resizeImage = (event) => {
        if (!resizing) return;

        let dx = event.clientX - startX;
        let dy = event.clientY - startY;

        if (resizeCorner === 'topLeft' || resizeCorner === 'bottomLeft') dx = -dx;
        if (resizeCorner === 'topLeft' || resizeCorner === 'topRight') dy = -dy;

        // Maintain aspect ratio if Shift key is held
        if (event.shiftKey) {
            const aspectRatio = originalWidth / originalHeight;
            if (resizeCorner === 'topLeft' || resizeCorner === 'bottomLeft') {
                dy = dx / aspectRatio;
            } else if (resizeCorner === 'topRight' || resizeCorner === 'bottomRight') {
                dy = dx / aspectRatio;
            }
        }

        const newWidth = Math.max(50, startWidth + dx);
        const newHeight = Math.max(50, startHeight + dy);

        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;

        updateCornerPositions();
    };

    const stopResize = () => {
        resizing = false;
        resizeCorner = null;
    };

    Object.entries(corners).forEach(([position, circle]) => {
        circle.addEventListener('mousedown', (event) => startResize(event, position));
    });

    document.addEventListener('mousemove', resizeImage);
    document.addEventListener('mouseup', stopResize);

    img.addEventListener('load', updateCornerPositions);
    window.addEventListener('resize', updateCornerPositions);

    document.body.appendChild(img);

    img.addEventListener('click', () => {
        document.body.removeChild(img);
        Object.values(corners).forEach((circle) => document.body.removeChild(circle));
        document.removeEventListener('mousemove', resizeImage);
        document.removeEventListener('mouseup', stopResize);
    });
}