// buttonlaws.js

// Add a CSS class to mark selected text
const style = document.createElement('style');
style.innerHTML = `
    .text-selected {
        background-color: yellow; /* Highlight color */
        outline: 2px solid red; /* Border to indicate selection */
        outline-offset: 2px;
    }
    .text-red { color: red; }
    .text-green { color: green; }
    .text-blue { color: blue; }
    .text-pink { color: pink; }
    .text-orange { color: orange; }
    .text-grey { color: grey; }
    .text-aqua { color: aqua; }
    .text-gold { color: gold; }
    .text-black { color: black; }
    .line {
        position: absolute;
        background-color: black;
        height: 2px;
        z-index: 1000;
    }
    .line.selected {
        background-color: grey; /* Color when selected */
    }
    .line-selected {
        outline: 2px solid red; /* Border to indicate selection */
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    let currentlySelected = null;
    let selectedLine = null;
    let colorIndex = 0;  // Initialize colorIndex to 0 for starting with red
    const colors = [
        'text-red',
        'text-green',
        'text-blue',
        'text-pink',
        'text-orange',
        'text-grey',
        'text-aqua',
        'text-gold',
        'text-black'
    ];

    // Function to apply selection class
    function applySelectionClass(node) {
        if (node) {
            node.classList.add('text-selected');
        }
    }

    // Function to remove selection class but keep color
    function removeSelectionClass(node) {
        if (node) {
            node.classList.remove('text-selected');
        }
    }

    // Function to find the nearest user-inputted element
    function getSelectedElement() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        let startContainer = range.startContainer;

        // Ensure the container is an element node
        while (startContainer.nodeType !== Node.ELEMENT_NODE && startContainer.parentNode) {
            startContainer = startContainer.parentNode;
        }

        // Check if the element is user-inputted (e.g., div or span)
        if (startContainer.nodeType === Node.ELEMENT_NODE && 
            (startContainer.tagName === 'DIV' || startContainer.tagName === 'SPAN') && 
            startContainer.isContentEditable) {
            return startContainer;
        }
        return null;
    }

    // Event listener to handle text selection
    document.addEventListener('mouseup', (event) => {
        // Check if the click is outside the paintBucketButton
        if (!event.target.closest('#paintBucketButton')) {
            const selectedElement = getSelectedElement();
            if (selectedElement) {
                if (currentlySelected) {
                    removeSelectionClass(currentlySelected);
                }
                currentlySelected = selectedElement;
                applySelectionClass(currentlySelected);
            } else {
                removeSelectionClass(currentlySelected);
                currentlySelected = null;
            }
        }
    });

    // Event listener for paint bucket button
    document.getElementById('paintBucketButton').addEventListener('click', () => {
        if (currentlySelected) {
            // Remove the current color class
            currentlySelected.classList.remove(colors[colorIndex]);
            // Cycle to the next color
            colorIndex = (colorIndex + 1) % colors.length;
            // Add the new color class
            currentlySelected.classList.add(colors[colorIndex]);
        }
    });

    // Event listener for bin button to delete text or line
    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove();
            currentlySelected = null;
        } else if (selectedLine) {
            selectedLine.remove();
            selectedLine = null;
        }
    });

    // Event listener for line selection
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('line')) {
            // Deselect any previously selected line
            if (selectedLine) {
                selectedLine.classList.remove('line-selected');
            }

            // Select the clicked line
            selectedLine = event.target;
            selectedLine.classList.add('line-selected');
        } else {
            // If clicking outside a line, deselect the current line
            if (selectedLine) {
                selectedLine.classList.remove('line-selected');
                selectedLine = null;
            }
        }
    });
});
