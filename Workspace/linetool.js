document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const circleRadius = 6;
    const rectSize = 12;
    const proximityThreshold = 8;

    let lines = []; // Stores all the lines
    let currentLine = null; // The line being drawn
    let draggingPoint = null;
    let draggingLine = null;
    let selectedLine = null; // The line currently selected for deletion

    // Colors for the color tool
    const colors = ["black", "red", "blue", "green", "orange", "purple"];
    let currentColorIndex = 0; // Start with the first color

    // Create the information popup
    const infoPopup = document.createElement("div");
    infoPopup.style.position = "fixed";
    infoPopup.style.bottom = "20px";
    infoPopup.style.left = "50%";
    infoPopup.style.transform = "translateX(-50%)";
    infoPopup.style.backgroundColor = "grey";
    infoPopup.style.color = "white";
    infoPopup.style.padding = "10px 20px";
    infoPopup.style.borderRadius = "5px";
    infoPopup.style.fontFamily = "Arial, sans-serif";
    infoPopup.style.fontSize = "14px";
    infoPopup.style.textAlign = "center";
    infoPopup.style.display = "none"; // Initially hidden
    infoPopup.innerHTML = `
        <strong>Information</strong><br>
        Please select two points to create your line.
    `;
    document.body.appendChild(infoPopup);

    function showInfoPopup() {
        infoPopup.style.display = "block";
    }

    function hideInfoPopup() {
        infoPopup.style.display = "none";
    }

    document.getElementById("lineToolButton").addEventListener("click", () => {
        currentLine = { points: [], near: false, selected: false, color: colors[currentColorIndex] };
        lines.push(currentLine);
        draggingPoint = null;
        draggingLine = null;
        selectedLine = null;
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);

        // Show the information popup
        showInfoPopup();
    });

    document.getElementById("binButton").addEventListener("click", () => {
        if (selectedLine) {
            // Remove the selected line from the lines array
            lines = lines.filter(line => line !== selectedLine);
            selectedLine = null; // Clear the selection
            drawScene();
        }
    });

    document.getElementById("paintBucketButton").addEventListener("click", () => {
        // Cycle through the colors
        currentColorIndex = (currentColorIndex + 1) % colors.length;

        if (selectedLine) {
            // Apply the current color to the selected line
            selectedLine.color = colors[currentColorIndex];
        }

        drawScene();
    });

    let shiftKeyPressed = false;

    // Track the state of the Shift key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Shift") {
            shiftKeyPressed = true;
        }
    });

    window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") {
            shiftKeyPressed = false;
        }
    });

    function handleMouseDown(e) {
        const { x, y } = getMousePos(e);

        // Reset selection unless clicking a line
        let clickedLine = false;

        for (let line of lines) {
            if (line.points.length === 2) {
                // Check if clicked on an endpoint
                for (let i = 0; i < line.points.length; i++) {
                    if (isInsideCircle(x, y, line.points[i])) {
                        draggingPoint = { line, pointIndex: i };
                        line.selected = true; // Select the line
                        selectedLine = line;
                        clickedLine = true;
                        drawScene();
                        return;
                    }
                }

                // Check if clicked on the midpoint rectangle
                const midPoint = getMidPoint(line.points[0], line.points[1]);
                if (isInsideRect(x, y, midPoint)) {
                    draggingLine = line;
                    line.selected = true; // Select the line
                    selectedLine = line;
                    clickedLine = true;
                    drawScene();
                    return;
                }
            }
        }

        // If no line was clicked, clear selection
        if (!clickedLine) {
            clearSelection();
            drawScene();
        }

        // Start a new line if none is being interacted with
        if (currentLine && currentLine.points.length < 2) {
            currentLine.points.push({ x, y });

            // Hide the popup if the line is complete
            if (currentLine.points.length === 2) {
                currentLine = null; // Reset current line once two points are set
                hideInfoPopup();
            }
        }
    }

    function handleMouseMove(e) {
        const { x, y } = getMousePos(e);

        if (draggingPoint) {
            // Move the dragged endpoint
            draggingPoint.line.points[draggingPoint.pointIndex] = { x, y };
        } else if (draggingLine) {
            // Move the whole line or bend it if shift is pressed
            const dx = x - getMidPoint(draggingLine.points[0], draggingLine.points[1]).x;
            const dy = y - getMidPoint(draggingLine.points[0], draggingLine.points[1]).y;

            if (shiftKeyPressed) {
                // Bend the line by adjusting the control point
                const midPoint = getMidPoint(draggingLine.points[0], draggingLine.points[1]);
                const bendFactor = dy / 100; // Control how much the line bends

                // Create a curved line using Bezier control point adjustment
                const controlPoint = {
                    x: midPoint.x,
                    y: midPoint.y + bendFactor * 100, // Bending the line by moving the control point vertically
                };

                // Store the updated control point in the line's properties for use in drawing
                draggingLine.controlPoint = controlPoint;
            } else {
                // Move the line as usual
                draggingLine.points[0].x += dx;
                draggingLine.points[0].y += dy;
                draggingLine.points[1].x += dx;
                draggingLine.points[1].y += dy;
            }
        } else {
            // Check proximity to lines
            for (let line of lines) {
                if (line.points.length === 2) {
                    line.near = isNearLine(x, y, line.points[0], line.points[1]);
                }
            }
        }

        drawScene();
    }

    function handleMouseUp() {
        draggingPoint = null;
        draggingLine = null;
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let line of lines) {
            if (line.points.length < 2) continue;

            const midPoint = getMidPoint(line.points[0], line.points[1]);

            // Draw the red border for selected lines
            if (line.selected) {
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 4; // Border width
                ctx.stroke();
            }

            // If the line has a control point (indicating it's a curve), draw the curve
            if (line.controlPoint) {
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.quadraticCurveTo(line.controlPoint.x, line.controlPoint.y, line.points[1].x, line.points[1].y);
                ctx.strokeStyle = line.color || "black"; // Use the line's color
                ctx.lineWidth = 2; // Main line width
                ctx.stroke();
            } else {
                // Draw a straight line if no control point is set
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
                ctx.strokeStyle = line.color || "black"; // Use the line's color
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw the points and midpoint only if near the line
            if (line.near || line.selected) {
                for (let point of line.points) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, circleRadius, 0, Math.PI * 2);
                    ctx.fillStyle = "blue";
                    ctx.fill();
                }

                ctx.fillStyle = "blue";
                ctx.fillRect(midPoint.x - rectSize / 2, midPoint.y - rectSize / 2, rectSize, rectSize);
            }
        }
    }

    function clearSelection() {
        selectedLine = null;
        for (let line of lines) {
            line.selected = false; // Unselect all lines
        }
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function isInsideCircle(x, y, point) {
        const dx = x - point.x;
        const dy = y - point.y;
        return dx * dx + dy * dy <= circleRadius * circleRadius;
    }

    function isInsideRect(x, y, point) {
        const dx = x - point.x;
        const dy = y - point.y;
        return Math.abs(dx) <= rectSize / 2 && Math.abs(dy) <= rectSize / 2;
    }

    function isNearLine(x, y, p0, p1) {
        const distance = Math.abs((p1.y - p0.y) * x - (p1.x - p0.x) * y + p1.x * p0.y - p1.y * p0.x) / Math.sqrt((p1.y - p0.y) ** 2 + (p1.x - p0.x) ** 2);
        return distance < proximityThreshold;
    }

    function getMidPoint(p0, p1) {
        return {
            x: (p0.x + p1.x) / 2,
            y: (p0.y + p1.y) / 2,
        };
    }
});
