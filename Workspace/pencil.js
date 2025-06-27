// pencil.js

document.addEventListener('DOMContentLoaded', () => {
    let isDrawing = false;
    let isErasing = false;
    let isMouseDown = false;
    const eraserSize = 10;

    const canvas = document.createElement('canvas');
    canvas.id = 'drawingCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Store all lines drawn
    const lines = [];

    let currentLine = [];

    // Eraser outline element
    const eraserOutline = document.createElement('div');
    eraserOutline.style.position = 'absolute';
    eraserOutline.style.border = '1px solid grey';
    eraserOutline.style.borderRadius = '50%';
    eraserOutline.style.width = `${eraserSize * 2}px`;
    eraserOutline.style.height = `${eraserSize * 2}px`;
    eraserOutline.style.pointerEvents = 'none';
    eraserOutline.style.display = 'none';
    eraserOutline.style.zIndex = '1000';
    document.body.appendChild(eraserOutline);

    // Crosshair element (size same as eraser circle)
    const crosshairSize = eraserSize * 2;
    const crosshair = document.createElement('div');
    crosshair.id = 'crosshairCursor';
    crosshair.style.position = 'absolute';
    crosshair.style.width = `${crosshairSize}px`;
    crosshair.style.height = `${crosshairSize}px`;
    crosshair.style.pointerEvents = 'none';
    crosshair.style.display = 'none';
    crosshair.style.zIndex = '1001';

    const hLine = document.createElement('div');
    hLine.style.position = 'absolute';
    hLine.style.top = `${crosshairSize / 2}px`;
    hLine.style.left = '0';
    hLine.style.width = `${crosshairSize}px`;
    hLine.style.height = '1px';
    hLine.style.backgroundColor = 'black';

    const vLine = document.createElement('div');
    vLine.style.position = 'absolute';
    vLine.style.left = `${crosshairSize / 2}px`;
    vLine.style.top = '0';
    vLine.style.height = `${crosshairSize}px`;
    vLine.style.width = '1px';
    vLine.style.backgroundColor = 'black';

    crosshair.appendChild(hLine);
    crosshair.appendChild(vLine);
    document.body.appendChild(crosshair);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redrawAllLines();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function startAction(event) {
        if (isDrawing || isErasing) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
            const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;

            isMouseDown = true;

            if (isDrawing) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                currentLine = [{ x, y }];
            }
        }
    }

    function performAction(event) {
        if ((isDrawing || isErasing) && isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
            const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;

            if (isDrawing) {
                ctx.lineTo(x, y);
                ctx.stroke();
                currentLine.push({ x, y });
            } else if (isErasing) {
                // Find and remove any line containing a point near this location
                for (let i = lines.length - 1; i >= 0; i--) {
                    const line = lines[i];
                    if (line.some(point => Math.hypot(point.x - x, point.y - y) <= eraserSize)) {
                        lines.splice(i, 1);
                    }
                }
                redrawAllLines();
            }
        }
    }

    function stopAction() {
        if (isDrawing && currentLine.length > 0) {
            lines.push([...currentLine]);
            currentLine = [];
            ctx.closePath();
        }
        isMouseDown = false;
    }

    function redrawAllLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        for (const line of lines) {
            if (line.length > 1) {
                ctx.beginPath();
                ctx.moveTo(line[0].x, line[0].y);
                for (let i = 1; i < line.length; i++) {
                    ctx.lineTo(line[i].x, line[i].y);
                }
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    function updateCursorVisuals(event) {
        const x = event.clientX || event.touches?.[0]?.clientX;
        const y = event.clientY || event.touches?.[0]?.clientY;

        if (isErasing) {
            eraserOutline.style.left = `${x - eraserSize}px`;
            eraserOutline.style.top = `${y - eraserSize}px`;
        }

        if (isDrawing) {
            crosshair.style.left = `${x - crosshairSize / 2}px`;
            crosshair.style.top = `${y - crosshairSize / 2}px`;
        }
    }

    document.getElementById('pencilButton').addEventListener('click', () => {
        const pencilIcon = document.getElementById('pencilButton').querySelector('i');
        const eraserIcon = document.getElementById('eraserButton').querySelector('i');

        if (isDrawing) {
            // Turn OFF drawing
            isDrawing = false;
            crosshair.style.display = 'none';
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchmove', updateCursorVisuals);
            document.removeEventListener('touchend', stopAction);
            pencilIcon.style.color = 'black';
            disableTextEditing(false);
            console.log('Drawing mode deactivated');
        } else {
            // Turn ON drawing
            isDrawing = true;
            isErasing = false;
            canvas.style.display = 'block';
            crosshair.style.display = 'block';
            eraserOutline.style.display = 'none';
            pencilIcon.style.color = 'rgb(77, 77, 77)';
            eraserIcon.style.color = 'black';

            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('mouseup', stopAction);
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            console.log('Drawing mode activated');
        }
    });

    document.getElementById('eraserButton').addEventListener('click', () => {
        const pencilIcon = document.getElementById('pencilButton').querySelector('i');
        const eraserIcon = document.getElementById('eraserButton').querySelector('i');

        if (isErasing) {
            // Turn OFF erasing
            isErasing = false;
            eraserOutline.style.display = 'none';
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchmove', updateCursorVisuals);
            document.removeEventListener('touchend', stopAction);
            eraserIcon.style.color = 'black';
            disableTextEditing(false);
            console.log('Eraser mode deactivated');
        } else {
            // Turn ON erasing
            isErasing = true;
            isDrawing = false;
            canvas.style.display = 'block';
            eraserOutline.style.display = 'block';
            crosshair.style.display = 'none';
            eraserIcon.style.color = 'rgb(77, 77, 77)';
            pencilIcon.style.color = 'black';

            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('mouseup', stopAction);
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            console.log('Eraser mode activated');
        }
    });

});
