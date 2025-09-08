(function () {
  window.commentsHidden = false;

  window.toggleComments = function () {
    window.commentsHidden = !window.commentsHidden;
    document.querySelectorAll('.custom-comment').forEach(el => {
      if (window.commentsHidden) {
        if (!el.dataset.originalDisplay) {
          el.dataset.originalDisplay = el.style.display || '';
        }
        el.style.display = 'none';
      } else {
        el.style.display = el.dataset.originalDisplay || '';
      }
    });
  };

  window.spawnCommentInput = function (x, y) {
    const container = document.createElement("div");
    container.classList.add("custom-comment");
    container.style.position = "fixed";
    container.style.left = (x ?? 0) + "px";
    container.style.top = ((y ?? 0) + 40) + "px"; // push it further down
    container.style.zIndex = "9999";
    container.style.width = "350px";
    container.style.height = "220px";
    container.style.background = "#f5f5f5"; // light grey
    container.style.borderRadius = "10px";
    container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.padding = "16px";
    container.style.boxSizing = "border-box";

    // Small red glowing dot at top left
    const redDot = document.createElement("div");
    redDot.style.position = "absolute";
    redDot.style.top = "8px";
    redDot.style.left = "8px";
    redDot.style.width = "8px";
    redDot.style.height = "8px";
    redDot.style.background = "red";
    redDot.style.borderRadius = "50%";
    redDot.style.boxShadow = "0 0 6px red";
    container.appendChild(redDot);

    // Title
    const title = document.createElement("div");
    title.textContent = "Today";
    title.style.fontFamily = "'DM Serif Display', serif";
    title.style.fontSize = "28px";
    title.style.color = "#333333";
    title.style.margin = "24px 0 16px 0"; // spacing from red dot above, and white box below
    title.style.textAlign = "left";
    title.style.lineHeight = "1.2";
    title.style.fontWeight = "normal";

    // Inner white rectangle
    const whiteBox = document.createElement("div");
    whiteBox.style.position = "relative"; // for timeline elements
    whiteBox.style.flex = "1";
    whiteBox.style.background = "white";
    whiteBox.style.borderRadius = "8px";
    whiteBox.style.margin = "0 2px 6px 2px"; // very close to left/right
    whiteBox.style.boxShadow = "inset 0 2px 6px rgba(0,0,0,0.08)";

    // Timeline vertical line
    const line = document.createElement("div");
    line.style.position = "absolute";
    line.style.top = "20px";
    line.style.left = "10px";
    line.style.width = "2px";
    line.style.height = "50px";
    line.style.background = "#ccc";

    // Timeline pill with time
    const pill = document.createElement("div");
    pill.style.position = "absolute";
    pill.style.left = "0";
    pill.style.top = "20px";
    pill.style.minWidth = "40px";
    pill.style.height = "20px";
    pill.style.padding = "0 6px";
    pill.style.borderRadius = "12px";
    pill.style.background = "white";
    pill.style.border = "2px solid #ccc";
    pill.style.display = "flex";
    pill.style.alignItems = "center";
    pill.style.justifyContent = "center";
    pill.style.fontSize = "10px";
    pill.style.fontFamily = "sans-serif";
    pill.style.color = "#333";

    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ":" +
                       now.getMinutes().toString().padStart(2, '0');
    pill.textContent = timeString;

    whiteBox.appendChild(line);
    whiteBox.appendChild(pill);

    container.appendChild(title);
    container.appendChild(whiteBox);
    document.body.appendChild(container);

    function outsideClickListener(event) {
      if (!container.contains(event.target)) {
        container.remove();
        document.removeEventListener("mousedown", outsideClickListener);
      }
    }

    document.addEventListener("mousedown", outsideClickListener);
  };

  document.addEventListener("contextmenu", (e) => {
    window.lastRightClickX = e.clientX;
    window.lastRightClickY = e.clientY;
  });
})();
