// shortcut.js

// This file is titled: shortcut.js

// Create an undo stack
const undoStack = [];

// Add an event listener for keydown events to detect Ctrl+Z
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault(); // Prevent the default browser undo behavior
        undoLastAction();
    }
});

// Function to perform an action and add it to the undo stack
function performAction(action) {
    undoStack.push(action);

    // Perform the action (this will depend on your specific use case)
    action.redo();
}

// Function to undo the last action
function undoLastAction() {
    const lastAction = undoStack.pop();
    if (lastAction) {
        lastAction.undo();
    }
}

// Example action object for creating an element (image, text, sound player)
function createElementAction(element) {
    return {
        undo: () => element.remove(),
        redo: () => document.body.appendChild(element)
    };
}

// Example function to create an image
function createImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('image-element'); // Add appropriate class

    // Add the action to the undo stack
    performAction(createElementAction(img));

    // Append the image to the document
    document.body.appendChild(img);
}

// Example function to create a text element
function createText(text) {
    const textElement = document.createElement('div');
    textElement.classList.add('text-element'); // Add appropriate class
    textElement.contentEditable = true;
    textElement.innerText = text;

    // Add the action to the undo stack
    performAction(createElementAction(textElement));

    // Append the text element to the document
    document.body.appendChild(textElement);
}

// Example function to create a sound player
function createSoundPlayer(src) {
    const audio = document.createElement('audio');
    audio.src = src;
    audio.controls = true;
    audio.classList.add('sound-player-element'); // Add appropriate class

    // Add the action to the undo stack
    performAction(createElementAction(audio));

    // Append the sound player to the document
    document.body.appendChild(audio);
}

// Example action for deleting an element
function deleteElementAction(element) {
    const parent = element.parentNode;
    const nextSibling = element.nextSibling;

    return {
        undo: () => parent.insertBefore(element, nextSibling),
        redo: () => element.remove()
    };
}

// Example function to delete an element
function deleteElement(element) {
    // Add the delete action to the undo stack
    performAction(deleteElementAction(element));

    // Remove the element from the document
    element.remove();
}

// Example action for moving an element
function moveElementAction(element, originalPosition, newPosition) {
    return {
        undo: () => {
            element.style.left = originalPosition.left;
            element.style.top = originalPosition.top;
        },
        redo: () => {
            element.style.left = newPosition.left;
            element.style.top = newPosition.top;
        }
    };
}

// Example function to move an element (e.g., when dragging)
function moveElement(element, newPosition) {
    const originalPosition = {
        left: element.style.left,
        top: element.style.top
    };

    // Add the move action to the undo stack
    performAction(moveElementAction(element, originalPosition, newPosition));

    // Update the element's position
    element.style.left = newPosition.left;
    element.style.top = newPosition.top;
}
