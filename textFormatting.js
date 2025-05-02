document.addEventListener('DOMContentLoaded', () => {
    const boldButton = document.getElementById('bold-btn');
    const italicButton = document.getElementById('italic-btn');
    const underlineButton = document.getElementById('underline-btn');
    const documentArea = document.querySelector('.document-area');

    function wrapSelectedText(tag) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();

        const wrapper = document.createElement(tag);
        wrapper.appendChild(selectedText);
        range.insertNode(wrapper);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    function toggleBold() {
        wrapSelectedText('b');
    }

    function toggleItalic() {
        wrapSelectedText('i');
    }

    function toggleUnderline() {
        wrapSelectedText('u');
    }

    boldButton.addEventListener('click', toggleBold);
    italicButton.addEventListener('click', toggleItalic);
    underlineButton.addEventListener('click', toggleUnderline);
});
