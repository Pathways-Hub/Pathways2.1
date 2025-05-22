function updateLastEdited() {
    const lastEditedDisplay = document.getElementById('lastEdited');
    if (!lastEditedDisplay) return;

    const now = new Date();
    const formatted = now.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    lastEditedDisplay.textContent = `Last edited: ${formatted}`;
}

// Event listeners for input
document.addEventListener('keydown', updateLastEdited);
document.addEventListener('mousedown', updateLastEdited);
document.addEventListener('touchstart', updateLastEdited);

// Update on tool interactions
const toolIDs = [
    'pencilButton', 'eraserButton', 'lineToolButton',
    'squareToolButton', 'paintBucketButton', 'binButton',
    'stickynote', 'photoImportButton', 'photoButton'
];

toolIDs.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', updateLastEdited);
    }
});