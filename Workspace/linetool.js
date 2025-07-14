document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const circleRadius = 6;
    const rectSize = 12;
    const proximityThreshold = 8;

    let lines = loadLines(); // Load from localStorage
    let currentLine = null;
    let draggingPoint = null;
    let draggingLine = null;
    let selectedLine = null;
    let globalOffset = { x: 0, y: 0 };

    window.isInteractingWithLine = true;

    const colors = ["black", "red", "blue", "green", "orange", "purple"];
    let currentColorIndex = 0;

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
    infoPopup.style.display = "none";
    infoPopup.innerHTML = `<strong>Information</strong><br>Please select two points to create your line.`;
    document.body.appendChild(infoPopup);

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
    gradientPopup.style.display = "none";
    document.body.appendChild(gradientPopup);

    function showInfoPopup() {
        infoPopup.style.display = "block";
    }

    function hideInfoPopup() {
        infoPopup.style.display = "none";
    }

    document.getElementById("lineToolButton").addEventListener("click", () => {
        currentLine = { points: [], near: false, selected: false, color: colors[currentColorIndex] };
        lines.push(currentLine);
        saveLines();
        draggingPoint = null;
        draggingLine = null;
        selectedLine = null;
        showInfoPopup();
    });

    document.getElementById("binButton").addEventListener("click", () => {
        if (selectedLine) {
            lines = lines.filter(line => line !== selectedLine);
            selectedLine = null;
            saveLines();
            drawScene();
        }
    });

    document.getElementById("paintBucketButton").addEventListener("click", () => {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        if (selectedLine) {
            selectedLine.color = colors[currentColorIndex];
            saveLines();
        }
        drawScene();
    });

    let shiftKeyPressed = false;
    let mouseDownPos = null;
    let isDraggingWorkspace = false;

    let hoveredLine = null;

    window.addEventListener("keydown", (e) => {
        if (e.key === "Shift") shiftKeyPressed = true;
    });

    window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") shiftKeyPressed = false;
    });

    canvas.addEventListener("mousedown", (e) => {
        const { x, y } = getMousePos(e);
        mouseDownPos = { x, y };
        isDraggingWorkspace = false;
        isInteractingWithLine = false; // reset by default

        draggingPoint = null;
        draggingLine = null;

        for (let line of lines) {
            if (line.points.length === 2) {
                for (let i = 0; i < line.points.length; i++) {
                    if (isInsideCircle(x, y, line.points[i])) {
                        draggingPoint = { line, pointIndex: i };
                        line.selected = true;
                        selectedLine = line;
                        isInteractingWithLine = true; // 🆕 interacting with a point
                        drawScene();
                        return;
                    }
                }
                const midPoint = getMidPoint(line.points[0], line.points[1]);
                if (isInsideRect(x, y, midPoint)) {
                    draggingLine = line;
                    line.selected = true;
                    selectedLine = line;
                    isInteractingWithLine = true; // 🆕 interacting with a line
                    drawScene();
                    return;
                }
            }
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        const { x, y } = getMousePos(e);

        if (!mouseDownPos) {
            let foundHover = false;
            for (let line of lines) {
                if (line.points.length === 2 && isNearLine(x, y, line.points[0], line.points[1])) {
                    hoveredLine = line;
                    foundHover = true;
                    break;
                }
            }
            if (!foundHover) hoveredLine = null;
            drawScene();
            return;
        }

        const dx = x - mouseDownPos.x;
        const dy = y - mouseDownPos.y;

        if (!isDraggingWorkspace && Math.sqrt(dx * dx + dy * dy) > 5) {
            if (!draggingPoint && !draggingLine) {
                // Only start workspace dragging on right-click drag
                if (e.buttons === 2) {  // right mouse button pressed
                    isDraggingWorkspace = true;
                }
            }
        }

        if (isDraggingWorkspace && !isInteractingWithLine) {
            for (let line of lines) {
                for (let p of line.points) {
                    p.x += dx;
                    p.y += dy;
                }
                if (line.controlPoint) {
                    line.controlPoint.x += dx;
                    line.controlPoint.y += dy;
                }
            }
            mouseDownPos = { x, y };
            saveLines();
            drawScene();
        } else if (draggingPoint) {
            const { line, pointIndex } = draggingPoint;
            const otherIndex = 1 - pointIndex;
            const fixedPoint = line.points[otherIndex];
            let localDx = x - fixedPoint.x;
            let localDy = y - fixedPoint.y;

            if (shiftKeyPressed) {
                const originalDx = line.points[pointIndex].x - fixedPoint.x;
                const originalDy = line.points[pointIndex].y - fixedPoint.y;
                const originalAngle = Math.atan2(originalDy, originalDx);
                const newLength = Math.sqrt(localDx * localDx + localDy * localDy);
                line.points[pointIndex] = {
                    x: fixedPoint.x + newLength * Math.cos(originalAngle),
                    y: fixedPoint.y + newLength * Math.sin(originalAngle)
                };
            } else {
                line.points[pointIndex] = { x, y };
            }
            saveLines();
            drawScene();
        } else if (draggingLine) {
            // Move entire line by mouse delta exactly like workspace dragging
            const dxLine = x - mouseDownPos.x;
            const dyLine = y - mouseDownPos.y;

            for (let point of draggingLine.points) {
                point.x += dxLine;
                point.y += dyLine;
            }
            if (draggingLine.controlPoint) {
                draggingLine.controlPoint.x += dxLine;
                draggingLine.controlPoint.y += dyLine;
            }

            mouseDownPos = { x, y }; // update for smooth dragging
            saveLines();
            drawScene();
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        if (!mouseDownPos) return;

        const { x, y } = getMousePos(e);
        const dx = x - mouseDownPos.x;
        const dy = y - mouseDownPos.y;

        if (!isDraggingWorkspace && !isInteractingWithLine) {
            let clickedOnControl = false;

            for (let line of lines) {
                if (line.points.length === 2) {
                    for (let i = 0; i < line.points.length; i++) {
                        if (isInsideCircle(x, y, line.points[i])) {
                            line.selected = true;
                            selectedLine = line;
                            clickedOnControl = true;
                            drawScene();
                            break;
                        }
                    }
                    if (clickedOnControl) break;

                    const midPoint = getMidPoint(line.points[0], line.points[1]);
                    if (isInsideRect(x, y, midPoint)) {
                        line.selected = true;
                        selectedLine = line;
                        clickedOnControl = true;
                        drawScene();
                    }
                    if (clickedOnControl) break;
                }
            }

            if (!clickedOnControl) {
                if (currentLine && currentLine.points.length < 2) {
                    currentLine.points.push({ x, y });
                    if (currentLine.points.length === 2) {
                        currentLine = null;
                        hideInfoPopup();
                        saveLines();
                    }
                } else {
                    clearSelection();
                    drawScene();
                }
            }
        }

        draggingPoint = null;
        draggingLine = null;
        mouseDownPos = null;
        isDraggingWorkspace = false;
        isInteractingWithLine = false; // 🆕 reset
    });

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let popupShown = false;

        for (let line of lines) {
            if (line.points.length < 2) continue;

            if (line.selected) {
                ctx.beginPath();
                if (line.controlPoint) {
                    ctx.moveTo(line.points[0].x, line.points[0].y);
                    ctx.quadraticCurveTo(line.controlPoint.x, line.controlPoint.y, line.points[1].x, line.points[1].y);
                } else {
                    ctx.moveTo(line.points[0].x, line.points[0].y);
                    ctx.lineTo(line.points[1].x, line.points[1].y);
                }
                ctx.strokeStyle = "red";
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            ctx.beginPath();
            if (line.controlPoint) {
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.quadraticCurveTo(line.controlPoint.x, line.controlPoint.y, line.points[1].x, line.points[1].y);
            } else {
                ctx.moveTo(line.points[0].x, line.points[0].y);
                ctx.lineTo(line.points[1].x, line.points[1].y);
            }
            ctx.strokeStyle = line.color || "black";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (line === hoveredLine || line.selected) {
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

                const midPoint = getMidPoint(line.points[0], line.points[1]);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
                ctx.strokeRect(midPoint.x - rectSize / 2 - 1.5, midPoint.y - rectSize / 2 - 1.5, rectSize + 3, rectSize + 3);

                ctx.fillStyle = "blue";
                ctx.fillRect(midPoint.x - rectSize / 2, midPoint.y - rectSize / 2, rectSize, rectSize);

                const dx = line.points[1].x - line.points[0].x;
                const dy = line.points[1].y - line.points[0].y;
                let angleDeg = Math.atan2(-dy, dx) * (180 / Math.PI);
                angleDeg = (angleDeg + 360) % 360;

                gradientPopup.style.left = `${midPoint.x}px`;
                gradientPopup.style.top = `${midPoint.y - 30}px`;
                gradientPopup.innerText = `Angle: ${angleDeg.toFixed(1)}°`;
                gradientPopup.style.display = "block";
                popupShown = true;
            }
        }

        if (!popupShown) gradientPopup.style.display = "none";
    }

    function clearSelection() {
        selectedLine = null;
        for (let line of lines) {
            line.selected = false;
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

    function saveLines() {
        localStorage.setItem("savedLines", JSON.stringify(lines));
    }

    function loadLines() {
        const saved = localStorage.getItem("savedLines");
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    drawScene();
});
