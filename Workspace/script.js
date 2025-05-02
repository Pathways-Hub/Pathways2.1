let isGridVisible = false;
let isHeaderHidden = false;
let headerLocked = false;
let iconButton = null;
let movingTextElement = null;
let currentButtonContainer = null;
let textarea = null; // Declare textarea globally for later reference
let currentTextElement = null; // Track the current text element for editing

const HEADER_HEIGHT = 50; // Adjust if your header is taller or shorter

function toggleGrid() {
    isGridVisible = !isGridVisible;
    const gridToggleButton = document.getElementById('gridToggleButton');
    if (isGridVisible) {
        document.body.style.backgroundImage = 
            'radial-gradient(black 1px, transparent 1px), radial-gradient(black 1px, transparent 1px)';
        gridToggleButton.innerHTML = '<i class="fas fa-th"></i>';
    } else {
        document.body.style.backgroundImage = 'none';
        gridToggleButton.innerHTML = '<i class="fa-regular fa-rectangle-xmark"></i>';
    }
}

function snapToGrid(x, y) {
    const gridSize = 10;
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
}

function removeButtonContainer() {
    if (currentButtonContainer) {
        currentButtonContainer.remove();
        currentButtonContainer = null;
    }
}

function createBlueIconButtons(x, y) {
    removeButtonContainer();

    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'blue-icon-buttons-container';
    buttonContainer.style.left = (x - 40) + 'px';
    buttonContainer.style.top = (y) + 'px';

    // HIDE the entire container (but still add it to DOM)
    buttonContainer.style.display = 'none';

    const buttonIcons = [
        'fas fa-bold',         // Button 1: Bold
        'fas fa-italic',       // Button 2: Italics
        'fas fa-list-ul',      // Button 3: Bullet
        'fas fa-underline'     // Button 4: Underline
    ];

    for (let i = 0; i < 4; i++) {
        let button = document.createElement('button');
        button.className = 'blue-icon-button';
        button.innerHTML = `<i class="${buttonIcons[i]}"></i>`;
        button.style.display = 'none'; // ← Hide individual buttons too
        button.addEventListener('mousedown', (e) => e.stopPropagation());
        buttonContainer.appendChild(button);

        const createTextarea = (styleCallback) => {
            if (textarea) textarea.remove();

            let position = {
                x: parseInt(buttonContainer.style.left) + 40, 
                y: parseInt(buttonContainer.style.top) + 20
            };

            textarea = document.createElement('textarea');
            textarea.className = 'input-area';
            textarea.style.left = position.x + 'px';
            textarea.style.top = position.y + 'px';
            textarea.rows = 1;
            textarea.cols = 30;

            if (styleCallback) styleCallback(textarea);

            document.body.appendChild(textarea);
            textarea.focus();

            textarea.removeEventListener('keydown', handleEnterKey);
            textarea.addEventListener('keydown', handleEnterKey);
            textarea.addEventListener('blur', handleBlur);
        };

        if (buttonIcons[i] === 'fas fa-bold') {
            button.addEventListener('click', () => {
                createTextarea(t => t.style.fontWeight = 'bold');
            });
        }

        if (buttonIcons[i] === 'fas fa-italic') {
            button.addEventListener('click', () => {
                createTextarea(t => t.style.fontStyle = 'italic');
            });
        }

        if (buttonIcons[i] === 'fas fa-underline') {
            button.addEventListener('click', () => {
                createTextarea(t => t.style.textDecoration = 'underline');
            });
        }

        if (buttonIcons[i] === 'fas fa-list-ul') {
            button.addEventListener('click', () => {
                createTextarea(t => t.setAttribute('data-is-bullet', 'true'));
            });
        }
    }

    document.body.appendChild(buttonContainer);
    currentButtonContainer = buttonContainer;
}


function handleEnterKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textarea.value.trim() === '') {
            textarea.remove();
            textarea = null;
            removeButtonContainer();
            return;
        }

        let text = textarea.value;
        let div = document.createElement('div');
        div.className = 'text-preview';
        div.contentEditable = true;
        div.style.left = textarea.style.left;
        div.style.top = textarea.style.top;

        if (textarea.style.fontWeight === 'bold') {
            div.innerHTML = `<span style="font-weight: bold;">${text.replace(/\n/g, '<br>')}</span>`;
        } else if (textarea.style.fontStyle === 'italic') {
            div.innerHTML = `<span style="font-style: italic;">${text.replace(/\n/g, '<br>')}</span>`;
        } else if (textarea.style.textDecoration === 'underline') {
            div.innerHTML = `<span style="text-decoration: underline;">${text.replace(/\n/g, '<br>')}</span>`;
        } else if (textarea.getAttribute('data-is-bullet') === 'true') {
            // Process text for bullet points
            div.innerHTML = text.split('\n').map(line => `<div>• ${line}</div>`).join('');
        } else {
            div.innerHTML = text.replace(/\n/g, '<br>');
        }

        div.addEventListener('click', function(event) {
            let position = { x: event.clientX, y: event.clientY };
            if (isGridVisible) {
                position = snapToGrid(event.clientX, event.clientY);
            }
            showButtons(div, position.x, position.y);
        });

        document.body.appendChild(div);

        // Clear textarea
        textarea.remove();
        textarea = null;

        removeButtonContainer(); // Hide the blue icon buttons container when Enter is pressed

        createBlueIconButtons(parseInt(div.style.left) - 40, parseInt(div.style.top));
    } else if (e.key === 'Enter' && e.shiftKey) {
        // Allow line breaks within the textarea
        e.preventDefault();
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(cursorPos);

        textarea.value = textBefore + '\n' + textAfter;
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
    }
}

function handleBlur() {
    // Remove textarea only if it does not have content
    if (textarea && textarea.value.trim() === '') {
        textarea.remove();
        textarea = null;
    }
}

document.addEventListener('click', function(event) {
    if (iconButton && !iconButton.contains(event.target)) {
        iconButton.remove();
        iconButton = null;
    }

    if (!event.target.closest('.button-container') && !event.target.classList.contains('text-preview')) {
        removeButtonContainer();
    }

    // Check if the clicked target is within the header or a button and return early
    if (event.target.closest('#header') || 
        event.target.closest('.blue-icon-button') || 
        event.target.closest('.button-container') ||
        event.target.closest('.text-preview span')) {
        return;
    }

    // Check if clicking on existing bullet points
    if (event.target.closest('.text-preview') && event.target.closest('.text-preview div')) {
        return; // Prevent creating new textarea on bullet points
    }

    let position = { x: event.clientX, y: event.clientY };
    if (isGridVisible) {
        position = snapToGrid(event.clientX, event.clientY);
    }

    if (event.target.classList.contains('text-preview')) {
        showButtons(event.target, position.x, position.y);
        return;
    }

    createBlueIconButtons(position.x, position.y);

    if (textarea) {
        textarea.remove(); // Remove any existing textarea if it exists
    }

    textarea = document.createElement('textarea');
    textarea.className = 'input-area';
    textarea.style.left = position.x + 'px';
    textarea.style.top = position.y + 'px';
    textarea.rows = 1;
    textarea.cols = 30;

    document.body.appendChild(textarea);
    textarea.focus();

    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textarea.value.trim() === '') {
                textarea.remove();
                removeButtonContainer();
                return;
            }

            let text = textarea.value;

            let div = document.createElement('div');
            div.className = 'text-preview';
            div.contentEditable = true;
            div.style.left = textarea.style.left;
            div.style.top = textarea.style.top;

            if (textarea.style.fontWeight === 'bold') {
                div.innerHTML = `<span style="font-weight: bold;">${text.replace(/\n/g, '<br>')}</span>`;
            } else if (textarea.style.fontStyle === 'italic') {
                div.innerHTML = `<span style="font-style: italic;">${text.replace(/\n/g, '<br>')}</span>`;
            } else if (textarea.style.textDecoration === 'underline') {
                div.innerHTML = `<span style="text-decoration: underline;">${text.replace(/\n/g, '<br>')}</span>`;
            } else if (textarea.getAttribute('data-is-bullet') === 'true') {
                // Process text for bullet points
                div.innerHTML = text.split('\n').map(line => `<div>• ${line}</div>`).join('');
            } else {
                div.innerHTML = text.replace(/\n/g, '<br>');
            }

            div.addEventListener('click', function(event) {
                let position = { x: event.clientX, y: event.clientY };
                if (isGridVisible) {
                    position = snapToGrid(event.clientX, event.clientY);
                }
                showButtons(div, position.x, position.y);
            });

            document.body.appendChild(div);
            textarea.remove();

            removeButtonContainer(); // Hide the blue icon buttons container when Enter is pressed

            createBlueIconButtons(parseInt(div.style.left) - 40, parseInt(div.style.top));
        }
    });

    textarea.addEventListener('input', function() {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    });

    document.addEventListener('mousedown', handleOutsideClick);
});

function handleOutsideClick(event) {
    if (textarea && !textarea.contains(event.target) && !event.target.classList.contains('text-preview')) {
        textarea.remove();
        textarea = null;
    }
}

function showButtons(textElement, x, y) {
    removeButtonContainer();

    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.left = (x + 10) + 'px';
    buttonContainer.style.top = (y + 10) + 'px';

    let buttons = [
        { className: 'button2', icon: 'fas fa-mouse-pointer', text: 'Move' },
        { className: 'button4', icon: 'fas fa-clone', text: 'Duplicate' },
        { className: 'button5', icon: 'fas fa-copy', text: 'Copy' },
        { className: 'button3', icon: 'fas fa-trash', text: 'Delete' }
    ];

    buttons.forEach(button => {
        let btn = document.createElement('button');
        btn.className = button.className;
        btn.innerHTML = `<i class="${button.icon}"></i> ${button.text}`;

        if (button.className === 'button3') {
            let tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = '*this option is permanent*';
            btn.appendChild(tooltip);

            btn.addEventListener('click', function() {
                textElement.remove();
                removeButtonContainer();
            });
        }

        if (button.className === 'button4') {
            btn.addEventListener('click', function() {
                duplicateText(textElement);
            });
        }

        if (button.className === 'button2') {
            btn.addEventListener('click', function() {
                startMovingText(textElement);
            });
        }

        if (button.className === 'button5') {
            btn.addEventListener('click', function() {
                copyText(textElement);
            });
        }

        buttonContainer.appendChild(btn);
    });

    document.body.appendChild(buttonContainer);
    currentButtonContainer = buttonContainer;
}

function duplicateText(textElement) {
    let clone = textElement.cloneNode(true);
    let rect = textElement.getBoundingClientRect();
    clone.style.left = rect.left + 20 + 'px';
    clone.style.top = rect.top + 20 + 'px';
    document.body.appendChild(clone);
    removeButtonContainer();
}

function copyText(textElement) {
    // Create a temporary textarea element to hold the text
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = textElement.innerText; // Use innerText to get the text content
    document.body.appendChild(tempTextarea);

    tempTextarea.select(); // Select the text
    document.execCommand('copy'); // Copy the text to clipboard
    document.body.removeChild(tempTextarea); // Remove the temporary textarea
}

function startMovingText(textElement) {
    movingTextElement = textElement;
    document.addEventListener('mousemove', moveText);
    document.addEventListener('mouseup', stopMovingText);
}

function moveText(event) {
    if (movingTextElement) {
        let position = { x: event.clientX, y: event.clientY };
        if (isGridVisible) {
            position = snapToGrid(event.clientX, event.clientY);
        }
        movingTextElement.style.left = position.x + 'px';
        movingTextElement.style.top = position.y + 'px';
    }
}

function stopMovingText() {
    movingTextElement = null;
    document.removeEventListener('mousemove', moveText);
    document.removeEventListener('mouseup', stopMovingText);
}

document.addEventListener('mousemove', function(event) {
    if (!headerLocked) {
        if (event.clientY < HEADER_HEIGHT) {
            header.classList.remove('header-hidden');
            hideHeaderButton.innerHTML = '<i class="fas fa-eye"></i>';
        } else if (!header.classList.contains('header-hidden')) {
            header.classList.add('header-hidden');
            hideHeaderButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        }
    }
});
