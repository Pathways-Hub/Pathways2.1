document.addEventListener('DOMContentLoaded', function() {
    // Your code goes here
    // Create a container for the text
    const container = document.createElement('div');
    
    // Set styles for the container
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)'; // Center the container
    container.style.textAlign = 'center'; // Center the text within the container
    
    // Create the main text element
    const mainText = document.createElement('h1');
    mainText.textContent = 'Click anywhere to start';
    mainText.style.color = '#D1CFC9'; // Darker off-white color
    mainText.style.margin = '0'; // Remove default margin
    mainText.style.fontSize = '3em'; // Increase font size
    
    // Create the smaller text element
    const subText = document.createElement('p');
    subText.textContent = 'or import existing files with Ctrl + L';
    subText.style.color = '#D1CFC9'; // Darker off-white color
    subText.style.margin = '0'; // Remove default margin
    subText.style.fontSize = '1em'; // Increase font size for better visibility
    
    // Append text elements to the container
    container.appendChild(mainText);
    container.appendChild(subText);
    
    // Append the container to the body
    document.body.appendChild(container);
    
    // Hide the text when clicking anywhere on the page
    document.addEventListener('click', function() {
        container.style.display = 'none'; // Hide the container
    });
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none'; // Hide the file input
    
    // Append the file input to the body
    document.body.appendChild(fileInput);
    
    // Listen for Ctrl + B key combination
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault(); // Prevent the default behavior
            fileInput.click(); // Trigger the file input dialog
        }
    });
});
