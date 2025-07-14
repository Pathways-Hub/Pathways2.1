// Add an event listener to the save button
const saveButton = document.getElementById('save');

saveButton.addEventListener('click', () => {
    // Get the HTML content of the workspace (instead of the entire document)
    const htmlContent = document.documentElement.outerHTML;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });

    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workspace.html'; // Name of the file to be saved

    // Simulate a click to download
    document.body.appendChild(a);
    a.click()
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    console.log("✅ Workspace saved successfully!");
});

// Add an event listener to the load button
const loadButton = document.getElementById('load');

loadButton.addEventListener('click', () => {
    // Create an input element to select files
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/html';

    // Listen for file selection
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            // Read the file content
            reader.onload = (e) => {
                const newHtmlContent = e.target.result;

                // Parse the loaded HTML content
                const parser = new DOMParser();
                const doc = parser.parseFromString(newHtmlContent, 'text/html');

                // Extract the new <body> content
                document.body.innerHTML = doc.body.innerHTML;

                console.log("✅ Workspace loaded successfully!");

                // Reload all script files after loading new content
                reloadScripts(doc);
            };

            reader.readAsText(file);
        }
    });

    // Simulate a file selection dialog
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
});

// Function to reload JavaScript files after loading
function reloadScripts(doc) {
    console.log('🔄 Reinitializing scripts...');

    // Remove old scripts
    document.querySelectorAll("script").forEach(script => script.remove());

    // Find and reload script files
    doc.querySelectorAll('script[src]').forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        newScript.async = false; // Preserve execution order
        document.body.appendChild(newScript);
    });

    // Reattach event listeners
    reinitializeEventListeners();
}

// Function to reattach event listeners
function reinitializeEventListeners() {
    console.log('🔄 Reattaching event listeners...');

    document.querySelectorAll('.icon-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Button ${button.id} clicked`);
        });
    });

    document.getElementById('save').addEventListener('click', saveButton.click);
    document.getElementById('load').addEventListener('click', loadButton.click);
}
