document.addEventListener("DOMContentLoaded", () => {
  const messages = document.getElementById("messages");
  const codeTool = Array.from(document.querySelectorAll(".tool")).find(el =>
    el.textContent.includes("Code")
  );

  if (codeTool) {
    codeTool.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".js,.ts,.py,.java,.c,.cpp,.html,.css,.json,.txt";
      input.click();

      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          const content = e.target.result;
          const lines = content.split("\n");
          const isLong = lines.length > 5;
          const preview = lines.slice(0, 5).join("\n");

          const ext = file.name.split(".").pop();
          const langMap = {
            js: "JavaScript",
            ts: "TypeScript",
            py: "Python",
            java: "Java",
            c: "C",
            cpp: "C++",
            html: "HTML",
            css: "CSS",
            json: "JSON",
            txt: "Text"
          };
          const lang = langMap[ext] || "Unknown";

          const container = document.createElement("div");
          container.className = "message outgoing";
          container.innerHTML = `
            <div class="bubble">
              <div class="code-meta">${file.name} – ${lang}</div>
              <div class="code-message" id="codeBlock"></div>
              <div class="code-buttons">
                ${isLong ? `<button class="show-more">Show more</button>` : ""}
                <button class="copy-code">Copy</button>
                <button class="save-code">Save</button>
              </div>
            </div>
          `;

          messages.appendChild(container);
          messages.scrollTop = messages.scrollHeight;

          const codeBlock = container.querySelector(".code-message");
          codeBlock.textContent = preview; // <-- FIX: set preview content on load

          if (isLong) {
            container.querySelector(".show-more").addEventListener("click", (e) => {
              if (codeBlock.classList.toggle("expanded")) {
                codeBlock.textContent = content;
                e.target.textContent = "Show less";
              } else {
                codeBlock.textContent = preview;
                e.target.textContent = "Show more";
              }
            });
          }

          container.querySelector(".copy-code").addEventListener("click", () => {
            navigator.clipboard.writeText(content);
          });

          container.querySelector(".save-code").addEventListener("click", () => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
            a.download = file.name;
            a.click();
          });
        };

        reader.readAsText(file);
      });
    });
  }
});
