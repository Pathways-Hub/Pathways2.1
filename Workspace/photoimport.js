document.addEventListener('DOMContentLoaded', () => {
    let currentlySelected = null;
    const STORAGE_KEY = 'savedImages';

    // Add global styles
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

    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    document.getElementById('photoButton').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            createImageElement(e.target.result);
            saveAllImages();
        };
        reader.readAsDataURL(file);
    });

    // Create and initialize image element wrapper
    function createImageElement(src, left = '50px', top = '100px', width = '200px', height = 'auto') {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-wrapper');
        wrapper.style.position = 'absolute';
        wrapper.style.left = left;
        wrapper.style.top = top;
        wrapper.style.zIndex = '1001';
        wrapper.style.display = 'inline-block';

        const img = new Image();
        img.src = src;
        img.style.borderRadius = '20px';
        img.style.cursor = 'move';
        img.style.display = 'block';
        img.style.width = width;
        img.style.height = height;

        wrapper.appendChild(img);
        document.body.appendChild(wrapper);

        initializeImageWrapper(wrapper, img);
    }

    function initializeImageWrapper(wrapper, img) {
        if (wrapper.dataset.initialized === 'true') return;

        makeImageDraggable(wrapper);
        makeImageSelectable(wrapper, img);
        addResizeHandles(wrapper, img);

        wrapper.dataset.initialized = 'true';
    }

    // Drag logic
    function makeImageDraggable(wrapper) {
        let isDragging = false, startX, startY, initialX, initialY;

        wrapper.addEventListener('mousedown', e => {
            if (e.target.classList.contains('resize-handle')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = parseInt(wrapper.style.left) || 0;
            initialY = parseInt(wrapper.style.top) || 0;

            if (currentlySelected !== wrapper) {
                deselectCurrentlySelected();
                currentlySelected = wrapper;
                wrapper.classList.add('selected');
                disableTextEditing(true);
            }

            e.preventDefault();  // Prevent text selection on drag
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                wrapper.style.left = `${initialX + dx}px`;
                wrapper.style.top = `${initialY + dy}px`;
                saveAllImages();
            }
        });

        function stopDragging() {
            isDragging = false;
        }

        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('mouseleave', stopDragging);  // catch if mouse leaves window
    }

    // Select image on click
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

    // Add resize handles and resize logic
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
                startLeft = parseInt(wrapper.style.left) || 0;
                startTop = parseInt(wrapper.style.top) || 0;

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
                        saveAllImages();
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

    // Deselect current image
    function deselectCurrentlySelected() {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
            currentlySelected = null;
            disableTextEditing(false);
        }
    }

    // Disable contenteditable when image selected
    function disableTextEditing(disable) {
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.contentEditable = !disable;
        });
        document.querySelectorAll('.text-preview, .input-area').forEach(el => {
            el.style.pointerEvents = disable ? 'none' : 'auto';
        });
    }

    // Deselect on click outside
    document.addEventListener('click', (e) => {
        if (currentlySelected && !currentlySelected.contains(e.target)) {
            deselectCurrentlySelected();
        }
    });

    // Deselect on contenteditable input
    document.addEventListener('input', (e) => {
        if (e.target.isContentEditable) {
            deselectCurrentlySelected();
        }
    });

    // Delete selected image
    document.getElementById('binButton').addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove();
            currentlySelected = null;
            saveAllImages();
        }
    });

    // Save all image data to localStorage
    function saveAllImages() {
        const data = Array.from(document.querySelectorAll('.image-wrapper')).map(wrapper => {
            const img = wrapper.querySelector('img');
            return {
                src: img.src,
                left: wrapper.style.left,
                top: wrapper.style.top,
                width: img.style.width,
                height: img.style.height
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Load images from localStorage
    function loadSavedImages() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const imageData = JSON.parse(saved);
        imageData.forEach(data => {
            createImageElement(data.src, data.left, data.top, data.width, data.height);
        });
    }

    loadSavedImages();
});
