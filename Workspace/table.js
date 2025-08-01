let selectedTable = null;
const STORAGE_KEY = 'workspaceTablesData';
let tablesData = [];
let tableIdCounter = 0;

// Load saved tables from localStorage on load
function loadTables() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        tablesData = JSON.parse(saved);
    } catch {
        tablesData = [];
    }

    tablesData.forEach(data => {
        createTableFromData(data);
        // Keep track of tableIdCounter to avoid duplicates
        const idNum = parseInt(data.id.split('-')[1]);
        if (idNum >= tableIdCounter) tableIdCounter = idNum + 1;
    });
}

// Create table from saved data
function createTableFromData(data) {
    const container = document.createElement("div");
    container.classList.add("workspaceTable");
    container.dataset.id = data.id;
    container.style.position = "absolute";
    container.style.left = `${data.left + workspaceOffsetX}px`;
    container.style.top = `${data.top + workspaceOffsetY}px`;
    container.style.zIndex = 1000;
    container.style.border = "2px solid transparent";
    container.style.background = "#fff";
    container.style.cursor = "move";
    container.style.padding = "10px";
    container.style.userSelect = "none";

    container.innerHTML = data.html; // restored table with all inner HTML (formatting preserved)

    // Add event listeners for selection & drag

    container.addEventListener("click", e => {
        e.stopPropagation();
        selectTable(container);
    });

    // Make the container draggable
    let isDragging = false, offsetX = 0, offsetY = 0;

    container.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "TD" || e.target.tagName === "TR") return;
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        e.preventDefault();
        selectTable(container);
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            container.style.left = `${newX}px`;
            container.style.top = `${newY}px`;

            const tableData = tablesData.find(t => t.id === container.dataset.id);
            if (tableData) {
                tableData.left = newX - workspaceOffsetX;
                tableData.top = newY - workspaceOffsetY;
            }
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            saveTablesData();
        }
    });

    // Add input listener to save content on any edit inside table cells
    container.querySelectorAll('td[contenteditable]').forEach(td => {
        td.addEventListener('input', () => {
            const tableData = tablesData.find(t => t.id === container.dataset.id);
            if (!tableData) return;
            tableData.html = container.innerHTML;
            saveTablesData();
        });
    });

    document.body.appendChild(container);
}

// Save all tables to localStorage
function saveTablesData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tablesData));
}

document.getElementById("tableButton").addEventListener("click", () => {
    const cols = parseInt(prompt("Enter number of columns (X):"));
    const rows = parseInt(prompt("Enter number of rows (Y):"));

    if (isNaN(cols) || isNaN(rows) || cols <= 0 || rows <= 0) {
        alert("Please enter valid positive numbers.");
        return;
    }

    const container = document.createElement("div");
    container.classList.add("workspaceTable");
    container.dataset.id = `table-${tableIdCounter++}`;
    container.style.position = "absolute";
    container.style.left = `${window.innerWidth / 2}px`;
    container.style.top = `${window.innerHeight / 2}px`;
    container.style.zIndex = 1000;
    container.style.border = "2px solid transparent";
    container.style.background = "#fff";
    container.style.cursor = "move";
    container.style.padding = "10px";
    container.style.userSelect = "none";

    const logicalX = window.innerWidth / 2 - workspaceOffsetX;
    const logicalY = window.innerHeight / 2 - workspaceOffsetY;

    // Create table element
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.userSelect = "text";

    for (let y = 0; y < rows; y++) {
        const tr = document.createElement("tr");
        for (let x = 0; x < cols; x++) {
            const td = document.createElement("td");
            td.contentEditable = true;
            td.style.border = "1px solid #000";
            td.style.padding = "8px";
            td.style.minWidth = "50px";
            td.style.textAlign = "center";

            td.addEventListener("click", (e) => {
                e.stopPropagation();
                selectTable(container);
            });

            td.addEventListener('input', () => {
                const tableData = tablesData.find(t => t.id === container.dataset.id);
                if (!tableData) return;
                tableData.html = container.innerHTML;
                saveTablesData();
            });

            tr.appendChild(td);
        }
        tr.addEventListener("click", (e) => {
            e.stopPropagation();
            selectTable(container);
        });
        table.appendChild(tr);
    }

    table.addEventListener("click", (e) => {
        e.stopPropagation();
        selectTable(container);
    });

    container.appendChild(table);
    document.body.appendChild(container);

    // Add table data to tablesData array
    tablesData.push({
        id: container.dataset.id,
        left: logicalX,
        top: logicalY,
        html: container.innerHTML
    });
    saveTablesData();

    // Make draggable
    let isDragging = false, offsetX = 0, offsetY = 0;

    container.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "TD" || e.target.tagName === "TR") return;
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        e.preventDefault();
        selectTable(container);
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            container.style.left = `${newX}px`;
            container.style.top = `${newY}px`;

            const tableData = tablesData.find(t => t.id === container.dataset.id);
            if (tableData) {
                tableData.left = newX - workspaceOffsetX;
                tableData.top = newY - workspaceOffsetY;
                tableData.html = container.innerHTML;
            }
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            saveTablesData();
        }
    });
});

// Deselect table if clicking anywhere else
document.addEventListener("click", () => {
    if (selectedTable) {
        selectedTable.style.border = "2px solid transparent";
        selectedTable = null;
    }
});

// Select helper
function selectTable(container) {
    if (selectedTable && selectedTable !== container) {
        selectedTable.style.border = "2px solid transparent";
    }
    selectedTable = container;
    container.style.border = "2px solid red";
}

// Delete selected table when binButton clicked
document.getElementById("binButton").addEventListener("click", () => {
    if (selectedTable) {
        const id = selectedTable.dataset.id;
        selectedTable.remove();
        const index = tablesData.findIndex(t => t.id === id);
        if (index !== -1) tablesData.splice(index, 1);
        saveTablesData();
        selectedTable = null;
    }
});

// Update tables position on workspace drag
window.updateTablesPositionWithWorkspace = function(offsetX, offsetY) {
    document.querySelectorAll(".workspaceTable").forEach(table => {
        const id = table.dataset.id;
        const data = tablesData.find(t => t.id === id);
        if (!data) return;
        table.style.left = `${data.left + offsetX}px`;
        table.style.top = `${data.top + offsetY}px`;
    });
};

// Load tables on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    loadTables();
    if (typeof window.workspaceOffsetX === "number" &&
        typeof window.workspaceOffsetY === "number" &&
        typeof window.updateTablesPositionWithWorkspace === "function") {
        window.updateTablesPositionWithWorkspace(window.workspaceOffsetX, window.workspaceOffsetY);
    }
});
