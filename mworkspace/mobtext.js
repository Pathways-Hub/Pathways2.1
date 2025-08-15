(() => {
  const workspace = document.getElementById("workspace");

  workspace.addEventListener("click", (e) => {
    if (e.target !== workspace) return;

    const box = document.createElement("div");
    box.classList.add("text-box");
    box.contentEditable = "true";

    // Make text 2x size and Arial font
    box.style.fontSize = "2em";
    box.style.fontFamily = "Arial, sans-serif";

    const rect = workspace.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    box.style.left = `${x}px`;
    box.style.top = `${y}px`;

    workspace.appendChild(box);

    let enterPressed = false;

    box.focus();

    const onKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        enterPressed = true;
        box.blur();
      }
    };

    const onBlur = () => {
      if (!enterPressed) {
        box.remove();
      }
      box.removeEventListener("keydown", onKeyDown);
      box.removeEventListener("blur", onBlur);
    };

    box.addEventListener("keydown", onKeyDown);
    box.addEventListener("blur", onBlur);
  });
})();
