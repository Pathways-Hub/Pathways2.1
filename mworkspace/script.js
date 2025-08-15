(() => {
  const workspace = document.getElementById("workspace");

  let offsetX = 0;
  let offsetY = 0;
  let isPointerDown = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;

  const containers = [];
  let selectedContainer = null;
  let isMovingBox = false;

  function saveBoxes() {
    const data = containers.map(container => {
      const box = container.querySelector(".text-box");
      return {
        text: box.textContent,
        left: container.style.left,
        top: container.style.top
      };
    });
    localStorage.setItem("savedBoxes", JSON.stringify(data));
  }

  function restoreBoxes() {
    const saved = JSON.parse(localStorage.getItem("savedBoxes") || "[]");
    saved.forEach(item => {
      createTextBox(item.left, item.top, item.text);
    });
  }

  function applyOffsets() {
    const gap = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--grid-gap').trim() || "50");

    const norm = (v) => {
      const r = v % gap;
      return r < 0 ? r + gap : r;
    };

    workspace.style.setProperty('--bg-x', `${norm(offsetX)}px`);
    workspace.style.setProperty('--bg-y', `${norm(offsetY)}px`);

    containers.forEach(container => {
      container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });
  }

  function styleControlButton(btn) {
    btn.style.background = "black";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "14px 16px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.fontSize = "20px";
  }

  function createButtons(container) {
    // Remove old panel if it exists
    const oldPanel = container.querySelector(".control-panel");
    if (oldPanel) oldPanel.remove();

    const box = container.firstChild;
    const panel = document.createElement("div");
    panel.classList.add("control-panel");
    panel.style.position = "absolute";
    panel.style.top = `${box.offsetHeight + 8}px`;
    panel.style.left = "50%";
    panel.style.transform = "translateX(-50%)";
    panel.style.display = "flex";
    panel.style.gap = "12px";
    panel.style.justifyContent = "center";
    panel.style.pointerEvents = "auto";

    const moveBtn = document.createElement("button");
    moveBtn.innerHTML = `<i class="fas fa-arrows-alt"></i>`;
    styleControlButton(moveBtn);
    moveBtn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      isMovingBox = true;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      container.dataset.startX = parseFloat(container.style.left);
      container.dataset.startY = parseFloat(container.style.top);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    styleControlButton(deleteBtn);
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      container.remove();
      containers.splice(containers.indexOf(container), 1);
      selectedContainer = null;
      saveBoxes();
    });

    panel.appendChild(moveBtn);
    panel.appendChild(deleteBtn);
    container.appendChild(panel);

    // Update panel position when text changes
    const onInput = () => {
      panel.style.top = `${box.offsetHeight + 8}px`;
      saveBoxes();
    };
    box.addEventListener("input", onInput);

    // Store a reference so we can remove listener if deselected
    panel._onInput = onInput;

    return panel;
  }

  function createTextBox(left, top, text = "") {
    const container = document.createElement("div");
    container.classList.add("text-container");
    container.style.position = "absolute";
    container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    container.style.left = left;
    container.style.top = top;

    const box = document.createElement("div");
    box.classList.add("text-box");
    box.contentEditable = "true";
    box.style.fontSize = "2em";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.whiteSpace = "nowrap";
    box.style.outline = "none";
    box.textContent = text;

    container.appendChild(box);
    workspace.appendChild(container);
    containers.push(container);

    box.addEventListener("input", saveBoxes);

    box.addEventListener("click", (event) => {
      event.stopPropagation();
      if (selectedContainer && selectedContainer !== container) {
        deselectContainer(selectedContainer);
      }
      selectedContainer = container;
      box.style.border = "2px dotted black";
      createButtons(container);
    });

    return container;
  }

  function deselectContainer(container) {
    container.firstChild.style.border = "none";
    const panel = container.querySelector(".control-panel");
    if (panel) {
      container.firstChild.removeEventListener("input", panel._onInput);
      panel.remove();
    }
  }

  workspace.addEventListener("click", (e) => {
    if (e.target !== workspace) return;

    const rect = workspace.getBoundingClientRect();
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;

    const container = createTextBox(`${x}px`, `${y}px`, "");
    const box = container.firstChild;

    let enterPressed = false;
    box.focus();

    const onKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        enterPressed = true;
        if (!box.textContent.trim()) {
          container.remove();
          const index = containers.indexOf(container);
          if (index !== -1) containers.splice(index, 1);
          return;
        }
        box.blur();
        saveBoxes();
      }
    };

    const onBlur = () => {
      if (!enterPressed) {
        container.remove();
        const index = containers.indexOf(container);
        if (index !== -1) containers.splice(index, 1);
      } else {
        saveBoxes();
      }
      box.removeEventListener("keydown", onKeyDown);
      box.removeEventListener("blur", onBlur);
    };

    box.addEventListener("keydown", onKeyDown);
    box.addEventListener("blur", onBlur);
  });

  window.addEventListener("click", (e) => {
    if (selectedContainer && !selectedContainer.contains(e.target)) {
      deselectContainer(selectedContainer);
      selectedContainer = null;
    }
  });

  function onPointerDown(e) {
    if (e.target.closest(".control-panel button")) return;
    if (e.target !== workspace) return;

    isPointerDown = true;
    workspace.classList.add("dragging");
    workspace.setPointerCapture?.(e.pointerId);
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
  }

  function onPointerMove(e) {
    if (isMovingBox && selectedContainer) {
      const dx = e.clientX - startPointerX;
      const dy = e.clientY - startPointerY;
      selectedContainer.style.left = `${parseFloat(selectedContainer.dataset.startX) + dx}px`;
      selectedContainer.style.top = `${parseFloat(selectedContainer.dataset.startY) + dy}px`;
      saveBoxes();
      return;
    }
    if (!isPointerDown) return;
    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;
    offsetX = startOffsetX + dx;
    offsetY = startOffsetY + dy;
    applyOffsets();
  }

  function onPointerUp(e) {
    isPointerDown = false;
    isMovingBox = false;
    workspace.classList.remove("dragging");
    workspace.releasePointerCapture?.(e.pointerId);
  }

  function onWheel(e) {
    e.preventDefault();
    offsetX -= (e.shiftKey ? e.deltaY : e.deltaX);
    offsetY -= e.deltaY;
    applyOffsets();
  }

  workspace.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerUp, { passive: true });
  workspace.addEventListener('wheel', onWheel, { passive: false });

  restoreBoxes();
  applyOffsets();
})();
