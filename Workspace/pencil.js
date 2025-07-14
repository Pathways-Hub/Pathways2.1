document.addEventListener('DOMContentLoaded', () => {
    let isDrawing = false;
    let isErasing = false;
    let isMouseDown = false;
    let isDrawingRect = false;
    const eraserSize = 10;

    let offsetX = 0;
    let offsetY = 0;
    let dragStart = null;

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

    const shapes = [];
    let currentLine = [];
    let rectStart = null;
    let rectEnd = null;

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
        redrawAllShapes();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function saveShapesAndOffset() {
        localStorage.setItem('myDrawingShapes', JSON.stringify(shapes));
        localStorage.setItem('myDrawingOffset', JSON.stringify({ offsetX, offsetY }));
    }

    function loadShapesAndOffset() {
        const shapesData = localStorage.getItem('myDrawingShapes');
        if (shapesData) {
            try {
                const parsedShapes = JSON.parse(shapesData);
                if (Array.isArray(parsedShapes)) {
                    shapes.length = 0;
                    shapes.push(...parsedShapes);
                }
            } catch (e) {
                console.warn('Error parsing shapes from localStorage', e);
            }
        }
        const offsetData = localStorage.getItem('myDrawingOffset');
        if (offsetData) {
            try {
                const parsedOffset = JSON.parse(offsetData);
                if (
                    typeof parsedOffset.offsetX === 'number' &&
                    typeof parsedOffset.offsetY === 'number'
                ) {
                    offsetX = parsedOffset.offsetX;
                    offsetY = parsedOffset.offsetY;
                }
            } catch (e) {
                console.warn('Error parsing offset from localStorage', e);
            }
        }
    }

    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left - offsetX;
        const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top - offsetY;
        return { x, y };
    }

    function startAction(event) {
        if (event.button === 2) return;
        if (!isDrawing && !isErasing && !isDrawingRect) return;

        isMouseDown = true;
        const { x, y } = getMousePos(event);

        if (isDrawing) {
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y + offsetY);
            currentLine = [{ x, y }];
        } else if (isDrawingRect) {
            rectStart = { x, y };
            rectEnd = null;
        }
    }

    function performAction(event) {
        if ((!isDrawing && !isErasing && !isDrawingRect) || !isMouseDown) return;

        const { x, y } = getMousePos(event);

        if (isDrawing) {
            ctx.lineTo(x + offsetX, y + offsetY);
            ctx.stroke();
            currentLine.push({ x, y });
        } else if (isErasing) {
            for (let i = shapes.length - 1; i >= 0; i--) {
                const shape = shapes[i];
                if (shape.type === 'line') {
                    if (shape.points.some(point => Math.hypot(point.x - x, point.y - y) <= eraserSize)) {
                        shapes.splice(i, 1);
                    }
                } else if (shape.type === 'rect') {
                    const left = Math.min(shape.start.x, shape.end.x) - eraserSize;
                    const right = Math.max(shape.start.x, shape.end.x) + eraserSize;
                    const top = Math.min(shape.start.y, shape.end.y) - eraserSize;
                    const bottom = Math.max(shape.start.y, shape.end.y) + eraserSize;
                    if (x >= left && x <= right && y >= top && y <= bottom) {
                        shapes.splice(i, 1);
                    }
                }
            }
            redrawAllShapes();
            saveShapesAndOffset();
        } else if (isDrawingRect && rectStart) {
            rectEnd = { x, y };
            redrawAllShapes();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            const left = Math.min(rectStart.x, rectEnd.x);
            const top = Math.min(rectStart.y, rectEnd.y);
            const width = Math.abs(rectEnd.x - rectStart.x);
            const height = Math.abs(rectEnd.y - rectStart.y);
            ctx.strokeRect(left + offsetX, top + offsetY, width, height);
        }
    }

    function stopAction() {
        if (isDrawing && currentLine.length > 0) {
            const adjustedLine = currentLine.map(pt => ({ x: pt.x, y: pt.y }));
            shapes.push({ type: 'line', points: adjustedLine });
            currentLine = [];
            ctx.closePath();
            saveShapesAndOffset();
        } else if (isDrawingRect && rectStart && rectEnd) {
            shapes.push({ type: 'rect', start: rectStart, end: rectEnd });
            rectStart = null;
            rectEnd = null;
            saveShapesAndOffset();
            redrawAllShapes();
        }
        isMouseDown = false;
    }

    function redrawAllShapes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        for (const shape of shapes) {
            if (shape.type === 'line' && shape.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x + offsetX, shape.points[0].y + offsetY);
                for (let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x + offsetX, shape.points[i].y + offsetY);
                }
                ctx.stroke();
                ctx.closePath();
            } else if (shape.type === 'rect') {
                const left = Math.min(shape.start.x, shape.end.x) + offsetX;
                const top = Math.min(shape.start.y, shape.end.y) + offsetY;
                const width = Math.abs(shape.end.x - shape.start.x);
                const height = Math.abs(shape.end.y - shape.start.y);
                ctx.strokeRect(left, top, width, height);
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

    function disableTextEditing(state) {}

    // PAN HANDLER - right click drag
    document.addEventListener('mousedown', (e) => {
        if (e.button === 2) {
            dragStart = { x: e.clientX, y: e.clientY };
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (dragStart && e.buttons === 2) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            offsetX += dx;
            offsetY += dy;
            dragStart = { x: e.clientX, y: e.clientY };
            redrawAllShapes();
            saveShapesAndOffset();  // Save offset on pan immediately
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 2) dragStart = null;
    });

    // Tool toggles

    document.getElementById('pencilButton').addEventListener('click', () => {
        const pencilIcon = document.getElementById('pencilButton').querySelector('i');
        const eraserIcon = document.getElementById('eraserButton').querySelector('i');

        if (isDrawing) {
            isDrawing = false;
            crosshair.style.display = 'none';
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('mouseup', stopAction);
            pencilIcon.style.color = 'black';
            disableTextEditing(false);
        } else {
            isDrawing = true;
            isErasing = false;
            isDrawingRect = false;
            canvas.style.display = 'block';
            crosshair.style.display = 'block';
            eraserOutline.style.display = 'none';
            pencilIcon.style.color = 'rgb(77, 77, 77)';
            eraserIcon.style.color = 'black';

            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('mouseup', stopAction);
            disableTextEditing(true);
        }
    });

    document.getElementById('eraserButton').addEventListener('click', () => {
        const pencilIcon = document.getElementById('pencilButton').querySelector('i');
        const eraserIcon = document.getElementById('eraserButton').querySelector('i');

        if (isErasing) {
            isErasing = false;
            eraserOutline.style.display = 'none';
            document.removeEventListener('mousedown', startAction);
            document.removeEventListener('mousemove', performAction);
            document.removeEventListener('mousemove', updateCursorVisuals);
            document.removeEventListener('mouseup', stopAction);
            eraserIcon.style.color = 'black';
            disableTextEditing(false);
        } else {
            isErasing = true;
            isDrawing = false;
            isDrawingRect = false;
            canvas.style.display = 'block';
            eraserOutline.style.display = 'block';
            crosshair.style.display = 'none';
            eraserIcon.style.color = 'rgb(77, 77, 77)';
            pencilIcon.style.color = 'black';

            document.addEventListener('mousedown', startAction);
            document.addEventListener('mousemove', performAction);
            document.addEventListener('mousemove', updateCursorVisuals);
            document.addEventListener('mouseup', stopAction);
            disableTextEditing(true);
        }
    });

    loadShapesAndOffset();
    redrawAllShapes();
});
