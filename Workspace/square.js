document.addEventListener('DOMContentLoaded', function () {
    const squareToolButton = document.getElementById('squareToolButton');
    const deleteButton = document.getElementById('binButton');
    let selectedSquare = null;
    let gridSize = 20;
    let isGridActive = false;
    let squareIdCounter = 0;

    // Workspace pan offset
    let workspaceOffsetX = 0;
    let workspaceOffsetY = 0;

    // Load saved workspace offset
    loadWorkspaceOffset();

    // Squares data stored here to update positions relative to workspaceOffset
    // We'll keep squares' logical positions relative to workspace coords (without offset)
    let squaresData = [];

    // Load saved squares on page load
    loadSquares();

    squareToolButton.addEventListener('click', function () {
        createRectangle();
    });

    // --- Modify createRectangle to accept logical positions (relative to workspace) ---
    function createRectangle(props = {}) {
        const square = document.createElement('div');
        square.classList.add('centeredSquare');
        square.dataset.id = props.id || `square-${Date.now()}-${squareIdCounter++}`;

        const initial = {
            width: props.width || 200,
            height: props.height || 200,
            left: props.left !== undefined ? props.left : window.innerWidth / 2 - 100 - workspaceOffsetX,
            top: props.top !== undefined ? props.top : window.innerHeight / 2 - 100 - workspaceOffsetY,
            borderRadius: props.borderRadius || 0,
        };

        Object.assign(square.style, {
            position: 'absolute',
            width: `${initial.width}px`,
            height: `${initial.height}px`,
            // Here we apply workspace offset to get screen position:
            left: `${initial.left + workspaceOffsetX}px`,
            top: `${initial.top + workspaceOffsetY}px`,
            border: '2px solid black',
            backgroundColor: 'transparent',
            borderRadius: `${initial.borderRadius}px`,
        });

        // Add resize circles and drag handle like before
        // Update their event handlers to work with workspace offset

        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        corners.forEach(corner => {
            const circle = document.createElement('div');
            circle.classList.add('resize-circle', corner);
            Object.assign(circle.style, {
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: 'blue',
                borderRadius: '50%',
                display: 'none',
                cursor: 'nwse-resize',
            });

            switch (corner) {
                case 'top-left': circle.style.left = '-5px'; circle.style.top = '-5px'; break;
                case 'top-right': circle.style.right = '-5px'; circle.style.top = '-5px'; break;
                case 'bottom-left': circle.style.left = '-5px'; circle.style.bottom = '-5px'; break;
                case 'bottom-right': circle.style.right = '-5px'; circle.style.bottom = '-5px'; break;
            }

            circle.addEventListener('mousedown', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = parseInt(square.style.width);
                const startHeight = parseInt(square.style.height);
                const startLeft = parseInt(square.style.left) - workspaceOffsetX; // logical pos
                const startTop = parseInt(square.style.top) - workspaceOffsetY;

                function resize(e) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;

                    if (e.shiftKey) {
                        const dragDistance = Math.max(Math.abs(dx), Math.abs(dy));
                        const maxRadius = Math.min(startWidth, startHeight) / 2;
                        square.style.borderRadius = `${Math.min(dragDistance, maxRadius)}px`;
                    } else {
                        if (corner === 'top-left') {
                            square.style.width = `${snapToGrid(startWidth - dx)}px`;
                            square.style.height = `${snapToGrid(startHeight - dy)}px`;
                            // Update logical position (screen pos - workspace offset)
                            square.style.left = `${snapToGrid(startLeft + dx) + workspaceOffsetX}px`;
                            square.style.top = `${snapToGrid(startTop + dy) + workspaceOffsetY}px`;
                        } else if (corner === 'top-right') {
                            square.style.width = `${snapToGrid(startWidth + dx)}px`;
                            square.style.height = `${snapToGrid(startHeight - dy)}px`;
                            square.style.top = `${snapToGrid(startTop + dy) + workspaceOffsetY}px`;
                        } else if (corner === 'bottom-left') {
                            square.style.width = `${snapToGrid(startWidth - dx)}px`;
                            square.style.height = `${snapToGrid(startHeight + dy)}px`;
                            square.style.left = `${snapToGrid(startLeft + dx) + workspaceOffsetX}px`;
                        } else if (corner === 'bottom-right') {
                            square.style.width = `${snapToGrid(startWidth + dx)}px`;
                            square.style.height = `${snapToGrid(startHeight + dy)}px`;
                        }
                    }
                    saveSquare(square);
                }

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                }

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
            });

            square.appendChild(circle);
        });

        const dragHandle = document.createElement('div');
        dragHandle.classList.add('drag-handle');
        Object.assign(dragHandle.style, {
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: 'blue',
            left: 'calc(50% - 5px)',
            top: 'calc(50% - 5px)',
            cursor: 'move',
            display: 'none',
        });
        square.appendChild(dragHandle);

        dragHandle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(square.style.left) - workspaceOffsetX; // logical pos
            const startTop = parseInt(square.style.top) - workspaceOffsetY;

            function drag(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const newLeft = snapToGrid(startLeft + dx);
                const newTop = snapToGrid(startTop + dy);
                square.style.left = `${newLeft + workspaceOffsetX}px`;
                square.style.top = `${newTop + workspaceOffsetY}px`;
                saveSquare(square);
            }

            function stopDrag() {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            }

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        });

        dragHandle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (selectedSquare) selectedSquare.style.border = '2px solid black';
            selectedSquare = square;
            selectedSquare.style.border = '2px solid red';
        });

        square.addEventListener('mouseenter', () => {
            square.querySelectorAll('.resize-circle').forEach(c => c.style.display = 'block');
            dragHandle.style.display = 'block';
        });

        square.addEventListener('mouseleave', () => {
            square.querySelectorAll('.resize-circle').forEach(c => c.style.display = 'none');
            dragHandle.style.display = 'none';
        });

        document.body.appendChild(square);

        // Save the logical position (left - workspaceOffsetX) etc in squaresData and localStorage
        saveSquare(square);
    }

    // Snap to grid function same as before
    function snapToGrid(value) {
        return isGridActive ? Math.round(value / gridSize) * gridSize : value;
    }

    deleteButton.addEventListener('click', function () {
        if (selectedSquare) {
            const id = selectedSquare.dataset.id;
            selectedSquare.remove();
            deleteSquare(id);
            selectedSquare = null;
        }
    });

    document.addEventListener('click', function (e) {
        if (selectedSquare && !e.target.closest('.centeredSquare')) {
            selectedSquare.style.border = '2px solid black';
            selectedSquare = null;
        }
    });

    function toggleGrid() {
        isGridActive = !isGridActive;
    }

    // Save a square's logical position (subtract workspace offset)
    function saveSquare(square) {
        const id = square.dataset.id;
        const leftLogical = parseInt(square.style.left) - workspaceOffsetX;
        const topLogical = parseInt(square.style.top) - workspaceOffsetY;

        const squareData = {
            id,
            left: leftLogical,
            top: topLogical,
            width: parseInt(square.style.width),
            height: parseInt(square.style.height),
            borderRadius: parseInt(square.style.borderRadius) || 0,
        };

        // Update squaresData array
        const existingIndex = squaresData.findIndex(s => s.id === id);
        if (existingIndex !== -1) {
            squaresData[existingIndex] = squareData;
        } else {
            squaresData.push(squareData);
        }

        localStorage.setItem('squares', JSON.stringify(squaresData));
    }

    function deleteSquare(id) {
        squaresData = squaresData.filter(s => s.id !== id);
        localStorage.setItem('squares', JSON.stringify(squaresData));
    }

    function loadSquares() {
        squaresData = JSON.parse(localStorage.getItem('squares') || '[]');
        squaresData.forEach(s => createRectangle(s));
    }

    // --- Workspace dragging implementation ---
    let isWorkspaceDragging = false;
    let workspaceDragStartX = 0;
    let workspaceDragStartY = 0;

    document.body.addEventListener('mousedown', function (e) {
        if (e.target.closest('.centeredSquare') || e.target.closest('.resize-circle') || e.target.closest('.drag-handle')) {
            // If clicking on square or controls, don't start dragging workspace
            return;
        }

        // Only start dragging workspace on right mouse button (buttons=2)
        if (e.buttons === 2) {
            isWorkspaceDragging = true;
            workspaceDragStartX = e.clientX;
            workspaceDragStartY = e.clientY;
            e.preventDefault();
        }
    });

    document.body.addEventListener('mousemove', function (e) {
        if (!isWorkspaceDragging) return;

        const dx = e.clientX - workspaceDragStartX;
        const dy = e.clientY - workspaceDragStartY;

        workspaceOffsetX += dx;
        workspaceOffsetY += dy;

        workspaceDragStartX = e.clientX;
        workspaceDragStartY = e.clientY;

        document.querySelectorAll('.centeredSquare').forEach(square => {
            const id = square.dataset.id;
            const data = squaresData.find(s => s.id === id);
            if (!data) return;

            square.style.left = `${data.left + workspaceOffsetX}px`;
            square.style.top = `${data.top + workspaceOffsetY}px`;
        });
    });

    document.body.addEventListener('mouseup', function (e) {
        if (isWorkspaceDragging) {
            isWorkspaceDragging = false;
            saveWorkspaceOffset();
        }
    });

    // Save/load workspace offset in localStorage
    function saveWorkspaceOffset() {
        localStorage.setItem('workspaceOffset', JSON.stringify({ x: workspaceOffsetX, y: workspaceOffsetY }));
    }

    function loadWorkspaceOffset() {
        const saved = localStorage.getItem('workspaceOffset');
        if (saved) {
            const pos = JSON.parse(saved);
            workspaceOffsetX = pos.x || 0;
            workspaceOffsetY = pos.y || 0;
        }
    }
});
