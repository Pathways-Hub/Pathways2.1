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
            const { line, pointIndex } = draggingPoint;
            const otherIndex = 1 - pointIndex;
            const fixedPoint = line.points[otherIndex];
            let dx = x - fixedPoint.x;
            let dy = y - fixedPoint.y;

            if (shiftKeyPressed) {
                // Lock angle: extend/retract along original direction only
                const originalDx = line.points[pointIndex].x - fixedPoint.x;
                const originalDy = line.points[pointIndex].y - fixedPoint.y;
                const originalAngle = Math.atan2(originalDy, originalDx);

                // Get new length based on current mouse position
                const newLength = Math.sqrt(dx * dx + dy * dy);

                // Recalculate the point position with same angle
                const newX = fixedPoint.x + newLength * Math.cos(originalAngle);
                const newY = fixedPoint.y + newLength * Math.sin(originalAngle);

                line.points[pointIndex] = { x: newX, y: newY };
            } else {
                // Free movement if shift not held
                line.points[pointIndex] = { x, y };
            }
        } else if (draggingLine) {
            const dx = x - getMidPoint(draggingLine.points[0], draggingLine.points[1]).x;
            const dy = y - getMidPoint(draggingLine.points[0], draggingLine.points[1]).y;

            if (shiftKeyPressed) {
                const midPoint = getMidPoint(draggingLine.points[0], draggingLine.points[1]);
                const bendFactor = dy / 100;
                const controlPoint = {
                    x: midPoint.x,
                    y: midPoint.y + bendFactor * 100,
                };
                draggingLine.controlPoint = controlPoint;
            } else {
                draggingLine.points[0].x += dx;
                draggingLine.points[0].y += dy;
                draggingLine.points[1].x += dx;
                draggingLine.points[1].y += dy;
            }
        } else {
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
        let popupShown = false;

        for (let line of lines) {
            if (line.points.length < 2) continue;

            const midPoint = getMidPoint(line.points[0], line.points[1]);

            // Draw selected border
            if (line.selected) {
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            // Draw the actual line (curve or straight)
            if (line.controlPoint) {
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.quadraticCurveTo(line.controlPoint.x, line.controlPoint.y, line.points[1].x, line.points[1].y);
            } else {
                ctx.beginPath();
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
            }
            ctx.strokeStyle = line.color || "black";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw blue handles
            if (line.near || line.selected) {
                for (let point of line.points) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, circleRadius + 3, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, circleRadius, 0, Math.PI * 2);
                    ctx.fillStyle = "blue";
                    ctx.fill();
                }

                // Draw midpoint handle
                ctx.lineWidth = 3;
                ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
                ctx.strokeRect(midPoint.x - rectSize / 2 - 1.5, midPoint.y - rectSize / 2 - 1.5, rectSize + 3, rectSize + 3);

                ctx.fillStyle = "blue";
                ctx.fillRect(midPoint.x - rectSize / 2, midPoint.y - rectSize / 2, rectSize, rectSize);

                // === Show deg popup ===
                const dx = line.points[1].x - line.points[0].x;
                const dy = line.points[1].y - line.points[0].y;
                let angleDeg = Math.atan2(-dy, dx) * (180 / Math.PI); // invert dy to match canvas coordinates
                angleDeg = (angleDeg + 360) % 360; // normalize to 0–360

                gradientPopup.style.left = `${midPoint.x}px`;
                gradientPopup.style.top = `${midPoint.y - 30}px`; // above midpoint
                gradientPopup.innerText = `Angle: ${angleDeg.toFixed(1)}°`;
                gradientPopup.style.display = "block";
                popupShown = true;
            }
        }

    // Hide popup if no line is active
    if (!popupShown) {
        gradientPopup.style.display = "none";
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

// Create the gradient popup
const gradientPopup = document.createElement("div");
gradientPopup.style.position = "absolute";
gradientPopup.style.backgroundColor = "grey";
gradientPopup.style.color = "white";
gradientPopup.style.padding = "4px 8px";
gradientPopup.style.borderRadius = "4px";
gradientPopup.style.fontFamily = "Arial, sans-serif";
gradientPopup.style.fontSize = "12px";
gradientPopup.style.whiteSpace = "nowrap";
gradientPopup.style.pointerEvents = "none";
gradientPopup.style.display = "none"; // Hidden by default
document.body.appendChild(gradientPopup);
