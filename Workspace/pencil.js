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

    // Horizontal line
    const hLine = document.createElement('div');
    hLine.style.position = 'absolute';
    hLine.style.top = `${crosshairSize / 2}px`;
    hLine.style.left = '0';
    hLine.style.width = `${crosshairSize}px`;
    hLine.style.height = '1px';
    hLine.style.backgroundColor = 'black';

    // Vertical line
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
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function startAction(event) {
        if (isDrawing || isErasing) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches[0].clientX) - rect.left;
            const y = (event.clientY || event.touches[0].clientY) - rect.top;
            ctx.beginPath();
            ctx.moveTo(x, y);
            isMouseDown = true;
        }
    }

    function performAction(event) {
        if ((isDrawing || isErasing) && isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX || event.touches[0].clientX) - rect.left;
            const y = (event.clientY || event.touches[0].clientY) - rect.top;

            if (isDrawing) {
                ctx.lineWidth = 2;
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (isErasing) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    }

    function stopAction() {
        if (isDrawing || isErasing) {
            ctx.closePath();
            isMouseDown = false;
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
        isDrawing = !isDrawing;
        isErasing = false;
        const pencilIcon = document.getElementById('pencilButton').querySelector('i');

        if (isDrawing) {
            canvas.style.display = 'block';
            crosshair.style.display = 'block';
            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('mouseup', stopAction);
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            pencilIcon.style.color = 'rgb(77, 77, 77)';
            console.log('Drawing mode activated');
        } else {
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchmove', updateCursorVisuals);
            document.removeEventListener('touchend', stopAction);
            crosshair.style.display = 'none';
            disableTextEditing(false);
            pencilIcon.style.color = 'black';
            console.log('Drawing mode deactivated');
        }
    });

    document.getElementById('eraserButton').addEventListener('click', () => {
        isErasing = !isErasing;
        isDrawing = false;
        const eraserIcon = document.getElementById('eraserButton').querySelector('i');

        if (isErasing) {
            canvas.style.display = 'block';
            eraserOutline.style.display = 'block';
            crosshair.style.display = 'none';
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mouseup', stopAction);
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            eraserIcon.style.color = 'rgb(77, 77, 77)';
            console.log('Eraser mode activated');
        } else {
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('touchmove', updateCursorVisuals);
            eraserOutline.style.display = 'none';
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchend', stopAction);
            disableTextEditing(false);
            eraserIcon.style.color = 'black';
            console.log('Eraser mode deactivated');
        }
    });

    function disableTextEditing(disable) {
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.contentEditable = !disable;
        });
        document.querySelectorAll('.text-preview, .input-area').forEach(el => {
            el.style.pointerEvents = disable ? 'none' : 'auto';
        });
    }
});
