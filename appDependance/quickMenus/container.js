(function () {
  window.containersHidden = false;

  // 🔹 Helper: Save all containers to localStorage
  function saveContainers() {
    const data = Array.from(document.querySelectorAll(".custom-container")).map(c => {
      const rect = c.getBoundingClientRect();
      const title = c.querySelector(".title");
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        text: title && title.textContent !== title.dataset.placeholder ? title.textContent : ""
      };
    });
    localStorage.setItem("customContainers", JSON.stringify(data));
  }

  // 🔹 Helper: Load containers from localStorage
  function loadContainers() {
    const saved = JSON.parse(localStorage.getItem("customContainers") || "[]");
    saved.forEach(item => {
      window.spawnContainer(item.left, item.top - 40, item); // adjust because we added +40 on spawn
    });
  }

  window.toggleContainers = function () {
    window.containersHidden = !window.containersHidden;
    document.querySelectorAll('.custom-container').forEach(el => {
      if (window.containersHidden) {
        if (!el.dataset.originalDisplay) {
          el.dataset.originalDisplay = el.style.display || '';
        }
        el.style.display = 'none';
      } else {
        el.style.display = el.dataset.originalDisplay || '';
      }
    });
  };

  window.spawnContainer = function (x, y, savedData) {
    const container = document.createElement("div");
    container.classList.add("custom-container");
    container.style.position = "fixed";
    container.style.left = (x ?? 0) + "px";
    container.style.top = ((y ?? 0) + 40) + "px";
    container.style.width = (savedData?.width || 350) + "px";
    container.style.height = (savedData?.height || 220) + "px";
    container.style.background = "#d9d9d9";
    container.style.borderRadius = "10px";
    container.style.padding = "8px";
    container.style.boxSizing = "border-box";
    container.style.cursor = "move";

    // Editable placeholder text
    const title = document.createElement("div");
    title.classList.add("title");
    title.contentEditable = "true";
    title.textContent = savedData?.text || "";
    title.dataset.placeholder = "Container";
    title.style.position = "absolute";
    title.style.top = "6px";
    title.style.left = "10px";
    title.style.fontSize = "14px";
    title.style.fontFamily = "sans-serif";
    title.style.fontWeight = "bold";
    title.style.color = savedData?.text ? "#555" : "#aaa";
    title.style.outline = "none";
    title.style.minWidth = "50px";

    function updatePlaceholder() {
      if (title.textContent.trim() === "") {
        title.textContent = title.dataset.placeholder;
        title.style.color = "#aaa";
      }
      saveContainers();
    }

    function clearPlaceholder() {
      if (title.textContent === title.dataset.placeholder) {
        title.textContent = "";
        title.style.color = "#555";
      }
    }

    title.addEventListener("focus", clearPlaceholder);
    title.addEventListener("blur", updatePlaceholder);
    title.addEventListener("input", saveContainers);
    if (!savedData?.text) updatePlaceholder();

    // Close button
    const closeBtn = document.createElement("div");
    closeBtn.textContent = "✖";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "6px";
    closeBtn.style.right = "10px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.color = "#aaa";
    closeBtn.style.opacity = "0";
    closeBtn.style.transition = "opacity 0.2s";
    closeBtn.addEventListener("click", () => {
      container.remove();
      saveContainers();
    });

    container.addEventListener("mouseenter", () => closeBtn.style.opacity = "1");
    container.addEventListener("mouseleave", () => closeBtn.style.opacity = "0");

    container.appendChild(title);
    container.appendChild(closeBtn);

    document.body.insertBefore(container, document.body.firstChild);

    // Left-click dragging
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    container.addEventListener("mousedown", (e) => {
      if (e.button !== 2 && e.target !== closeBtn && e.target !== title && !e.target.classList.contains("resizer")) {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
        container.style.cursor = "grabbing";
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
        saveContainers();
      }

      if (window.rightDragging) {
        const dx = e.clientX - window.rightDragStartX;
        const dy = e.clientY - window.rightDragStartY;

        window.containersInitial.forEach(item => {
          item.container.style.left = `${item.startLeft + dx}px`;
          item.container.style.top = `${item.startTop + dy}px`;
        });
        saveContainers();
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) saveContainers();
      isDragging = false;
      container.style.cursor = "move";
      window.rightDragging = false;
      window.containersInitial = [];
    });

    // Resizers
    const resizers = ["top-left", "top-right", "bottom-left", "bottom-right", "top", "right", "bottom", "left"];
    resizers.forEach(pos => {
      const resizer = document.createElement("div");
      resizer.classList.add("resizer", pos);
      resizer.style.position = "absolute";
      resizer.style.background = "transparent";
      resizer.style.zIndex = "10";

      switch (pos) {
        case "top-left": resizer.style.left = "0"; resizer.style.top = "0"; resizer.style.cursor = "nwse-resize"; break;
        case "top-right": resizer.style.right = "0"; resizer.style.top = "0"; resizer.style.cursor = "nesw-resize"; break;
        case "bottom-left": resizer.style.left = "0"; resizer.style.bottom = "0"; resizer.style.cursor = "nesw-resize"; break;
        case "bottom-right": resizer.style.right = "0"; resizer.style.bottom = "0"; resizer.style.cursor = "nwse-resize"; break;
        case "top": resizer.style.top = "0"; resizer.style.left = "10px"; resizer.style.right = "10px"; resizer.style.height = "5px"; resizer.style.cursor = "ns-resize"; break;
        case "bottom": resizer.style.bottom = "0"; resizer.style.left = "10px"; resizer.style.right = "10px"; resizer.style.height = "5px"; resizer.style.cursor = "ns-resize"; break;
        case "left": resizer.style.left = "0"; resizer.style.top = "10px"; resizer.style.bottom = "10px"; resizer.style.width = "5px"; resizer.style.cursor = "ew-resize"; break;
        case "right": resizer.style.right = "0"; resizer.style.top = "10px"; resizer.style.bottom = "10px"; resizer.style.width = "5px"; resizer.style.cursor = "ew-resize"; break;
      }

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
        const minWidth = 50;
        const minHeight = 30;

        switch (pos) {
          case "top-left":
            const newWidthTL = rect.right - e.clientX;
            const newHeightTL = rect.bottom - e.clientY;
            if (newWidthTL > minWidth) { container.style.width = newWidthTL + "px"; container.style.left = e.clientX + "px"; }
            if (newHeightTL > minHeight) { container.style.height = newHeightTL + "px"; container.style.top = e.clientY + "px"; }
            break;
          case "top-right":
            const newWidthTR = e.clientX - rect.left;
            const newHeightTR = rect.bottom - e.clientY;
            if (newWidthTR > minWidth) container.style.width = newWidthTR + "px";
            if (newHeightTR > minHeight) { container.style.height = newHeightTR + "px"; container.style.top = e.clientY + "px"; }
            break;
          case "bottom-left":
            const newWidthBL = rect.right - e.clientX;
            const newHeightBL = e.clientY - rect.top;
            if (newWidthBL > minWidth) { container.style.width = newWidthBL + "px"; container.style.left = e.clientX + "px"; }
            if (newHeightBL > minHeight) container.style.height = newHeightBL + "px";
            break;
          case "bottom-right":
            const newWidthBR = e.clientX - rect.left;
            const newHeightBR = e.clientY - rect.top;
            if (newWidthBR > minWidth) container.style.width = newWidthBR + "px";
            if (newHeightBR > minHeight) container.style.height = newHeightBR + "px";
            break;
          case "top":
            const newHeightT = rect.bottom - e.clientY;
            if (newHeightT > minHeight) { container.style.height = newHeightT + "px"; container.style.top = e.clientY + "px"; }
            break;
          case "bottom":
            const newHeightB = e.clientY - rect.top;
            if (newHeightB > minHeight) container.style.height = newHeightB + "px";
            break;
          case "left":
            const newWidthL = rect.right - e.clientX;
            if (newWidthL > minWidth) { container.style.width = newWidthL + "px"; container.style.left = e.clientX + "px"; }
            break;
          case "right":
            const newWidthR = e.clientX - rect.left;
            if (newWidthR > minWidth) container.style.width = newWidthR + "px";
            break;
        }
        saveContainers();
      });

      document.addEventListener("mouseup", () => {
        if (isResizing) saveContainers();
        isResizing = false;
      });
    });

    saveContainers();
  };

  // Right-click drag all containers
  window.rightDragging = false;
  window.rightDragStartX = 0;
  window.rightDragStartY = 0;
  window.containersInitial = [];

  document.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      const containers = Array.from(document.querySelectorAll(".custom-container"));
      if (containers.length === 0) return;

      window.rightDragging = true;
      window.rightDragStartX = e.clientX;
      window.rightDragStartY = e.clientY;

      // Store initial positions
      window.containersInitial = containers.map(c => {
        const rect = c.getBoundingClientRect();
        return { container: c, startLeft: rect.left, startTop: rect.top };
      });

      e.preventDefault();
    }
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
      window.rightDragging = false;
      saveContainers();
      window.containersInitial = [];
    }
  });

  // 🔹 Load containers on page startup
  window.addEventListener("load", loadContainers);
})();
