document.addEventListener('DOMContentLoaded', () => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let selectionBox = null;

    const createSelectionBox = (x, y) => {
        const box = document.createElement('div');
        box.style.position = 'absolute';
        box.style.border = '2px dashed #007BFF';
        box.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
        box.style.pointerEvents = 'none'; // Prevent interference with mouse events
        box.style.zIndex = '1000';
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        document.body.appendChild(box);
        return box;
    };

    const updateSelectionBox = (box, x1, y1, x2, y2) => {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x1 - x2);
        const height = Math.abs(y1 - y2);

        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
    };

    const removeSelectionBox = (box) => {
        if (box && box.parentNode) {
            box.parentNode.removeChild(box);
        }
    };

    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only respond to the left mouse button
        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        selectionBox = createSelectionBox(startX, startY);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !selectionBox) return;
        updateSelectionBox(selectionBox, startX, startY, e.pageX, e.pageY);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            removeSelectionBox(selectionBox);
            selectionBox = null;
        }
    });
});
