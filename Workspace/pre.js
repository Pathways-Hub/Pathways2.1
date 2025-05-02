// Create the tooltip square element
const square = document.createElement('div');
square.style.position = 'absolute';
square.style.padding = '10px';
square.style.backgroundColor = 'black';
square.style.color = 'white';
square.style.fontSize = '14px';
square.style.borderRadius = '10px';
square.style.pointerEvents = 'none';
square.style.whiteSpace = 'nowrap';
square.style.display = 'none';
square.style.zIndex = '100';
square.style.textAlign = 'left';
square.style.width = '200px';
square.style.maxWidth = '200px';
square.style.paddingLeft = '10px';
document.body.appendChild(square);

// Mapping of button IDs to tooltips (image and description)
const buttonDescriptions = {
    'icon': { image: 'workspace/tools/0icon.png', description: 'Change Icon' },
    'paintBucketButton': { image: 'workspace/tools/1colour.png', description: 'Colour Tool' },
    'binButton': { image: 'workspace/tools/2delete.png', description: 'Delete' },
    'lineToolButton': { image: 'workspace/tools/3line.png', description: 'Line Tool' },
    'squareToolButton': { image: 'workspace/tools/4square.png', description: 'Square Tool' },
    'photoImportButton': { image: 'workspace/tools/5web.png', description: 'Web Photo Import' },
    'photoButton': { image: 'workspace/tools/6image.png', description: 'Photo Import' },
    'pencilButton': { image: 'workspace/tools/7pen.png', description: 'Pencil Tool' },
    'eraserButton': { image: 'workspace/tools/8rubber.png', description: 'Rubber Tool' },
    'musicButton': { image: 'workspace/tools/9audio.png', description: 'Music Import' },
    'cameraButton': { image: 'workspace/tools/10video.png', description: 'Web Video Import' },
    'tableButton': { image: 'workspace/tools/11table.png', description: 'Table' },
    'stickynote': { image: 'workspace/tools/12stick.png', description: 'Sticky Notes' },
    'progress': { image: 'workspace/tools/13pro.png', description: 'Progress' },
    'pallets': { image: 'workspace/tools/14pal.png', description: 'Pallets' },
};

// Function to track mouse movement and update square position
document.addEventListener('mousemove', (event) => {
    square.style.left = `${event.pageX - square.offsetWidth / 2}px`;
    square.style.top = `${event.pageY + 30}px`;
});

// Add hover effect to each icon button
const iconButtons = document.querySelectorAll('.icon-button');

iconButtons.forEach(button => {
    const buttonId = button.id;
    
    if (buttonDescriptions[buttonId]) {
        const { image, description } = buttonDescriptions[buttonId];

        // Set up hover effect for each icon button
        button.addEventListener('mouseenter', (e) => {
            square.innerHTML = ''; 

            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.alt = description;  // Adds alternative text for the image
            imgElement.style.width = '100%';
            imgElement.style.borderRadius = '5px 5px 0 0';

            const descriptionElement = document.createElement('span');
            descriptionElement.textContent = description;
            descriptionElement.style.marginTop = '5px';
            descriptionElement.style.display = 'block';

            square.appendChild(imgElement);
            square.appendChild(descriptionElement);

            square.style.display = 'block';
        });

        button.addEventListener('mouseleave', () => {
            square.style.display = 'none';
        });
    }
});
