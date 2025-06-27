document.addEventListener('DOMContentLoaded', () => {
    let currentlySelected = null;

    // Add global styles for selected state and resize handles with hover effect
    const style = document.createElement('style');
    style.textContent = `
        .selected {
            border: 2px solid red;
            border-radius: 20px;
            box-sizing: border-box;
        }

        .resize-handle {
            width: 10px;
            height: 10px;
            background-color: blue;
            border-radius: 50%;
            position: absolute;
            z-index: 1003;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        /* Show handles only on hover over the image wrapper */
        div.image-wrapper:hover .resize-handle {
            opacity: 1;
            pointer-events: auto;
        }

        .resize-handle.tl { top: -5px; left: -5px; cursor: nwse-resize; }
        .resize-handle.tr { top: -5px; right: -5px; cursor: nesw-resize; }
        .resize-handle.bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
        .resize-handle.br { bottom: -5px; right: -5px; cursor: nwse-resize; }
    `;
    document.head.appendChild(style);

    // On button click, ask for image URL and create image element
    document.getElementById('photoImportButton').addEventListener('click', () => {
        const url = prompt("Please enter the image URL:");
        if (url) {
            createImageElement(url);
        }
    });

    function createImageElement(src) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-wrapper'); // for hover effect
        wrapper.style.position = 'absolute';
        wrapper.style.left = '50px';
        wrapper.style.top = '100px';
        wrapper.style.zIndex = '1001';
        wrapper.style.display = 'inline-block';

        const img = new Image();
        img.src = src;
        img.style.borderRadius = '20px';
        img.style.cursor = 'move';
        img.style.display = 'block';
        img.style.width = '200px';
        img.style.height = 'auto';

        img.onload = () => {
            wrapper.appendChild(img);
            document.body.appendChild(wrapper);
            makeImageDraggable(wrapper);
            makeImageSelectable(wrapper, img);
            addResizeHandles(wrapper, img);
        };

        img.onerror = () => {
            alert("Failed to load image from the provided URL.");
        };
    }

    function makeImageDraggable(wrapper) {
        let isDragging = false, startX, startY, initialX, initialY;

        wrapper.addEventListener('mousedown', e => {
            if (e.target.classList.contains('resize-handle')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt(wrapper.style.left);
            initialY = parseInt(wrapper.style.top);

            if (currentlySelected !== wrapper) {
                deselectCurrentlySelected();
                currentlySelected = wrapper;
                wrapper.classList.add('selected');
                disableTextEditing(true);
            }
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                wrapper.style.left = `${initialX + dx}px`;
                wrapper.style.top = `${initialY + dy}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    function makeImageSelectable(wrapper, img) {
        wrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('resize-handle')) return;
            e.stopPropagation();
            if (currentlySelected !== wrapper) {
                deselectCurrentlySelected();
                currentlySelected = wrapper;
                wrapper.classList.add('selected');
                disableTextEditing(true);
            }
        });
    }

    function addResizeHandles(wrapper, img) {
        ['tl', 'tr', 'bl', 'br'].forEach(corner => {
            const handle = document.createElement('div');
            handle.classList.add('resize-handle', corner);
            wrapper.appendChild(handle);

            let startX, startY, startWidth, startHeight, startLeft, startTop, aspectRatio;

            handle.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();

                startX = e.clientX;
                startY = e.clientY;
                startWidth = img.offsetWidth;
                startHeight = img.offsetHeight;
                aspectRatio = startWidth / startHeight;
                startLeft = parseInt(wrapper.style.left);
                startTop = parseInt(wrapper.style.top);

                const move = (ev) => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    let newLeft = startLeft;
                    let newTop = startTop;
                    const shiftHeld = ev.shiftKey;

                    if (corner === 'br') {
                        if (shiftHeld) {
                            newWidth = startWidth + dx;
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newWidth = startWidth + dx;
                            newHeight = startHeight + dy;
                        }
                    } else if (corner === 'bl') {
                        if (shiftHeld) {
                            newWidth = startWidth - dx;
                            newHeight = newWidth / aspectRatio;
                            newLeft = startLeft + dx;
                        } else {
                            newWidth = startWidth - dx;
                            newHeight = startHeight + dy;
                            newLeft = startLeft + dx;
                        }
                    } else if (corner === 'tl') {
                        if (shiftHeld) {
                            newWidth = startWidth - dx;
                            newHeight = newWidth / aspectRatio;
                            newLeft = startLeft + dx;
                            newTop = startTop + (startHeight - newHeight);
                        } else {
                            newWidth = startWidth - dx;
                            newHeight = startHeight - dy;
                            newLeft = startLeft + dx;
                            newTop = startTop + dy;
                        }
                    } else if (corner === 'tr') {
                        if (shiftHeld) {
                            newWidth = startWidth + dx;
                            newHeight = newWidth / aspectRatio;
                            newTop = startTop + (startHeight - newHeight);
                        } else {
                            newWidth = startWidth + dx;
                            newHeight = startHeight - dy;
                            newTop = startTop + dy;
                        }
                    }

                    if (newWidth > 20 && newHeight > 20) {
                        img.style.width = `${newWidth}px`;
                        img.style.height = `${newHeight}px`;
                        wrapper.style.left = `${newLeft}px`;
                        wrapper.style.top = `${newTop}px`;
                    }
                };

                const stop = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', stop);
                };

                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', stop);
            });
        });
    }

    function deselectCurrentlySelected() {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
            currentlySelected = null;
            disableTextEditing(false);
        }
    }

    function disableTextEditing(disable) {
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.contentEditable = !disable;
        });
        document.querySelectorAll('.text-preview, .input-area').forEach(el => {
            el.style.pointerEvents = disable ? 'none' : 'auto';
        });
    }

    document.addEventListener('click', (e) => {
        if (currentlySelected && !currentlySelected.contains(e.target)) {
            deselectCurrentlySelected();
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.isContentEditable) {
            deselectCurrentlySelected();
        }
    });

    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove();
            currentlySelected = null;
        }
    });
});
