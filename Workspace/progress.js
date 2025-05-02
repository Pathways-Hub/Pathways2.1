// progress.js

document.addEventListener('DOMContentLoaded', () => {
    const progressButton = document.getElementById('progress');
    const deleteButton = document.getElementById('binButton');
    let isProgressNoteActive = false;
    let currentlySelectedProgressNote = null;

    const stages = [
        {
            text: 'Not Started',
            color: '#ff5353', // red
            icon: '<i class="fa-regular fa-circle"></i>'
        },
        {
            text: 'In Progress',
            color: '#ADD8E6', // Lighter Blue
            icon: '<i class="fa-solid fa-circle-half-stroke"></i>'
        },
        {
            text: 'Done',
            color: '#63ff53', // green
            icon: '<i class="fa-solid fa-circle"></i>'
        }
    ];

    function createProgressNote() {
        const progressNote = document.createElement('div');
        progressNote.classList.add('progress-note');
        let currentStage = 0;

        progressNote.style.backgroundColor = stages[currentStage].color;

        const statusText = document.createElement('div');
        statusText.classList.add('progress-status');
        statusText.innerHTML = stages[currentStage].icon + '<span class="status-text">' + stages[currentStage].text + '</span>';

        const progressTitle = document.createElement('div');
        progressTitle.contentEditable = true; 
        progressTitle.classList.add('progress-title');
        progressTitle.innerText = ' Title';

        const progressContent = document.createElement('div');
        progressContent.contentEditable = true;
        progressContent.classList.add('progress-content');
        progressContent.innerText = 'Description'; 

        const closeButton = document.createElement('div');
        closeButton.classList.add('progress-close');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            progressNote.remove();
            currentlySelectedProgressNote = null;
        });

        progressNote.appendChild(closeButton);
        progressNote.appendChild(statusText);
        progressNote.appendChild(progressTitle);
        progressNote.appendChild(progressContent);

        document.body.appendChild(progressNote);

        const rect = progressNote.getBoundingClientRect();
        progressNote.style.left = `calc(50% - ${rect.width / 2}px)`;
        progressNote.style.top = `calc(50% - ${rect.height / 2}px)`;

        isProgressNoteActive = true;

        makeDraggable(progressNote);

        // Handle clicks specifically on the rectangle
        progressNote.addEventListener('click', (e) => {
            // Ensure clicks only change state if they are on the rectangle itself
            if (e.target === progressNote || e.target === statusText || e.target === closeButton) {
                e.stopPropagation(); 
                selectProgressNote(progressNote);

                // Change state based on current stage
                currentStage = (currentStage + 1) % stages.length;
                progressNote.style.backgroundColor = stages[currentStage].color;
                statusText.innerHTML = stages[currentStage].icon + '<span class="status-text">' + stages[currentStage].text + '</span>';
            }
        });

        // Prevent clicks inside editable elements from creating new text areas
        progressTitle.addEventListener('click', (e) => e.stopPropagation());
        progressContent.addEventListener('click', (e) => e.stopPropagation());

        progressNote.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });
    }

    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - parseFloat(window.getComputedStyle(element).left);
            offsetY = e.clientY - parseFloat(window.getComputedStyle(element).top);
            element.style.zIndex = 1000; 
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = ''; 
            }
        });
    }

    function selectProgressNote(note) {
        if (currentlySelectedProgressNote) {
            currentlySelectedProgressNote.classList.remove('progress-note-selected');
        }
        currentlySelectedProgressNote = note;
        currentlySelectedProgressNote.classList.add('progress-note-selected');
    }

    function unselectProgressNote() {
        if (currentlySelectedProgressNote) {
            currentlySelectedProgressNote.classList.remove('progress-note-selected');
            currentlySelectedProgressNote = null;
        }
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.progress-note')) {
            isProgressNoteActive = false;
            unselectProgressNote(); 
        }
    });

    progressButton.addEventListener('click', createProgressNote);

    deleteButton.addEventListener('click', () => {
        if (currentlySelectedProgressNote) {
            currentlySelectedProgressNote.remove();
            currentlySelectedProgressNote = null;
        }
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .progress-note {
            position: absolute;
            border-radius: 8px;
            padding: 20px;
            box-shadow: none;
            z-index: 1000;
            cursor: move;
            overflow: hidden;
            width: 250px;
            height: auto;
        }
        .progress-note-selected {
            border: 2px solid red;
        }
        .progress-status {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            padding: 2px;
            display: flex;
            align-items: center;
        }
        .status-text {
            margin-left: 12px; /* Adds space between the icon and text */
        }
        .progress-title {
            font-size: 12px; /* Smaller size */
            font-weight: bold;
            margin-bottom: 8px;
            padding: 2px;
        }
        .progress-content {
            font-size: 14px;
            color: #333;
        }
        .progress-close {
            position: absolute;
            top: 5px;
            right: 10px;
            font-size: 18px;
            cursor: pointer;
            color: #000;
        }
    `;
    document.head.appendChild(style);
});
