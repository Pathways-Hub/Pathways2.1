document.addEventListener("DOMContentLoaded", function () {
    // Inject styles
    const style = document.createElement("style");
    style.textContent = `
    .sticky-note {
        width: 200px;
        height: 200px;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
        padding: 10px;
        font-family: sans-serif;
        border: 1px solid #ccc;
        box-sizing: border-box;
        position: fixed;
        overflow: hidden;
        cursor: grab;
        background-color: white;
        display: flex;
        flex-direction: column;
    }

    .note-wrapper {
        position: absolute;
        display: inline-block;
    }

    .note-controls {
        position: absolute;
        top: -28px;
        left: 0;
        display: none;
        align-items: center;
        gap: 6px;
    }

    .note-wrapper.active .note-controls {
        display: flex;
    }

    .note-wrapper.active .sticky-note {
        outline: 2px dotted #555;
    }

    .color-picker {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        cursor: pointer;
        border: 1px solid #333;
    }

    .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #333;
    }

    .note-title, .note-content {
        outline: none;
        cursor: text;
        position: relative;
    }

    .note-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 16px;
        min-height: 20px;
    }

    .note-content {
        font-size: 14px;
        height: calc(100% - 40px);
        overflow-y: auto;
        line-height: 1.4;
        flex-grow: 1;
    }

    [contenteditable][data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: #aaa;
        pointer-events: none;
        position: absolute;
        left: 0;
        top: 0;
        user-select: none;
    }

    .sticky-note::after {
        content: "";
        position: absolute;
        bottom: 0;
        right: 0;
        width: 30px;
        height: 30px;
        background: white;
        box-shadow: -2px -2px 4px rgba(0,0,0,0.1);
        transform: rotate(45deg);
        transform-origin: bottom right;
        border-bottom: 1px solid #ccc;
        border-right: 1px solid #ccc;
        pointer-events: none;
    }
    `;
    document.head.appendChild(style);

    const button = document.getElementById("stickynote");
    if (button) {
        button.addEventListener("click", createStickyNote);
    } else {
        console.warn("Button with ID #stickynote not found.");
    }

    const pastelColors = [
        "#fddde6", "#ddf5f1", "#fdf1cd", "#e6ddfd", "#dfffcf", "#ffe1e1", "#d3f7ff"
    ];

    // Load saved notes
    loadNotes();

    function getNotes() {
        return JSON.parse(localStorage.getItem("stickyNotes") || "[]");
    }

    function saveNotes(notes) {
        localStorage.setItem("stickyNotes", JSON.stringify(notes));
    }

    function createStickyNote(data = null) {
        const wrapper = document.createElement("div");
        wrapper.className = "note-wrapper";
        wrapper.dataset.id = data?.id || Date.now();

        wrapper.innerHTML = `
            <div class="note-controls">
                <div class="color-picker"></div>
                <button class="delete-btn">✕</button>
            </div>
            <div class="sticky-note">
                <div class="note-title" contenteditable="true" data-placeholder="Title"></div>
                <div class="note-content" contenteditable="true" data-placeholder="Write something..."></div>
            </div>
        `;

        const note = wrapper.querySelector(".sticky-note");
        let colorIndex;

        if (data?.colorIndex !== undefined) {
            colorIndex = data.colorIndex;
        } else {
            colorIndex = Math.floor(Math.random() * pastelColors.length);
        }

        note.style.backgroundColor = pastelColors[colorIndex];
        wrapper.querySelector(".color-picker").style.backgroundColor = pastelColors[colorIndex];
        wrapper.dataset.colorIndex = colorIndex;

        wrapper.style.top = data?.top || "50%";
        wrapper.style.left = data?.left || "50%";
        wrapper.style.transform = data ? "" : "translate(-50%, -50%)";

        document.body.appendChild(wrapper);

        // Restore text
        if (data) {
            wrapper.querySelector(".note-title").textContent = data.title || "";
            wrapper.querySelector(".note-content").textContent = data.content || "";
        }

        // Add listeners
        makeDraggable(wrapper);

        wrapper.querySelector(".note-title").addEventListener("input", () => updateNote(wrapper));
        wrapper.querySelector(".note-content").addEventListener("input", () => updateNote(wrapper));

        // Select note on click
        wrapper.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            document.querySelectorAll(".note-wrapper").forEach(n => n.classList.remove("active"));
            wrapper.classList.add("active");
        });

        // Color change
        wrapper.querySelector(".color-picker").addEventListener("click", (e) => {
            e.stopPropagation(); // prevent deselect
            let idx = parseInt(wrapper.dataset.colorIndex, 10);
            idx = (idx + 1) % pastelColors.length;
            wrapper.dataset.colorIndex = idx;

            note.style.backgroundColor = pastelColors[idx];
            wrapper.querySelector(".color-picker").style.backgroundColor = pastelColors[idx];
            updateNote(wrapper);
        });

        // Delete
        wrapper.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // prevent deselect
            const notes = getNotes().filter(n => n.id != wrapper.dataset.id);
            saveNotes(notes);
            wrapper.remove();
        });

        if (!data) {
            updateNote(wrapper); // save newly created note
        }
    }

    function updateNote(wrapper) {
        const note = wrapper.querySelector(".sticky-note");
        const notes = getNotes();
        const idx = notes.findIndex(n => n.id == wrapper.dataset.id);
        const data = {
            id: wrapper.dataset.id,
            title: wrapper.querySelector(".note-title").textContent,
            content: wrapper.querySelector(".note-content").textContent,
            color: note.style.backgroundColor,
            colorIndex: parseInt(wrapper.dataset.colorIndex, 10),
            top: wrapper.style.top,
            left: wrapper.style.left
        };
        if (idx > -1) {
            notes[idx] = data;
        } else {
            notes.push(data);
        }
        saveNotes(notes);
    }

    function loadNotes() {
        const notes = getNotes();
        notes.forEach(noteData => createStickyNote(noteData));
    }

    function makeDraggable(wrapper) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        wrapper.addEventListener("mousedown", function (e) {
            if (e.target.closest(".note-title") || e.target.closest(".note-content") || e.target.closest(".note-controls")) return;
            if (e.button !== 0) return;

            isDragging = true;
            const rect = wrapper.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            wrapper.style.cursor = "grabbing";
            wrapper.style.transform = "";
            e.preventDefault();
        });

        document.addEventListener("mousemove", function (e) {
            if (!isDragging) return;
            wrapper.style.left = `${e.clientX - offsetX}px`;
            wrapper.style.top = `${e.clientY - offsetY}px`;
            updateNote(wrapper);
        });

        document.addEventListener("mouseup", function () {
            isDragging = false;
            wrapper.style.cursor = "grab";
        });
    }

    // === Right-click drag to move all notes ===
    let rightClickDragging = false;
    let lastX = 0;
    let lastY = 0;

    document.addEventListener("mousedown", function (e) {
        if (e.button === 2) {
            rightClickDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            e.preventDefault();
        }
    });

    document.addEventListener("mousemove", function (e) {
        if (!rightClickDragging) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        document.querySelectorAll(".note-wrapper").forEach(wrapper => {
            const rect = wrapper.getBoundingClientRect();
            const newLeft = rect.left + dx;
            const newTop = rect.top + dy;
            wrapper.style.left = `${newLeft}px`;
            wrapper.style.top = `${newTop}px`;
            updateNote(wrapper);
        });

        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener("mouseup", function (e) {
        if (e.button === 2) {
            rightClickDragging = false;
        }
    });

    document.addEventListener("contextmenu", function (e) {
        if (rightClickDragging) {
            e.preventDefault();
        }
    });

    // === Deselect notes when clicking outside ===
    document.addEventListener("mousedown", function (e) {
        if (!e.target.closest(".note-wrapper")) {
            document.querySelectorAll(".note-wrapper").forEach(n => n.classList.remove("active"));
        }
    });
});
