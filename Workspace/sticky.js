document.addEventListener('DOMContentLoaded', () => {
    const stickyButton = document.getElementById('stickynote');
    const deleteButton = document.getElementById('binButton'); // Assuming this is the delete button
    const paintBucketButton = document.getElementById('paintBucketButton'); // Color button
    let isStickyNoteActive = false;
    let currentlySelectedStickyNote = null; // Track the currently selected sticky note
    let currentColorIndex = 0; // To cycle through colors

    // Array of colors for the sticky notes, with soft yellow as the most common
    const colors = [
        '#FFC0CB', // Soft Pink
        '#ADD8E6', // Soft Blue
        '#90EE90', // Soft Green
        '#F5F5F5', // Off White
        '#FFFF99', // Harsher Soft Yellow
    ];

    // Function to create a sticky note (returns the created note element)
    function createStickyNote() {
        const stickyNote = document.createElement('div');
        stickyNote.classList.add('sticky-note');

        // Assign a random color from the colors array
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        stickyNote.style.backgroundColor = randomColor;

        // Create an editable text element for the title
        const stickyTitle = document.createElement('div');
        stickyTitle.contentEditable = true; // Make the text editable
        stickyTitle.classList.add('sticky-title');
        stickyTitle.innerText = 'Sticky Note'; // Default text

        // Prevent text selection and highlight when editing
        stickyTitle.addEventListener('focus', (e) => {
            e.target.style.outline = 'none'; // Remove any outline
        });
        stickyTitle.addEventListener('blur', (e) => {
            e.target.style.outline = 'none'; // Remove outline when focus is lost
            saveStickyNotes();
        });

        // Create an editable text element for the smaller text
        const stickyContent = document.createElement('div');
        stickyContent.contentEditable = true; // Make the text editable
        stickyContent.classList.add('sticky-content');
        stickyContent.innerText = 'Example text'; // Default text

        stickyContent.addEventListener('focus', (e) => {
            e.target.style.outline = 'none'; // Remove any outline
        });
        stickyContent.addEventListener('blur', (e) => {
            e.target.style.outline = 'none'; // Remove outline when focus is lost
            saveStickyNotes();
        });

        // Append the title and content to the sticky note
        stickyNote.appendChild(stickyTitle);
        stickyNote.appendChild(stickyContent);

        // Add the sticky note to the document
        document.body.appendChild(stickyNote);

        // Position the sticky note in the center of the screen
        const rect = stickyNote.getBoundingClientRect();
        stickyNote.style.left = `calc(50% - ${rect.width / 2}px)`;
        stickyNote.style.top = `calc(50% - ${rect.height / 2}px)`;

        // Set the sticky note as active to block text creation
        isStickyNoteActive = true;

        // Make the sticky note draggable
        makeDraggable(stickyNote);

        // Listen for clicks on the sticky note to keep it active
        stickyNote.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents event bubbling
            selectStickyNote(stickyNote); // Select the sticky note when clicking anywhere on it
        });

        // Observe changes to resize the sticky note
        const observerContent = new MutationObserver(() => {
            stickyNote.style.height = 'auto'; // Reset height to auto
            stickyNote.style.height = `${stickyNote.scrollHeight}px`; // Set height based on content
        });
        const observerTitle = new MutationObserver(() => {
            stickyNote.style.height = 'auto'; // Reset height to auto
            stickyNote.style.height = `${stickyNote.scrollHeight}px`; // Set height based on content
        });

        observerContent.observe(stickyContent, {
            childList: true,
            subtree: true,
            characterData: true
        });
        observerTitle.observe(stickyTitle, {
            childList: true,
            subtree: true,
            characterData: true
        });

        saveStickyNotes(); // Save after creation
        return stickyNote;
    }

    // Create sticky note from saved data
    function createStickyNoteFromData(data) {
        const note = createStickyNote();
        note.style.left = data.left;
        note.style.top = data.top;
        note.style.backgroundColor = data.color;
        note.querySelector('.sticky-title').innerText = data.title;
        note.querySelector('.sticky-content').innerText = data.content;
        return note;
    }

    // Make sticky note draggable
    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - parseFloat(window.getComputedStyle(element).left);
            offsetY = e.clientY - parseFloat(window.getComputedStyle(element).top);
            element.style.zIndex = 1000; // Ensure it's on top while dragging
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
                saveStickyNotes();
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = ''; // Reset z-index
                saveStickyNotes();
            }
        });
    }

    // Select sticky note
    function selectStickyNote(note) {
        if (currentlySelectedStickyNote) {
            currentlySelectedStickyNote.classList.remove('sticky-note-selected');
        }
        currentlySelectedStickyNote = note;
        currentlySelectedStickyNote.classList.add('sticky-note-selected');
    }

    // Unselect sticky note
    function unselectStickyNote() {
        if (currentlySelectedStickyNote) {
            currentlySelectedStickyNote.classList.remove('sticky-note-selected');
            currentlySelectedStickyNote = null;
        }
    }

    // Disable text box creation when clicking outside sticky notes
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sticky-note')) {
            isStickyNoteActive = false;
            unselectStickyNote();
        }
    });

    // Sticky note button creates new note
    stickyButton.addEventListener('click', () => {
        createStickyNote();
    });

    // Delete selected sticky note
    deleteButton.addEventListener('click', () => {
        if (currentlySelectedStickyNote) {
            currentlySelectedStickyNote.remove();
            currentlySelectedStickyNote = null;
            saveStickyNotes();
        }
    });

    // Change color of selected sticky note
    paintBucketButton.addEventListener('click', () => {
        if (currentlySelectedStickyNote) {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            currentlySelectedStickyNote.style.backgroundColor = colors[currentColorIndex];
            saveStickyNotes();
        }
    });

    // Prevent text creation if sticky note active
    document.addEventListener('dblclick', (e) => {
        if (isStickyNoteActive) {
            e.stopPropagation();
        }
    });

    // Save sticky notes to localStorage
    function saveStickyNotes() {
        const notes = Array.from(document.querySelectorAll('.sticky-note'));
        const savedData = notes.map(note => ({
            left: note.style.left,
            top: note.style.top,
            color: note.style.backgroundColor,
            title: note.querySelector('.sticky-title')?.innerText || '',
            content: note.querySelector('.sticky-content')?.innerText || ''
        }));
        localStorage.setItem('stickyNotes', JSON.stringify(savedData));
    }

    // Load sticky notes from localStorage
    function loadStickyNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('stickyNotes') || '[]');
        savedNotes.forEach(data => {
            createStickyNoteFromData(data);
        });
    }

    // CSS styles for sticky notes
    const style = document.createElement('style');
    style.innerHTML = `
        .sticky-note {
            position: absolute;
            border-radius: 8px;
            padding: 10px;
            box-shadow: none;
            z-index: 1000;
            cursor: move;
            overflow: hidden;
            min-width: 150px;
            max-width: 300px;
            user-select: text;
        }
        .sticky-note-selected {
            border: 2px solid red;
        }
        .sticky-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 6px;
            padding: 2px;
        }
        .sticky-content {
            font-size: 12px;
            color: #333;
            white-space: pre-wrap;
        }
    `;
    document.head.appendChild(style);

    // Load sticky notes on startup
    loadStickyNotes();
});
