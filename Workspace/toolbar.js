// toolbar.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle Bold Button
    document.getElementById('boldButton').addEventListener('click', () => {
        document.execCommand('bold');
    });

    // Handle Italic Button
    document.getElementById('italicButton').addEventListener('click', () => {
        document.execCommand('italic');
    });

    // Handle Underline Button
    document.getElementById('underlineButton').addEventListener('click', () => {
        document.execCommand('underline');
    });

    // Handle Paint Brush Button
    document.getElementById('paintBrushButton').addEventListener('click', () => {
        document.execCommand('foreColor', false, 'red');
    });

    document.getElementById("move").onclick = function () {
        var selectedIds = Object.keys(selected);
        if (selectedIds.length == 0) return;
        if (selectedIds.length == 1) {
            var el = document.getElementById(selectedIds[0]);
            el.setAttribute("data-x", 0);
            el.setAttribute("data-y", 0);
            el.style.webkitTransform =
                el.style.transform =
                "translate(" + 0 + "px, " + 0 + "px)";
            return;
        }
        var dx = mouseX - selectX;
        var dy = mouseY - selectY;
        selectX = mouseX;
        selectY = mouseY;
        for (var id in selected) {
            var el = document.getElementById(id);
            var x = (parseFloat(el.getAttribute("data-x")) || 0) + dx;
            var y = (parseFloat(el.getAttribute("data-y")) || 0) + dy;
            el.setAttribute("data-x", x);
            el.setAttribute("data-y", y);
            el.style.webkitTransform =
                el.style.transform =
                "translate(" + x + "px, " + y + "px)";
        }
    };

    document.getElementById("duplicate").onclick = function () {
        for (var id in selected) {
            var newNode = duplicateNode(document.getElementById(id));
            newNode.id = "n" + nid;
            nid += 1;
            newNode.onclick = selectNode;
            svgCanvas.appendChild(newNode);
        }
        selected = {};
    };

    document.getElementById("copy").onclick = function () {
        copiedNodes = {};
        for (var id in selected) {
            copiedNodes[id] = duplicateNode(document.getElementById(id));
        }
    };

    document.getElementById("delete").onclick = function () {
        for (var id in selected) {
            document.getElementById(id).remove();
        }
        selected = {};
    };

    // Helper functions
    function duplicateNode(node) {
        var newNode = node.cloneNode(true);
        newNode.id = "n" + nid;
        nid += 1;
        newNode.onclick = selectNode;
        return newNode;
    }

    // Add other toolbar button functions and logic here

});
