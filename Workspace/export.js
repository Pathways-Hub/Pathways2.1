document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('export');
    const iconButton = document.getElementById('icon'); // Button to change the favicon
    const header = document.getElementById('header');
    const titleInput = document.querySelector('.editable-title'); // Get the workspace title input

    // Export functionality
    exportButton.addEventListener('click', () => {
        // Hide the header temporarily
        header.style.display = 'none';

        // Retrieve the workspace title or use a default if empty
        const workspaceTitle = titleInput.value.trim() || 'Untitled_Workspace';

        // Capture the screenshot of the workspace excluding the header
        html2canvas(document.body, {
            ignoreElements: element => element === header // Ignore the header
        }).then(canvas => {
            // Create a download link and trigger it to save the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png'); // Convert canvas to PNG data URL
            link.download = `${workspaceTitle}.png`; // Name of the downloaded file using the workspace title
            link.click(); // Simulate a click on the link to trigger the download

            // Show the header again after the screenshot is taken
            header.style.display = '';
        });
    });

    // Change favicon functionality
    iconButton.addEventListener('click', () => {
        // Create a file input element dynamically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/x-icon, image/png, image/jpeg'; // Accept icon or image files

        // Add a change event listener to handle file selection
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create or update the favicon link element
                    let favicon = document.querySelector('link[rel="icon"]');
                    if (!favicon) {
                        favicon = document.createElement('link');
                        favicon.rel = 'icon';
                        document.head.appendChild(favicon);
                    }
                    favicon.href = e.target.result; // Set the favicon to the selected file
                };
                reader.readAsDataURL(file); // Read the file as a data URL
            }
        });

        // Trigger the file input click to open the file chooser dialog
        fileInput.click();
    });
});
