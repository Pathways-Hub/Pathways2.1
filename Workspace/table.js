document.addEventListener('DOMContentLoaded', () => {
    const tableButton = document.getElementById('tableButton');
    let currentlySelected = null;
    let tableIdCounter = 0;

    loadSavedTables(); // Load any existing tables

    tableButton.addEventListener('click', () => {
        let columns = prompt('Enter the number of columns (1-10):');
        let rows = prompt('Enter the number of rows (1-10):');

        columns = parseInt(columns, 10);
        rows = parseInt(rows, 10);

        if (isNaN(columns) || isNaN(rows) || columns < 1 || columns > 10 || rows < 1 || rows > 10) {
            alert('Please enter valid numbers between 1 and 10 for both columns and rows.');
            return;
        }

        const tableData = {
            id: `table-${Date.now()}`,
            rows,
            columns,
            x: 0,
            y: 0,
            content: Array.from({ length: rows }, () => Array(columns).fill(''))
        };

        const table = createTableElement(tableData);
        centerTable(table);
        saveTablesToLocalStorage(); // Save immediately
    });

    function createTableElement(data) {
        const table = document.createElement('table');
        table.dataset.tableId = data.id;
        table.style.borderCollapse = 'collapse';
        table.style.position = 'absolute';
        table.style.border = '1px solid black';
        table.style.width = `${data.columns * 60}px`;
        table.style.height = `${data.rows * 40}px`;
        table.style.left = `${data.x}px`;
        table.style.top = `${data.y}px`;

        for (let i = 0; i < data.rows; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < data.columns; j++) {
                const td = document.createElement('td');
                td.contentEditable = 'true';
                td.style.border = '1px solid black';
                td.style.padding = '8px';
                td.style.minWidth = '50px';
                td.style.textAlign = 'center';
                td.textContent = data.content?.[i]?.[j] || '';
                td.addEventListener('input', saveTablesToLocalStorage);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        document.body.appendChild(table);

        const controlButton = document.createElement('button');
        controlButton.innerHTML = '<i class="fa-solid fa-up-down-left-right"></i>';
        controlButton.style.position = 'absolute';
        controlButton.style.zIndex = '1002';
        controlButton.style.display = 'none';
        controlButton.classList.add('table-button', 'table-control-button');
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

        document.addEventListener('mousemove', (e) => {
            const rect = table.getBoundingClientRect();
            const proximity = 50;
            if (
                e.clientX >= rect.left - proximity && e.clientX <= rect.right + proximity &&
                e.clientY >= rect.top - proximity && e.clientY <= rect.bottom + proximity
            ) {
                controlButton.style.display = 'block';
            } else {
                controlButton.style.display = 'none';
            }
        });

        return table;
    }

    function centerTable(table) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = table.offsetWidth;
        const h = table.offsetHeight;

        const left = (vw - w) / 2;
        const top = (vh - h) / 2;

        table.style.left = `${left}px`;
        table.style.top = `${top}px`;
    }

    function makeDraggable(controlButton, table, updateControlButtonPosition) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        controlButton.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const tableRect = table.getBoundingClientRect();
            initialX = tableRect.left;
            initialY = tableRect.top;

            selectTable(table);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const newX = initialX + dx;
                const newY = initialY + dy;

                table.style.left = `${newX}px`;
                table.style.top = `${newY}px`;

                updateControlButtonPosition();
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                saveTablesToLocalStorage();
            }
        });
    }

    function makeSelectable(table, controlButton) {
        function selectTable(t) {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected', 'table-selected');
            }
            currentlySelected = t;
            t.classList.add('selected', 'table-selected');
        }

        controlButton.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTable(table);
        });

        document.addEventListener('click', (e) => {
            if (currentlySelected && !currentlySelected.contains(e.target) && !controlButton.contains(e.target)) {
                currentlySelected.classList.remove('selected', 'table-selected');
                currentlySelected = null;
            }
        });

        table.addEventListener('click', (e) => e.stopPropagation());
    }

    function saveTablesToLocalStorage() {
        const tables = document.querySelectorAll('table[data-table-id]');
        const saved = [];

        tables.forEach(table => {
            const id = table.dataset.tableId;
            const x = parseFloat(table.style.left);
            const y = parseFloat(table.style.top);
            const rows = table.rows.length;
            const columns = table.rows[0]?.cells.length || 0;
            const content = [];

            for (let i = 0; i < rows; i++) {
                const row = [];
                for (let j = 0; j < columns; j++) {
                    row.push(table.rows[i].cells[j].textContent || '');
                }
                content.push(row);
            }

            saved.push({ id, x, y, rows, columns, content });
        });

        localStorage.setItem('savedTables', JSON.stringify(saved));
    }

    function loadSavedTables() {
        const data = JSON.parse(localStorage.getItem('savedTables') || '[]');
        data.forEach(tableData => {
            createTableElement(tableData);
        });
    }

    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            const id = currentlySelected.dataset.tableId;
            currentlySelected.remove();
            const controlButton = document.querySelector('.table-control-button');
            if (controlButton) controlButton.remove();

            currentlySelected = null;

            const all = JSON.parse(localStorage.getItem('savedTables') || '[]');
            const filtered = all.filter(t => t.id !== id);
            localStorage.setItem('savedTables', JSON.stringify(filtered));
        }
    });
});
