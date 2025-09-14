// loading.js

document.addEventListener("DOMContentLoaded", () => {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "#fff";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // Create loading image
  const loadingImg = document.createElement("img");
  loadingImg.src = "images/loading2.gif";
  loadingImg.style.maxWidth = "100px";
  loadingImg.style.maxHeight = "100px";
  loadingImg.style.marginBottom = "15px";

  // Create progress bar container
  const progressContainer = document.createElement("div");
  progressContainer.style.width = "200px";
  progressContainer.style.height = "4px";
  progressContainer.style.backgroundColor = "#eee";
  progressContainer.style.borderRadius = "2px";
  progressContainer.style.overflow = "hidden";

  // Create progress bar fill
  const progressBar = document.createElement("div");
  progressBar.style.width = "0%";
  progressBar.style.height = "100%";
  progressBar.style.backgroundColor = "#333";
  progressBar.style.transition = "width 0.4s ease";

  progressContainer.appendChild(progressBar);
  overlay.appendChild(loadingImg);
  overlay.appendChild(progressContainer);
  document.body.appendChild(overlay);

  // Random delay 2–10 seconds
  const delay = Math.floor(Math.random() * (10 - 2 + 1) + 2) * 1000;
  const startTime = Date.now();

  function simulateLoading() {
    const elapsed = Date.now() - startTime;

    if (elapsed >= delay) {
      progressBar.style.width = "100%";
      setTimeout(() => overlay.remove(), 400);
      return;
    }

    // Increment width randomly in chunks (like stop-and-go)
    const currentWidth = parseFloat(progressBar.style.width);
    const nextWidth = Math.min(100, currentWidth + Math.random() * 20);

    progressBar.style.width = nextWidth + "%";

    // Wait a random pause before next update
    const nextDelay = Math.random() * 800 + 200; // 200ms–1000ms
    setTimeout(simulateLoading, nextDelay);
  }

  simulateLoading();
});
