// musicimport.js

document.addEventListener('DOMContentLoaded', () => {
    const musicButton = document.getElementById('musicButton');
    let currentlySelected = null;

    // Create a hidden file input element for selecting audio files
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*'; // Accept only audio files
    fileInput.style.display = 'none'; // Hide the input element
    document.body.appendChild(fileInput);

    musicButton.addEventListener('click', () => {
        // Trigger the file input dialog when the music button is clicked
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);

            // Create an audio element
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = fileURL;

            // Create a container for the audio element
            const audioContainer = document.createElement('div');
            audioContainer.classList.add('audio-container');
            audioContainer.appendChild(audioElement);

            // Style and position the audio container
            audioContainer.draggable = true;
            audioContainer.style.position = 'absolute';
            audioContainer.style.top = '50px';
            audioContainer.style.left = '50px';
            audioContainer.style.border = '2px solid transparent'; // Default border
            audioContainer.style.padding = '5px';
            audioContainer.style.cursor = 'move';

            // Append the audio container to the body
            document.body.appendChild(audioContainer);

            // Ensure each audio container has a unique ID
            audioContainer.id = 'audio-' + document.querySelectorAll('.audio-container').length;

            // Event listeners for drag and drop
            audioContainer.addEventListener('dragstart', (event) => {
                const style = window.getComputedStyle(event.target, null);
                const offset = {
                    x: event.clientX - parseInt(style.getPropertyValue('left'), 10),
                    y: event.clientY - parseInt(style.getPropertyValue('top'), 10),
                };
                event.dataTransfer.setData('text/plain', JSON.stringify(offset));
                event.dataTransfer.setData('application/id', audioContainer.id);

                // Select the audio container when dragging starts
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected-audio');
                    currentlySelected.style.border = '2px solid transparent'; // Remove border from previous selection
                }
                currentlySelected = audioContainer;
                audioContainer.classList.add('selected-audio');
                audioContainer.style.border = '2px solid red'; // Add red border to selected audio container
            });

            document.body.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            document.body.addEventListener('drop', (event) => {
                const id = event.dataTransfer.getData('application/id');
                const offset = JSON.parse(event.dataTransfer.getData('text/plain'));
                const audioContainer = document.getElementById(id);

                audioContainer.style.left = (event.clientX - offset.x) + 'px';
                audioContainer.style.top = (event.clientY - offset.y) + 'px';
                event.preventDefault();
            });

            // Select audio element on click
            audioContainer.addEventListener('click', () => {
                if (currentlySelected && currentlySelected !== audioContainer) {
                    currentlySelected.classList.remove('selected-audio');
                    currentlySelected.style.border = '2px solid transparent'; // Remove border from previous selection
                }
                currentlySelected = audioContainer;
                audioContainer.classList.add('selected-audio');
                audioContainer.style.border = '2px solid red'; // Add red border to selected audio container
            });
        }
    });

    // Deselect when clicking outside
    document.addEventListener('click', (event) => {
        if (currentlySelected && !currentlySelected.contains(event.target)) {
            currentlySelected.style.border = '2px solid transparent';
            currentlySelected = null;
        }
    });

    // Delete the selected audio container when the delete button is clicked
    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove();
            currentlySelected = null;
        }
    });
});
