// Create the tooltip preview element
const square = document.createElement('div');
square.style.position = 'absolute';
square.style.padding = '10px';
square.style.backgroundColor = 'black';
square.style.color = 'white';
square.style.fontSize = '14px';
square.style.borderRadius = '10px';
square.style.whiteSpace = 'normal'; // Allow line wrapping
square.style.display = 'none';
square.style.zIndex = '100';
square.style.textAlign = 'left';
square.style.width = '200px';
square.style.maxWidth = '200px';
square.style.paddingLeft = '10px';
square.style.opacity = '0';
square.style.transition = 'opacity 0.2s ease';
document.body.appendChild(square);

// State tracking
let isHoveringButton = false;
let isHoveringTooltip = false;
let hideTimeout;

// Tooltip content for each button
const buttonDescriptions = {
    'icon': {
        image: 'workspace/tools/0icon.png',
        description: 'Change Icon',
        detail: 'Change the appearance of your workspace icon so it reflects your project theme.'
    },
    'paintBucketButton': {
        image: 'workspace/tools/1colour.png',
        description: 'Colour Tool',
        detail: 'Fill large areas quickly with a single color. Ideal for backgrounds or shapes.'
    },
    'binButton': {
        image: 'workspace/tools/2delete.png',
        description: 'Delete',
        detail: 'Remove unwanted items from your workspace. This action cannot be undone.'
    },
    'lineToolButton': {
        image: 'workspace/tools/3line.png',
        description: 'Line Tool',
        detail: 'Create clean, straight lines between any two points with precision.'
    },
    'squareToolButton': {
        image: 'workspace/tools/4square.png',
        description: 'Square Tool',
        detail: 'Draw perfect squares or rectangles for layout structuring or decoration.'
    },
    'photoImportButton': {
        image: 'workspace/tools/5web.png',
        description: 'Web Photo Import',
        detail: 'Search and import photos from online sources directly into your project.'
    },
    'photoButton': {
        image: 'workspace/tools/6image.png',
        description: 'Photo Import',
        detail: 'Upload images from your local device and place them in the workspace.'
    },
    'pencilButton': {
        image: 'workspace/tools/7pen.png',
        description: 'Pencil Tool',
        detail: 'Draw freely using your mouse like a pen. Great for sketches and notes.'
    },
    'eraserButton': {
        image: 'workspace/tools/8rubber.png',
        description: 'Rubber Tool',
        detail: 'Erase drawn elements or imported media from your canvas with precision.'
    },
    'musicButton': {
        image: 'workspace/tools/9audio.png',
        description: 'Music Import',
        detail: 'Embed background music or sound effects into your interactive workspace.'
    },
    'cameraButton': {
        image: 'workspace/tools/10video.png',
        description: 'Web Video Import',
        detail: 'Insert video from the web to enhance your project with rich media.'
    },
    'tableButton': {
        image: 'workspace/tools/11table.png',
        description: 'Table',
        detail: 'Add and edit data tables to organize text or figures in rows and columns.'
    },
    'stickynote': {
        image: 'workspace/tools/12stick.png',
        description: 'Sticky Notes',
        detail: 'Add virtual notes for reminders, labels, or collaborative ideas.'
    },
    'progress': {
        image: 'workspace/tools/13pro.png',
        description: 'Progress',
        detail: 'Track progress with visual bars or status indicators for tasks.'
    },
    'pallets': {
        image: 'workspace/tools/14pal.png',
        description: 'Pallets',
        detail: 'Manage and switch between multiple color palettes for your artwork.'
    },
};

// Tooltip hover behavior
square.addEventListener('mouseenter', () => {
    isHoveringTooltip = true;
    clearTimeout(hideTimeout);
});
square.addEventListener('mouseleave', () => {
    isHoveringTooltip = false;
    scheduleHideTooltip();
});

// Attach hover logic to each icon button
const iconButtons = document.querySelectorAll('.icon-button');
iconButtons.forEach(button => {
    const buttonId = button.id;
    if (!buttonDescriptions[buttonId]) return;

    const { image, description, detail } = buttonDescriptions[buttonId];

    button.addEventListener('mouseenter', () => {
        isHoveringButton = true;
        clearTimeout(hideTimeout);

        square.innerHTML = '';

        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = description;
        imgElement.style.width = '100%';
        imgElement.style.borderRadius = '5px 5px 0 0';
        square.appendChild(imgElement);

        const titleElement = document.createElement('div');
        titleElement.textContent = description;
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginTop = '5px';
        titleElement.style.fontSize = '14px';
        square.appendChild(titleElement);

        const detailElement = document.createElement('div');
        detailElement.textContent = detail || '';
        detailElement.style.fontWeight = 'normal';
        detailElement.style.marginTop = '2px';
        detailElement.style.fontSize = '14px';
        square.appendChild(detailElement);

        const rect = button.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        square.style.left = `${rect.right + scrollLeft + 30}px`;
        square.style.top = `${rect.top + scrollTop}px`;

        square.style.display = 'block';
        requestAnimationFrame(() => {
            square.style.opacity = '1';
        });
    });

    button.addEventListener('mouseleave', () => {
        isHoveringButton = false;
        scheduleHideTooltip();
    });
});

// Hide helper
function scheduleHideTooltip() {
    hideTimeout = setTimeout(() => {
        if (!isHoveringButton && !isHoveringTooltip) {
            square.style.opacity = '0';
            setTimeout(() => {
                if (!isHoveringButton && !isHoveringTooltip) {
                    square.style.display = 'none';
                }
            }, 200);
        }
    }, 100);
}


let userAttemptingToLeave = false;

window.addEventListener('beforeunload', function (e) {
    if (userAttemptingToLeave) return; // Avoid infinite loop

    // Standard unload warning
    e.preventDefault();
    e.returnValue = '';

    // Show custom modal
    showExitModal();

    return ''; // Required by some browsers
});

window.addEventListener('beforeunload', function (e) {
    // This triggers the browser's native "Leave site?" dialog
    e.preventDefault();
    e.returnValue = ''; // Required for most browsers
});
