document.addEventListener("DOMContentLoaded", () => {
    // Get references to elements
    const downloadButton = document.getElementById("downloadButton");
    const popupOverlay = document.createElement("div");
    popupOverlay.id = "popupOverlay";

    const popupContainer = document.createElement("div");
    popupContainer.id = "popupContainer";

    // Popup content
    const videoElement = document.createElement("video");
    videoElement.id = "popupVideo";
    videoElement.src = "website/macdv.mp4"; // Correct file format
    videoElement.autoplay = true; // Play automatically
    videoElement.loop = true; // Loop the video
    videoElement.muted = true; // Optional: Mute the video

    const titleElement = document.createElement("div");
    titleElement.id = "popupTitle";
    titleElement.textContent = "Download Pathways";

    // Updated description for Pathways
    const descriptionElement = document.createElement("div");
    descriptionElement.id = "popupDescription";
    descriptionElement.textContent = "Pathways is a powerful tool that empowers individuals and teams to stay organized, manage tasks, and collaborate with ease. Download Pathways today.";

    // Button container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "popupButtons";

    // Windows Button
    const windowsButton = document.createElement("a");
    windowsButton.classList.add("popupButton");
    windowsButton.href = "#"; // Placeholder
    windowsButton.innerHTML = `<i class="fab fa-windows"></i> Download for Windows&nbsp; <i class="fa-solid fa-arrow-up-right-from-square"></i>`;

    // MacOS Button
    const macButton = document.createElement("a");
    macButton.classList.add("popupButton");
    macButton.href = "#"; // Placeholder
    macButton.innerHTML = `<i class="fab fa-apple"></i> Download for Mac&nbsp; <i class="fa-solid fa-arrow-up-right-from-square"></i>`;

    // Android Button
    const androidButton = document.createElement("a");
    androidButton.classList.add("popupButton");
    androidButton.href = "#"; // Placeholder
    androidButton.innerHTML = `<i class="fab fa-android"></i> Download for Android&nbsp; <i class="fa-solid fa-arrow-up-right-from-square"></i>`;

    // Append the buttons to the button container
    buttonsContainer.appendChild(windowsButton);
    buttonsContainer.appendChild(macButton);
    buttonsContainer.appendChild(androidButton);

    // Append content to the popup container
    popupContainer.appendChild(videoElement);
    popupContainer.appendChild(titleElement);
    popupContainer.appendChild(descriptionElement);  // Add description under title
    popupContainer.appendChild(buttonsContainer);

    // Append the overlay and popup container to the body
    document.body.appendChild(popupOverlay);
    document.body.appendChild(popupContainer);

    // Show popup
    downloadButton.addEventListener("click", (e) => {
        e.preventDefault();
        popupOverlay.style.display = "block";
        popupContainer.style.display = "block";
    });

    // Hide popup when clicking on the overlay
    popupOverlay.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        popupContainer.style.display = "none";
    });
});
