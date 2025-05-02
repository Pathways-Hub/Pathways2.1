// Wait for the DOM to fully load before attaching the event listener
document.addEventListener('DOMContentLoaded', function () {
    const squareToolButton = document.getElementById('squareToolButton');
    const deleteButton = document.getElementById('binButton');
    let selectedSquare = null; // Track the selected square

    squareToolButton.addEventListener('click', function () {
        createRectangle();
    });

    let gridSize = 20; // Grid size for snapping
    let isGridActive = false; // Tracks if the grid is active

    // Function to create a new rectangle
    function createRectangle() {
        const square = document.createElement('div');
        square.classList.add('centeredSquare');
        square.style.position = 'absolute';
        square.style.width = '200px';
        square.style.height = '200px';
        square.style.backgroundColor = 'transparent';
        square.style.border = '2px solid black';

        const centerX = (window.innerWidth / 2) - 100;
        const centerY = (window.innerHeight / 2) - 100;

        square.style.left = `${centerX}px`;
        square.style.top = `${centerY}px`;

        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        corners.forEach(corner => {
            const circle = document.createElement('div');
            circle.classList.add('resize-circle', corner);
            circle.style.position = 'absolute';
            circle.style.width = '10px';
            circle.style.height = '10px';
            circle.style.backgroundColor = 'blue';
            circle.style.borderRadius = '50%';
            circle.style.display = 'none';
            switch (corner) {
                case 'top-left':
                    circle.style.left = '-5px';
                    circle.style.top = '-5px';
                    break;
                case 'top-right':
                    circle.style.right = '-5px';
                    circle.style.top = '-5px';
                    break;
                case 'bottom-left':
                    circle.style.left = '-5px';
                    circle.style.bottom = '-5px';
                    break;
                case 'bottom-right':
                    circle.style.right = '-5px';
                    circle.style.bottom = '-5px';
                    break;
            }
            square.appendChild(circle);

            circle.addEventListener('mousedown', function (e) {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = parseInt(window.getComputedStyle(square).width, 10);
                const startHeight = parseInt(window.getComputedStyle(square).height, 10);
                const startLeft = parseInt(window.getComputedStyle(square).left, 10);
                const startTop = parseInt(window.getComputedStyle(square).top, 10);

                function resize(e) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;

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

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                }

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
            });
        });

        const dragHandle = document.createElement('div');
        dragHandle.classList.add('drag-handle');
        dragHandle.style.position = 'absolute';
        dragHandle.style.width = '10px';
        dragHandle.style.height = '10px';
        dragHandle.style.backgroundColor = 'blue';
        dragHandle.style.left = 'calc(50% - 5px)';
        dragHandle.style.top = 'calc(50% - 5px)';
        dragHandle.style.cursor = 'move';
        dragHandle.style.display = 'none';
        square.appendChild(dragHandle);

        dragHandle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(window.getComputedStyle(square).left, 10);
            const startTop = parseInt(window.getComputedStyle(square).top, 10);

            function drag(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                square.style.left = `${snapToGrid(startLeft + dx)}px`;
                square.style.top = `${snapToGrid(startTop + dy)}px`;
            }

            function stopDrag() {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            }

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        });

        // Select the square on drag handle click
        dragHandle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (selectedSquare) {
                selectedSquare.style.border = '2px solid black';
            }
            selectedSquare = square;
            selectedSquare.style.border = '2px solid red';
        });

        square.addEventListener('mouseenter', function () {
            square.querySelectorAll('.resize-circle').forEach(circle => {
                circle.style.display = 'block';
            });
            dragHandle.style.display = 'block';
        });

        square.addEventListener('mouseleave', function () {
            square.querySelectorAll('.resize-circle').forEach(circle => {
                circle.style.display = 'none';
            });
            dragHandle.style.display = 'none';
        });

        document.body.appendChild(square);
    }

    // Function to snap values to the grid if the grid is active
    function snapToGrid(value) {
        if (isGridActive) {
            return Math.round(value / gridSize) * gridSize;
        }
        return value;
    }

    // Delete the selected square
    deleteButton.addEventListener('click', function () {
        if (selectedSquare) {
            selectedSquare.remove();
            selectedSquare = null;
        }
    });

    // Deselect the square when clicking elsewhere
    document.addEventListener('click', function (e) {
        if (selectedSquare && !e.target.closest('.centeredSquare')) {
            selectedSquare.style.border = '2px solid black';
            selectedSquare = null;
        }
    });

    // Toggle the grid state (this function can be triggered by a separate grid toggle button)
    function toggleGrid() {
        isGridActive = !isGridActive;
    }

    // Example of how to toggle the grid from a button (uncomment if needed)
    // document.getElementById('gridToggleButton').addEventListener('click', toggleGrid);
});
