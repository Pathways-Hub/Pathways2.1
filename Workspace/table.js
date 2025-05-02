document.addEventListener('DOMContentLoaded', () => {
    const tableButton = document.getElementById('tableButton');
    let currentlySelected = null;

    tableButton.addEventListener('click', () => {
        let columns = prompt('Enter the number of columns (1-10):');
        let rows = prompt('Enter the number of rows (1-10):');

        columns = parseInt(columns, 10);
        rows = parseInt(rows, 10);

        if (isNaN(columns) || isNaN(rows) || columns < 1 || columns > 10 || rows < 1 || rows > 10) {
            alert('Please enter valid numbers between 1 and 10 for both columns and rows.');
            return;
        }

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.position = 'absolute';
        table.style.border = '1px solid black';
        table.style.width = `${columns * 60}px`;
        table.style.height = `${rows * 40}px`;

        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < columns; j++) {
                const td = document.createElement('td');
                td.contentEditable = 'true';
                td.style.border = '1px solid black';
                td.style.padding = '8px';
                td.style.minWidth = '50px';
                td.style.textAlign = 'center';
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        document.body.appendChild(table);

        function centerTable() {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const tableWidth = table.offsetWidth;
            const tableHeight = table.offsetHeight;

            const left = (viewportWidth - tableWidth) / 2;
            const top = (viewportHeight - tableHeight) / 2;

            table.style.left = `${left}px`;
            table.style.top = `${top}px`;
        }

        centerTable();

        // Create the control button
        const controlButton = document.createElement('button');
        controlButton.innerHTML = '<i class="fa-solid fa-up-down-left-right"></i>';
        controlButton.style.position = 'absolute';
        controlButton.style.zIndex = '1002';
        controlButton.style.display = 'none'; // Initially hidden
        controlButton.classList.add('icon-button', 'table-control-button');
        document.body.appendChild(controlButton);

        function updateControlButtonPosition() {
            const tableRect = table.getBoundingClientRect();
            controlButton.style.left = `${tableRect.left + window.scrollX}px`;
            controlButton.style.top = `${tableRect.top + window.scrollY - 35}px`;
        }

        updateControlButtonPosition();

        makeDraggable(controlButton, table, updateControlButtonPosition);
        makeSelectable(table, controlButton);

        window.addEventListener('scroll', updateControlButtonPosition);

        // Show/hide control button based on proximity
        document.addEventListener('mousemove', (e) => {
            const tableRect = table.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const proximity = 50; // Extended proximity area
            if (
                mouseX >= tableRect.left - proximity &&
                mouseX <= tableRect.right + proximity &&
                mouseY >= tableRect.top - proximity &&
                mouseY <= tableRect.bottom + proximity
            ) {
                controlButton.style.display = 'block';
            } else {
                controlButton.style.display = 'none';
            }
        });

        // Handle removal of table and control button
        function removeTableAndButton() {
            if (currentlySelected) {
                currentlySelected.remove();
                controlButton.remove();
                currentlySelected = null;
            }
        }

        document.getElementById('binButton').addEventListener('click', removeTableAndButton);
    });

    function makeDraggable(controlButton, table, updateControlButtonPosition) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        controlButton.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const buttonRect = controlButton.getBoundingClientRect();
            const tableRect = table.getBoundingClientRect();

            initialX = tableRect.left + (e.clientX - buttonRect.left);
            initialY = tableRect.top + (e.clientY - buttonRect.top);

            table.style.zIndex = '1003';

            // Select the table when dragging starts
            selectTable(table);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                table.style.left = `${initialX + deltaX}px`;
                table.style.top = `${initialY + deltaY}px`;

                updateControlButtonPosition();
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                table.style.zIndex = '1002';
            }
        });
    }

    function makeSelectable(table, controlButton) {
        function selectTable(table) {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
                currentlySelected.classList.remove('table-selected');
            }
            currentlySelected = table;
            table.classList.add('selected');
            table.classList.add('table-selected');
        }

        controlButton.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTable(table);
        });

        document.addEventListener('click', (event) => {
            if (currentlySelected && !currentlySelected.contains(event.target) && !controlButton.contains(event.target)) {
                currentlySelected.classList.remove('selected');
                currentlySelected.classList.remove('table-selected');
                currentlySelected = null;
            }
        });

        table.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    // Remove table and control button when the bin button is clicked
    function removeTableAndButton() {
        if (currentlySelected) {
            currentlySelected.remove();
            const controlButton = document.querySelector('.table-control-button');
            if (controlButton) {
                controlButton.remove();
            }
            currentlySelected = null;
        }
    }

    document.getElementById('binButton').addEventListener('click', removeTableAndButton);
});
