document.getElementById("pallets").addEventListener("click", () => {
    let numColors = parseInt(prompt("How many colours do you want in your pallet? (1–10)"), 10);

    if (isNaN(numColors) || numColors < 1 || numColors > 10) {
        alert("Please enter a number between 1 and 10.");
        return;
    }

    const existing = document.getElementById("pallet-container");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "pallet-container";
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.display = "flex";
    container.style.border = "1px solid black";
    container.style.flexDirection = "row";
    container.style.alignItems = "stretch";
    container.style.height = "80px";
    container.style.cursor = "move";
    container.style.zIndex = "9999";
    container.style.userSelect = "none";

    const initialHeight = 80;
    const maxHeight = initialHeight * 2;

    // Handle click on the whole container to apply red outline
    container.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent clicks inside blocks from triggering this
        document.querySelectorAll(".selected-block").forEach(el => {
            el.classList.remove("selected-block");
            el.style.outline = "none";
        });
        
        // Apply red outline to the whole pallet container
        if (container.style.outline !== "2px solid red") {
            container.style.outline = "2px solid red";
        } else {
            container.style.outline = "none"; // Remove outline if clicked again
        }
    });

    for (let i = 0; i < numColors; i++) {
        const block = document.createElement("div");
        block.style.width = "70px";
        block.style.height = "100%";
        block.style.backgroundColor = "white";
        block.style.border = "1px solid black";
        block.style.display = "flex";
        block.style.flexDirection = "column";
        block.style.alignItems = "center";
        block.style.justifyContent = "flex-start";
        block.style.fontSize = "12px";
        block.style.fontFamily = "monospace";
        block.style.paddingTop = "4px";
        block.style.position = "relative";
        block.style.boxSizing = "border-box";

        const colorLabel = document.createElement("div");
        colorLabel.innerText = "#FFFFFF";

        const colorBtn = document.createElement("i");
        colorBtn.className = "fa-solid fa-palette";
        colorBtn.style.position = "absolute";
        colorBtn.style.bottom = "5px";
        colorBtn.style.cursor = "pointer";
        colorBtn.style.display = "none";
        colorBtn.style.fontSize = "14px";
        colorBtn.style.color = "black";

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = "#FFFFFF";
        colorInput.style.display = "none";

        block.addEventListener("mouseenter", () => {
            colorBtn.style.display = "block";
        });
        block.addEventListener("mouseleave", () => {
            colorBtn.style.display = "none";
        });

        colorBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            colorInput.click();
        });

        colorInput.addEventListener("input", () => {
            const newColor = colorInput.value.toUpperCase();
            block.style.backgroundColor = newColor;
            colorLabel.innerText = newColor;
        });

        // Selection logic for individual blocks
        block.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".selected-block").forEach(el => {
                el.classList.remove("selected-block");
                el.style.outline = "none";
            });
            block.classList.add("selected-block");
            block.style.outline = "2px solid red";
        });

        block.appendChild(colorLabel);
        block.appendChild(colorBtn);
        block.appendChild(colorInput);
        container.appendChild(block);
    }

    // Deselect if click outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#pallet-container")) {
            document.querySelectorAll(".selected-block").forEach(el => {
                el.classList.remove("selected-block");
                el.style.outline = "none";
            });
            // Remove the red outline from the container if nothing is selected
            container.style.outline = "none";
        }
    });

    // Delete selected block
    document.getElementById("binButton").addEventListener("click", () => {
        const selected = document.querySelector(".selected-block");
        if (selected) {
            selected.remove();
        }

        // If no blocks left, remove the entire pallet container
        if (document.querySelectorAll("#pallet-container .selected-block").length === 0) {
            const container = document.getElementById("pallet-container");
            if (container) {
                container.remove();
            }
        }
    });

    // Resizer
    const resizer = document.createElement("div");
    resizer.style.position = "absolute";
    resizer.style.bottom = "0";
    resizer.style.left = "0";
    resizer.style.width = "100%";
    resizer.style.height = "6px";
    resizer.style.cursor = "ns-resize";
    resizer.style.zIndex = "10";
    container.appendChild(resizer);

    let isResizing = false;

    resizer.addEventListener("mousedown", (e) => {
        isResizing = true;
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;

        const rect = container.getBoundingClientRect();
        const newHeight = Math.min(maxHeight, Math.max(initialHeight, e.clientY - rect.top));
        container.style.height = `${newHeight}px`;
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
    });

    // Drag the whole thing
    let isDragging = false;
    let offsetX, offsetY;

    container.addEventListener("mousedown", (e) => {
        if (e.target.closest("i")) return;

        isDragging = true;
        const rect = container.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
        container.style.transform = "";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    document.body.appendChild(container);
});
