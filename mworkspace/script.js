// Select the editable elements
const note = document.getElementById('note');
const title = document.getElementById('title');

// Load saved content from localStorage (if any)
window.addEventListener('DOMContentLoaded', () => {
    const savedTitle = localStorage.getItem('noteTitle');
    const savedNote = localStorage.getItem('noteContent');
    
    if (savedTitle) {
        title.textContent = savedTitle;
    }
    if (savedNote) {
        note.innerHTML = savedNote;
    }
});

// Save the title and note content to localStorage whenever they change
title.addEventListener('input', () => {
    localStorage.setItem('noteTitle', title.textContent);
});

note.addEventListener('input', () => {
    localStorage.setItem('noteContent', note.innerHTML);
});

// Utility to toggle formatting for selected text
function toggleFormat(command) {
    document.execCommand(command, false, null);
}

// Attach event listeners to taskbar buttons
document.getElementById('boldButton').addEventListener('click', () => toggleFormat('bold'));
document.getElementById('italicButton').addEventListener('click', () => toggleFormat('italic'));

// Bullet point list toggle
document.getElementById('bulletButton').addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null); // Adds bullet points
});

// Numbered list toggle
document.getElementById('numberedButton').addEventListener('click', () => {
    document.execCommand('insertOrderedList', false, null); // Adds numbered list
});
