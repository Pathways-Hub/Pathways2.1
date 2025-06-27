document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('paintBucketButton');
    let colorMenuVisible = false;

    button.addEventListener('click', (event) => {
        const existingMenu = document.querySelector('.color-options');

        if (colorMenuVisible && existingMenu) {
            existingMenu.remove();
            colorMenuVisible = false;
        } else {
            if (existingMenu) existingMenu.remove(); // Ensure no duplicate

            const colorOptionsContainer = document.createElement('div');
            colorOptionsContainer.classList.add('color-options');

            Object.assign(colorOptionsContainer.style, {
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                position: 'absolute',
                top: `${event.pageY - 180}px`, // Position above the button
                left: `${event.pageX}px`,
                transform: 'translate(-50%, 0)',
                zIndex: 1000,
            });

            const colors = [
                '#FFB3BA', '#FFDFBA', '#FFECBA', '#BAFFC9',
                '#BAE1FF', '#D9BAFF', '#FFBAF0', '#B3B3CC',
                '#C4E1C1', '#FFB6C1', '#B6E3FF', '#C9B0FF',
                '#FADADD', '#FEEAC8', '#FFFACD', '#D5F4E6',
                '#CFE8FC', '#E5D0FF', '#FFD6EC', '#DCD6F7',
                '#D0F0C0', '#FFC0CB', '#CDEFFD', '#E6CCFF'
            ];

            colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.style.backgroundColor = color;
                colorBox.style.width = '24px';
                colorBox.style.height = '24px';
                colorBox.style.borderRadius = '4px';
                colorBox.style.cursor = 'pointer';
                colorBox.style.border = '1px solid #ccc';

                colorBox.addEventListener('click', () => {
                    applyColorToHighlightedText(color);
                    colorOptionsContainer.remove();
                    colorMenuVisible = false;
                });

                colorOptionsContainer.appendChild(colorBox);
            });

            document.body.appendChild(colorOptionsContainer);
            colorMenuVisible = true;
        }
    });
});

// Applies selected color to highlighted text
function applyColorToHighlightedText(color) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color;
        range.surroundContents(span);
    } else {
        alert('Please select some text to change its color!');
    }
}
