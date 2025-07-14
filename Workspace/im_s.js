const PIXABAY_API_KEY = '38305857-d24aef6a6a7aee0006f910a64';

let currentPage = 1;
let currentQuery = '';
let isLoading = false;
let selectedImageWrapper = null; // Track selected image

// Sidebar
const sidebar = document.createElement('div');
sidebar.id = 'image_sidebar';
Object.assign(sidebar.style, {
    position: 'fixed',
    top: '0',
    right: '-50%',
    width: '50%',
    height: '100%',
    backgroundColor: '#fff',
    borderLeft: '2px solid #000',
    zIndex: '100001',
    transition: 'right 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
});

const overlay = document.createElement('div');
overlay.id = 'image_sidebar_overlay';
Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: '100000',
    display: 'none',
});

const searchBar = document.createElement('input');
searchBar.type = 'text';
searchBar.placeholder = 'Search images...';
Object.assign(searchBar.style, {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
    width: '100%',
    marginBottom: '20px',
});

const imageResults = document.createElement('div');
Object.assign(imageResults.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
});

sidebar.appendChild(searchBar);
sidebar.appendChild(imageResults);
document.body.appendChild(overlay);
document.body.appendChild(sidebar);

function preventAllClicks(el) {
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach(event => {
        el.addEventListener(event, e => e.stopPropagation());
    });
}
preventAllClicks(sidebar);
preventAllClicks(searchBar);
preventAllClicks(imageResults);

function openSidebar() {
    sidebar.style.right = '0';
    overlay.style.display = 'block';
    currentPage = 1;
    currentQuery = '';
    imageResults.innerHTML = '';
    fetchRandomImages();
}

function closeSidebar() {
    sidebar.style.right = '-50%';
    overlay.style.display = 'none';
}

overlay.addEventListener('click', closeSidebar);
preventAllClicks(overlay);

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('image_s');
    if (btn) {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            openSidebar();
        });
    }
    loadAllImages(); // load images on page load
});

async function fetchImages(query, append = false) {
    if (isLoading) return;
    isLoading = true;

    if (!append) imageResults.innerHTML = 'Loading...';

    try {
        const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=15&page=${currentPage}&safesearch=true`);
        const data = await res.json();

        if (data.hits && data.hits.length > 0) {
            displayImages(data.hits, append);
        } else if (!append) {
            imageResults.innerHTML = 'No images found.';
        }
    } catch {
        if (!append) imageResults.innerHTML = 'Error loading images.';
    } finally {
        isLoading = false;
    }
}

function displayImages(images, append = false) {
    if (!append) imageResults.innerHTML = '';
    images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img.largeImageURL || img.previewURL;
        imgEl.alt = img.tags;
        Object.assign(imgEl.style, {
            width: '100%',
            height: '250px',
            objectFit: 'cover',
            borderRadius: '4px',
            display: 'block',
            cursor: 'pointer'
        });
        imgEl.addEventListener('click', () => {
            insertImageToCanvas(imgEl.src);
            closeSidebar();
        });
        imageResults.appendChild(imgEl);
    });
}

function fetchRandomImages() {
    const terms = ['nature', 'technology', 'people', 'city', 'animals', 'food', 'abstract'];
    const random = terms[Math.floor(Math.random() * terms.length)];
    currentQuery = random;
    fetchImages(currentQuery);
}

sidebar.addEventListener('scroll', () => {
    if (sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight - 100) {
        currentPage++;
        fetchImages(currentQuery || 'nature', true);
    }
});

let searchTimeout;
searchBar.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchBar.value.trim();
    currentPage = 1;
    currentQuery = query;
    searchTimeout = setTimeout(() => {
        imageResults.innerHTML = '';
        if (query === '') {
            fetchRandomImages();
        } else {
            fetchImages(query);
        }
    }, 300);
});

function insertImageToCanvas(src, left = '25%', top = '20%', width = '400px', height = 'auto') {
    const id = 'img_' + Date.now();
    const wrapper = document.createElement('div');
    wrapper.classList.add('image-wrapper');
    wrapper.style.position = 'absolute';
    wrapper.style.left = left;
    wrapper.style.top = top;
    wrapper.style.zIndex = '1001';
    wrapper.dataset.imageId = id;

    const img = new Image();
    img.src = src;
    img.style.borderRadius = '20px';
    img.style.cursor = 'move';
    img.style.display = 'block';
    img.style.width = width;
    img.style.height = height;

    img.onload = () => {
        wrapper.appendChild(img);
        document.body.appendChild(wrapper);
        makeImageDraggable(wrapper);
        makeImageSelectable(wrapper);
        addResizeHandles(wrapper, img);
        saveAllImages();
    };

    img.onerror = () => {
        alert("Failed to load image.");
    };
}

function selectImageWrapper(wrapper) {
    if (selectedImageWrapper && selectedImageWrapper !== wrapper) {
        selectedImageWrapper.style.border = 'none';
    }
    selectedImageWrapper = wrapper;
    wrapper.style.border = '2px solid red';
}

function makeImageDraggable(wrapper) {
    let isDragging = false, startX, startY, offsetX, offsetY;

    const onMouseDown = e => {
        if (e.target.classList.contains('resize-handle')) return;

        e.preventDefault();
        isDragging = true;

        selectImageWrapper(wrapper);

        const rect = wrapper.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        offsetX = startX - rect.left;
        offsetY = startY - rect.top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = e => {
        if (!isDragging) return;
        const newLeft = e.clientX - offsetX;
        const newTop = e.clientY - offsetY;
        wrapper.style.left = `${newLeft}px`;
        wrapper.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveAllImages();
    };

    wrapper.addEventListener('mousedown', onMouseDown);
}

function makeImageSelectable(wrapper) {
    wrapper.addEventListener('mousedown', e => {
        if (e.target.classList.contains('resize-handle')) return;
        e.stopPropagation();
        selectImageWrapper(wrapper);
    });
}

document.addEventListener('click', (e) => {
    const clickedInsideWrapper = e.target.closest('.image-wrapper');
    if (!clickedInsideWrapper && selectedImageWrapper) {
        selectedImageWrapper.style.border = 'none';
        selectedImageWrapper = null;
    }
});

document.getElementById('binButton')?.addEventListener('click', () => {
    if (selectedImageWrapper) {
        selectedImageWrapper.remove();
        selectedImageWrapper = null;
        saveAllImages();
    }
});

function addResizeHandles(wrapper, img) {
    ['tl', 'tr', 'bl', 'br'].forEach(corner => {
        const handle = document.createElement('div');
        handle.classList.add('resize-handle', corner);
        Object.assign(handle.style, {
            width: '10px',
            height: '10px',
            backgroundColor: 'blue',
            borderRadius: '50%',
            position: 'absolute',
            zIndex: '1003'
        });
        wrapper.appendChild(handle);

        const positions = {
            tl: { top: '-5px', left: '-5px', cursor: 'nwse-resize' },
            tr: { top: '-5px', right: '-5px', cursor: 'nesw-resize' },
            bl: { bottom: '-5px', left: '-5px', cursor: 'nesw-resize' },
            br: { bottom: '-5px', right: '-5px', cursor: 'nwse-resize' }
        };
        Object.assign(handle.style, positions[corner]);

        let startX, startY, startWidth, startHeight, startLeft, startTop;

        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            selectImageWrapper(wrapper);

            const aspectRatio = img.offsetWidth / img.offsetHeight;

            startX = e.clientX;
            startY = e.clientY;
            startWidth = img.offsetWidth;
            startHeight = img.offsetHeight;
            startLeft = parseInt(wrapper.style.left);
            startTop = parseInt(wrapper.style.top);

            const move = ev => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                let shiftKey = ev.shiftKey;

                if (corner === 'br') {
                    if (shiftKey) {
                        newWidth = startWidth + dx;
                        newHeight = newWidth / aspectRatio;
                    } else {
                        newWidth = startWidth + dx;
                        newHeight = startHeight + dy;
                    }
                } else if (corner === 'bl') {
                    if (shiftKey) {
                        newWidth = startWidth - dx;
                        newHeight = newWidth / aspectRatio;
                        newLeft = startLeft + dx;
                    } else {
                        newWidth = startWidth - dx;
                        newHeight = startHeight + dy;
                        newLeft = startLeft + dx;
                    }
                } else if (corner === 'tl') {
                    if (shiftKey) {
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
                    if (shiftKey) {
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
                saveAllImages();
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        });
    });
}

// Save all images' data to localStorage
function saveAllImages() {
    const wrappers = document.querySelectorAll('.image-wrapper');
    const imageStates = [];

    wrappers.forEach(wrapper => {
        const img = wrapper.querySelector('img');
        if (!img) return;

        imageStates.push({
            src: img.src,
            left: wrapper.style.left,
            top: wrapper.style.top,
            width: img.style.width,
            height: img.style.height
        });
    });

    localStorage.setItem('canvasImages', JSON.stringify(imageStates));
}

// Load images from localStorage and restore state
function loadAllImages() {
    const saved = localStorage.getItem('canvasImages');
    if (!saved) return;

    const images = JSON.parse(saved);
    images.forEach(data => {
        insertImageToCanvas(data.src, data.left, data.top, data.width, data.height);
    });
}
