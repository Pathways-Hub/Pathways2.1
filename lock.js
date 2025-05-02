document.addEventListener("DOMContentLoaded", function() {
    // Disable right-click on the page
    document.addEventListener("contextmenu", function(event) {
        event.preventDefault(); // Prevent the right-click menu from appearing
    });

    // Create the lock screen container
    const lockScreen = document.createElement("div");
    lockScreen.style.position = "fixed";
    lockScreen.style.top = "0";
    lockScreen.style.left = "0";
    lockScreen.style.width = "100vw";
    lockScreen.style.height = "100vh";
    lockScreen.style.backgroundColor = "white";
    lockScreen.style.display = "flex";
    lockScreen.style.flexDirection = "column";
    lockScreen.style.justifyContent = "center";
    lockScreen.style.alignItems = "center";
    lockScreen.style.zIndex = "10000"; // Ensure it's on top of everything

    // Create the image element for the logo
    const logoImage = document.createElement("img");
    logoImage.src = "images/Pathwaystl.png"; // Path to your image
    logoImage.alt = "Pathways Logo";
    logoImage.style.width = "200px"; // Adjust size as needed
    logoImage.style.marginBottom = "20px"; // Space between image and text

    // Create the message container
    const messageContainer = document.createElement("div");
    messageContainer.style.textAlign = "center";
    messageContainer.style.marginBottom = "20px"; // Space between message and input

    // Create the message text elements
    const betaMessage = document.createElement("p");
    betaMessage.innerText = "This website is currently in a closed beta and is not accessible to the public";
    betaMessage.style.fontSize = "18px";
    betaMessage.style.color = "black";
    betaMessage.style.margin = "0";

    const accessCodeMessage = document.createElement("p");
    accessCodeMessage.innerText = "Please type in the access code";
    accessCodeMessage.style.fontSize = "18px";
    accessCodeMessage.style.color = "black";
    accessCodeMessage.style.margin = "10px 0 0 0"; // Small space above

    // Append messages to the message container
    messageContainer.appendChild(betaMessage);
    messageContainer.appendChild(accessCodeMessage);

    // Create the input field for the code
    const input = document.createElement("input");
    input.type = "password"; // Password input to hide code
    input.placeholder = "Enter code";
    input.style.fontSize = "24px";
    input.style.padding = "10px";
    input.style.border = "2px solid black";
    input.style.borderRadius = "5px";
    input.style.textAlign = "center";
    input.style.marginTop = "10px";

    // Append logo, message, and input to the lock screen
    lockScreen.appendChild(logoImage); // Append logo above text
    lockScreen.appendChild(messageContainer);
    lockScreen.appendChild(input);
    document.body.appendChild(lockScreen);

    // Correct unlock code
    const correctCode = "pathwaysaccess123!"; // Change this to the required code

    // Event listener for keypress (check code on Enter key)
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            if (input.value === correctCode) {
                // Remove the lock screen on correct code entry
                document.body.removeChild(lockScreen);
            } else {
                // Clear input if code is incorrect
                input.value = "";
                alert("Incorrect code, please try again.");
            }
        }
    });

    // Automatically focus on the input field on page load
    input.focus();
});
