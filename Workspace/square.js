document.addEventListener('DOMContentLoaded', function () {
    const squareToolButton = document.getElementById('squareToolButton');
    const deleteButton = document.getElementById('binButton');
    let selectedSquare = null;
    let gridSize = 20;
    let isGridActive = false;
    let squareIdCounter = 0;

    // Load saved squares on page load
    loadSquares();

    squareToolButton.addEventListener('click', function () {
        createRectangle();
    });

    function createRectangle(props = {}) {
        const square = document.createElement('div');
        square.classList.add('centeredSquare');
        square.dataset.id = props.id || `square-${Date.now()}-${squareIdCounter++}`;

        const initial = {
            width: props.width || 200,
            height: props.height || 200,
            left: props.left || window.innerWidth / 2 - 100,
            top: props.top || window.innerHeight / 2 - 100,
            borderRadius: props.borderRadius || 0,
        };

        Object.assign(square.style, {
            position: 'absolute',
            width: `${initial.width}px`,
            height: `${initial.height}px`,
            left: `${initial.left}px`,
            top: `${initial.top}px`,
            border: '2px solid black',
            backgroundColor: 'transparent',
            borderRadius: `${initial.borderRadius}px`,
        });

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
                const startLeft = parseInt(square.style.left);
                const startTop = parseInt(square.style.top);

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
                            square.style.left = `${snapToGrid(startLeft + dx)}px`;
                            square.style.top = `${snapToGrid(startTop + dy)}px`;
                        } else if (corner === 'top-right') {
                            square.style.width = `${snapToGrid(startWidth + dx)}px`;
                            square.style.height = `${snapToGrid(startHeight - dy)}px`;
                            square.style.top = `${snapToGrid(startTop + dy)}px`;
                        } else if (corner === 'bottom-left') {
                            square.style.width = `${snapToGrid(startWidth - dx)}px`;
                            square.style.height = `${snapToGrid(startHeight + dy)}px`;
                            square.style.left = `${snapToGrid(startLeft + dx)}px`;
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
            const startLeft = parseInt(square.style.left);
            const startTop = parseInt(square.style.top);

            function drag(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                square.style.left = `${snapToGrid(startLeft + dx)}px`;
                square.style.top = `${snapToGrid(startTop + dy)}px`;
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
        saveSquare(square);
    }

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

    function saveSquare(square) {
        const id = square.dataset.id;
        const squareData = {
            id,
            left: parseInt(square.style.left),
            top: parseInt(square.style.top),
            width: parseInt(square.style.width),
            height: parseInt(square.style.height),
            borderRadius: parseInt(square.style.borderRadius) || 0,
        };

        const allSquares = JSON.parse(localStorage.getItem('squares') || '[]');
        const existingIndex = allSquares.findIndex(s => s.id === id);
        if (existingIndex !== -1) {
            allSquares[existingIndex] = squareData;
        } else {
            allSquares.push(squareData);
        }
        localStorage.setItem('squares', JSON.stringify(allSquares));
    }

    function deleteSquare(id) {
        let allSquares = JSON.parse(localStorage.getItem('squares') || '[]');
        allSquares = allSquares.filter(s => s.id !== id);
        localStorage.setItem('squares', JSON.stringify(allSquares));
    }

    function loadSquares() {
        const allSquares = JSON.parse(localStorage.getItem('squares') || '[]');
        allSquares.forEach(s => createRectangle(s));
    }
});
