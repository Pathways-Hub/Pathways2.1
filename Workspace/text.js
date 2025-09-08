(function () {
    let activeInput = null;
    const placedTexts = []; // store {el, baseX, baseY}
    let selectedWrapper = null;
    let resizing = false;
    let dragging = false;
    let startY = 0;
    let startFontSize = 24;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragBaseX = 0;
    let dragBaseY = 0;

    // Right-click drag of all texts
    let rightClickDragging = false;
    let rightClickStartX = 0;
    let rightClickStartY = 0;

    // Context menu
    const contextMenu = document.createElement('div');
    contextMenu.style.position = 'absolute';
    contextMenu.style.background = 'black';
    contextMenu.style.color = 'white';
    contextMenu.style.padding = '5px 0';
    contextMenu.style.borderRadius = '4px';
    contextMenu.style.display = 'none';
    contextMenu.style.zIndex = '2000';
    contextMenu.style.fontFamily = 'inherit';
    contextMenu.style.fontSize = '14px';
    contextMenu.style.minWidth = '100px';
    contextMenu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
    document.body.appendChild(contextMenu);

    let contextTarget = null;

    function addMenuItem(label, onClick) {
        const item = document.createElement('div');
        item.textContent = label;
        item.style.padding = '6px 12px';
        item.style.cursor = 'pointer';
        item.addEventListener('mouseenter', () => { item.style.background = '#333'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'black'; });
        item.addEventListener('click', () => {
            onClick();
            hideContextMenu();
        });
        contextMenu.appendChild(item);
    }

    function showContextMenu(x, y, targetEl) {
        contextTarget = targetEl;
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
        contextTarget = null;
    }

    function saveTexts() {
        const data = placedTexts.map(item => {
            const span = item.el.querySelector('span');
            return {
                text: span.textContent,
                baseX: item.baseX,
                baseY: item.baseY,
                fontSize: parseFloat(window.getComputedStyle(span).fontSize),
                bold: window.getComputedStyle(span).fontWeight === "700" || window.getComputedStyle(span).fontWeight === "bold"
            };
        });
        localStorage.setItem('placedTexts', JSON.stringify(data));
    }

    function loadTexts() {
        const data = JSON.parse(localStorage.getItem('placedTexts') || '[]');
        data.forEach(item => {
            placeText(item.text, item.baseX, item.baseY, item.fontSize, item.bold, false);
        });
    }

    addMenuItem('Delete', () => {
        if (!contextTarget) return;
        const idx = placedTexts.findIndex(t => t.el === contextTarget);
        if (idx !== -1) {
            contextTarget.remove();
            placedTexts.splice(idx, 1);
            saveTexts();
        }
    });

    addMenuItem('Duplicate', () => {
        if (!contextTarget) return;
        const item = placedTexts.find(t => t.el === contextTarget);
        if (item) {
            const span = contextTarget.querySelector('span');
            placeText(span.textContent, item.baseX + 20, item.baseY + 20, parseFloat(span.style.fontSize) || 24, span.style.fontWeight === "bold", true);
        }
    });

    addMenuItem('Copy', () => {
        if (!contextTarget) return;
        const span = contextTarget.querySelector('span');
        navigator.clipboard.writeText(span.textContent).catch(console.error);
    });

    document.addEventListener('mousedown', (e) => {
        if (!contextMenu.contains(e.target)) hideContextMenu();
    });

    function placeText(text, pageX, pageY, fontSize = 24, bold = false, save = true) {
        if (!text.trim()) return;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.fontSize = fontSize + 'px';
        wrapper.style.fontFamily = 'inherit';
        wrapper.style.color = 'black';
        wrapper.style.pointerEvents = 'auto';
        wrapper.style.userSelect = 'text';
        wrapper.style.padding = '4px 6px';
        wrapper.style.minWidth = '20px';
        wrapper.style.minHeight = '24px';
        wrapper.style.whiteSpace = 'nowrap';

        const span = document.createElement('span');
        span.textContent = text;
        span.style.fontSize = fontSize + 'px';
        if (bold) span.style.fontWeight = 'bold';
        span.style.userSelect = 'text';

        wrapper.appendChild(span);

        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            highlightText(wrapper);
            enableEditing(wrapper, span);
        });

        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e.pageX, e.pageY, wrapper);
        });

        wrapper.addEventListener('mousedown', (e) => {
            // Only left click drag
            if (e.button !== 0) return;

            // Prevent text selection while dragging
            e.preventDefault();

            // Select this text
            highlightText(wrapper);

            dragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            const item = placedTexts.find(t => t.el === wrapper);
            dragBaseX = item.baseX;
            dragBaseY = item.baseY;
        });

        document.body.appendChild(wrapper);

        const baseX = pageX;
        const baseY = pageY;
        placedTexts.push({ el: wrapper, baseX, baseY });
        updateTextPosition(wrapper, baseX, baseY);

        if (save) saveTexts();
    }

    function updateTextPosition(el, baseX, baseY) {
        el.style.left = `${baseX}px`;
        el.style.top = `${baseY}px`;
    }

    function updateAllTextPositions() {
        for (const t of placedTexts) {
            updateTextPosition(t.el, t.baseX, t.baseY);
        }
    }

    function highlightText(wrapper) {
        if (selectedWrapper && selectedWrapper !== wrapper) {
            deselectWrapper();
        }
        selectedWrapper = wrapper;
        wrapper.classList.add('selected-text-box');
    }

    function deselectWrapper() {
        if (selectedWrapper) {
            disableEditing(selectedWrapper);
            selectedWrapper.classList.remove('selected-text-box');
            selectedWrapper = null;
        }
    }

    function enableEditing(wrapper, span) {
        span.contentEditable = 'true';
        span.style.userSelect = 'text';
        span.focus();
        document.execCommand('selectAll', false, null);
        document.getSelection().collapseToEnd();

        function finishEditing(e) {
            if (e.type === 'keydown' && e.key !== 'Enter') return;
            if (e.type === 'keydown') e.preventDefault();
            span.contentEditable = 'false';
            span.style.userSelect = 'none';
            saveTexts();
            span.removeEventListener('blur', finishEditing);
            span.removeEventListener('keydown', finishEditing);
        }

        span.addEventListener('blur', finishEditing);
        span.addEventListener('keydown', finishEditing);
    }

    function disableEditing(wrapper) {
        const span = wrapper.querySelector('span');
        if (!span) return;
        span.contentEditable = 'false';
        span.style.userSelect = 'none';
    }

    document.addEventListener('mousedown', (e) => {
        if (e.button === 2) {
            if (activeInput) {
                activeInput.remove();
                activeInput = null;
            }
            rightClickDragging = true;
            rightClickStartX = e.clientX;
            rightClickStartY = e.clientY;
            document.body.style.cursor = 'grabbing';
            e.preventDefault();
            return;
        }

        // === Prevent creating a new text box when clicking React UI elements ===
        if (e.target.closest('.react-button, .react-panel, #emoji-panel, #emoji-circle')) {
            return; // skip text creation
        }

        if (activeInput) return;
        if (e.button === 0) {
            for (const { el } of placedTexts) {
                if (el.contains(e.target)) return;
            }
            deselectWrapper();
            createFloatingInput(e.pageX, e.pageY);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (resizing && selectedWrapper) {
            const span = selectedWrapper.querySelector('span');
            const delta = e.clientY - startY;
            let newSize = startFontSize + delta;
            newSize = Math.max(12, Math.min(100, newSize));
            span.style.fontSize = `${newSize}px`;
            saveTexts();
        }
        if (dragging && selectedWrapper) {
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            const newBaseX = dragBaseX + dx;
            const newBaseY = dragBaseY + dy;
            const item = placedTexts.find(t => t.el === selectedWrapper);
            item.baseX = newBaseX;
            item.baseY = newBaseY;
            updateTextPosition(selectedWrapper, newBaseX, newBaseY);
            saveTexts();
        }
        if (rightClickDragging) {
            const dx = e.clientX - rightClickStartX;
            const dy = e.clientY - rightClickStartY;
            for (const item of placedTexts) {
                item.baseX += dx;
                item.baseY += dy;
                updateTextPosition(item.el, item.baseX, item.baseY);
            }
            saveTexts();
            rightClickStartX = e.clientX;
            rightClickStartY = e.clientY;
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (resizing || dragging) {
            resizing = false;
            dragging = false;
            document.body.style.cursor = 'default';
        }
        if (rightClickDragging && e.button === 2) {
            rightClickDragging = false;
            document.body.style.cursor = 'default';
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (!placedTexts.some(t => t.el.contains(e.target))) {
            hideContextMenu();
            return;
        }
    });

    function createFloatingInput(x, y) {
        if (activeInput) {
            activeInput.remove();
            activeInput = null;
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;
        input.style.fontSize = '24px';
        input.style.border = 'none';
        input.style.padding = '0';
        input.style.margin = '0';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        input.style.color = 'black';
        input.style.zIndex = 1000;
        input.style.fontFamily = 'inherit';
        document.body.appendChild(input);
        activeInput = input;
        requestAnimationFrame(() => input.focus());
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                placeText(input.value, x, y, 24, false, true);
                input.remove();
                activeInput = null;
            } else if (e.key === 'Escape') {
                input.remove();
                activeInput = null;
            }
        });
        const cancelOnClick = (e) => {
            if (e.target !== input) {
                input.remove();
                activeInput = null;
                document.removeEventListener('mousedown', cancelOnClick);
            }
        };
        setTimeout(() => {
            document.addEventListener('mousedown', cancelOnClick);
        }, 0);
    }

    window.updateTextsWithWorkspace = updateAllTextPositions;

    const style = document.createElement('style');
    style.textContent = `
        .selected-text-box {
            outline: 2px dotted grey;
            position: relative;
        }
        .selected-text-box span { user-select: text; outline: none; }
        .corner-icon {
            position: absolute; top: -8px; left: -8px; width: 16px; height: 16px;
            background: blue; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 10px; z-index: 1001; pointer-events: auto;
            cursor: ns-resize;
        }
        .corner-icon i { font-size: 8px; }
        .drag-icon {
            position: absolute; bottom: -8px; left: -8px; width: 16px; height: 16px;
            background: blue; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 10px; z-index: 1001; pointer-events: auto;
            cursor: move;
        }
        .drag-icon i { font-size: 8px; }
    `;
    document.head.appendChild(style);

    // Load from localStorage on start
    loadTexts();
})();
