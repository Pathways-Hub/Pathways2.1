document.addEventListener('DOMContentLoaded', () => {
    let isDrawing = false;
    let isErasing = false;
    let isMouseDown = false;
    let isDrawingRect = false; // rectangle mode flag (add toggle for this in your UI)
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

    // Store shapes: lines and rectangles
    // lines: { type: 'line', points: [...] }
    // rectangles: { type: 'rect', start: {x,y}, end: {x,y} }
    const shapes = [];

    // Temporary variables for current drawing
    let currentLine = [];
    let rectStart = null;
    let rectEnd = null;

    // Eraser cursor circle
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

    // Resize canvas & redraw
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redrawAllShapes();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Save shapes array to localStorage
    function saveShapes() {
        localStorage.setItem('myDrawingShapes', JSON.stringify(shapes));
    }

    // Load shapes array from localStorage
    function loadShapes() {
        const data = localStorage.getItem('myDrawingShapes');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    shapes.length = 0;
                    shapes.push(...parsed);
                }
            } catch (e) {
                console.warn('Error parsing shapes from localStorage', e);
            }
        }
    }

    // Start drawing (line or rect)
    function startAction(event) {
        if (!isDrawing && !isErasing && !isDrawingRect) return;

        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
        const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;

        isMouseDown = true;

        if (isDrawing) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            currentLine = [{ x, y }];
        } else if (isDrawingRect) {
            rectStart = { x, y };
            rectEnd = null;
        }
    }

    // Drawing or erasing
    function performAction(event) {
        if ((!isDrawing && !isErasing && !isDrawingRect) || !isMouseDown) return;

        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
        const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;

        if (isDrawing) {
            ctx.lineTo(x, y);
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
                    // Simple rectangle hit test: check if eraser inside rectangle bbox (+eraserSize)
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
            saveShapes();
        } else if (isDrawingRect && rectStart) {
            rectEnd = { x, y };
            redrawAllShapes();
            // Draw current rect preview
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            const left = Math.min(rectStart.x, rectEnd.x);
            const top = Math.min(rectStart.y, rectEnd.y);
            const width = Math.abs(rectEnd.x - rectStart.x);
            const height = Math.abs(rectEnd.y - rectStart.y);
            ctx.strokeRect(left, top, width, height);
        }
    }

    // Finish drawing/erasing
    function stopAction() {
        if (isDrawing && currentLine.length > 0) {
            shapes.push({ type: 'line', points: [...currentLine] });
            currentLine = [];
            ctx.closePath();
            saveShapes();
        } else if (isDrawingRect && rectStart && rectEnd) {
            shapes.push({ type: 'rect', start: rectStart, end: rectEnd });
            rectStart = null;
            rectEnd = null;
            saveShapes();
            redrawAllShapes();
        }
        isMouseDown = false;
    }

    // Redraw all saved shapes
    function redrawAllShapes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        for (const shape of shapes) {
            if (shape.type === 'line' && shape.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                ctx.stroke();
                ctx.closePath();
            } else if (shape.type === 'rect') {
                const left = Math.min(shape.start.x, shape.end.x);
                const top = Math.min(shape.start.y, shape.end.y);
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

    // Dummy disable text editing func, update as you want
    function disableTextEditing(state) {}

    // Toggle pencil drawing mode
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
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchmove', updateCursorVisuals);
            document.removeEventListener('touchend', stopAction);
            pencilIcon.style.color = 'black';
            disableTextEditing(false);
            console.log('Drawing mode deactivated');
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
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            console.log('Drawing mode activated');
        }
    });

    // Toggle eraser mode
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
            document.removeEventListener('touchstart', startAction);
            document.removeEventListener('touchmove', performAction);
            document.removeEventListener('touchmove', updateCursorVisuals);
            document.removeEventListener('touchend', stopAction);
            eraserIcon.style.color = 'black';
            disableTextEditing(false);
            console.log('Eraser mode deactivated');
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
            document.addEventListener('touchstart', startAction);
            document.addEventListener('touchmove', performAction);
            document.addEventListener('touchmove', updateCursorVisuals);
            document.addEventListener('touchend', stopAction);
            disableTextEditing(true);
            console.log('Eraser mode activated');
        }
    });

    // You should add a similar button/toggle for rectangle mode:
    // Example:
    /*
    document.getElementById('rectButton').addEventListener('click', () => {
        // toggle isDrawingRect true/false; set isDrawing and isErasing false;
        // show crosshair or other cursor for rect drawing
        // bind/unbind events like above
    });
    */

    // Load saved shapes and redraw at start
    loadShapes();
    redrawAllShapes();
});
