// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get the button element
    const button = document.getElementById('paintBucketButton');

    // Toggle state to track whether the grid is visible
    let isGridVisible = false;

    // Add click event listener to the button
    button.addEventListener('click', (event) => {
        // Check if the grid already exists
        const existingGrid = document.getElementById('colorGrid');

        if (isGridVisible) {
            // If grid is visible, remove it (close the menu)
            if (existingGrid) {
                existingGrid.remove();
            }
            isGridVisible = false; // Update toggle state
        } else {
            // If grid is not visible, create and show it (open the menu)
            // Create a container for the grid
            const gridContainer = document.createElement('div');
            gridContainer.id = 'colorGrid';

            // Apply styles to the grid container
            Object.assign(gridContainer.style, {
                width: '200px', // Smaller grid size
                height: '300px', // Adjusted height for 4x6 grid
                backgroundColor: 'offwhite',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
                gridTemplateRows: 'repeat(6, 1fr)', // 6 rows
                gap: '1px', // Smaller gaps between cells
                position: 'absolute', // Allow positioning anywhere
                left: `${event.pageX}px`, // Position relative to mouse click
                top: `${event.pageY + 40}px`, // Position below the mouse click
                transform: 'translate(-50%, 0)', // Center horizontally under the mouse
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', // Subtle shadow
                borderRadius: '6px', // Rounded corners for the container
                zIndex: 1000, // Ensure it appears above other elements
            });

            // Predefined colors for the grid
            const colors = [
                // Red shades
                '#FFCCCC', '#FF6666', '#FF3333', '#CC0000',
                // Custom Color 1 shades (orange)
                '#FFE5CC', '#FFCC99', '#FF9966', '#FF6600',
                // Green shades
                '#CCFFCC', '#66FF66', '#33CC33', '#009900',
                // Custom Color 2 shades (purple)
                '#E5CCFF', '#CC99FF', '#9966FF', '#6600CC',
                // Blue shades
                '#CCCCFF', '#6666FF', '#3333FF', '#0000CC',
                // White to Black
                '#FFFFFF', '#CCCCCC', '#666666', '#000000',
            ];

            // Generate 4x6 grid cells with predefined colors
            colors.forEach(color => {
                const cell = document.createElement('div');
                cell.style.backgroundColor = color;
                cell.style.width = '100%';
                cell.style.height = '100%';
                cell.style.borderRadius = '3px'; // Slightly rounded corners for cells
                cell.style.cursor = 'pointer'; // Pointer cursor for interactivity

                // Add click event to apply the selected color to highlighted text
                cell.addEventListener('click', () => {
                    applyColorToHighlightedText(color);
                    // Close the grid after a color is selected
                    if (gridContainer) {
                        gridContainer.remove();
                        isGridVisible = false;
                    }
                });

                gridContainer.appendChild(cell);
            });

            // Append the grid to the body
            document.body.appendChild(gridContainer);
            isGridVisible = true; // Update toggle state
        }
    });
});

// Function to apply color to highlighted text
function applyColorToHighlightedText(color) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color; // Set the text color
        range.surroundContents(span); // Wrap the highlighted text in the span
    } else {
        alert('Please select some text to change its color!');
    }
}
