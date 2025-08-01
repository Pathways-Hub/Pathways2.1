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
    }

    .note-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 16px;
        outline: none;
        cursor: text;
    }

    .note-content {
        font-size: 14px;
        height: calc(100% - 40px);
        outline: none;
        overflow-y: auto;
        cursor: text;
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

    // Set up click handler
    const button = document.getElementById("stickynote");
    if (button) {
        button.addEventListener("click", createStickyNote);
    } else {
        console.warn("Button with ID #stickynote not found.");
    }

    function createStickyNote() {
        const note = document.createElement("div");
        note.className = "sticky-note";
        note.innerHTML = `
            <div class="note-title" contenteditable="true">Title</div>
            <div class="note-content" contenteditable="true">Write something...</div>
        `;

        const pastelColors = [
            "#fddde6", "#ddf5f1", "#fdf1cd", "#e6ddfd", "#dfffcf", "#ffe1e1", "#d3f7ff"
        ];
        const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
        note.style.backgroundColor = randomColor;

        note.style.top = "50%";
        note.style.left = "50%";
        note.style.transform = "translate(-50%, -50%)";

        document.body.appendChild(note);
        makeDraggable(note);
    }

    function makeDraggable(el) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        el.addEventListener("mousedown", function (e) {
            if (e.button !== 0) return; // only left click
            isDragging = true;

            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            el.style.cursor = "grabbing";
            el.style.transform = ""; // Remove center translation
            e.preventDefault();
        });

        document.addEventListener("mousemove", function (e) {
            if (!isDragging) return;
            el.style.left = `${e.clientX - offsetX}px`;
            el.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener("mouseup", function () {
            isDragging = false;
            el.style.cursor = "grab";
        });
    }
});
