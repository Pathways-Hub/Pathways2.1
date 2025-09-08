document.addEventListener('DOMContentLoaded', () => {
  const menu = document.createElement('div');
  menu.id = 'custom-context-menu';
  menu.style.position = 'absolute';
  menu.style.background = 'black';
  menu.style.color = 'white';
  menu.style.padding = '8px 0';
  menu.style.borderRadius = '12px';
  menu.style.display = 'none';
  menu.style.zIndex = '10000';
  menu.style.fontFamily = 'inherit';
  menu.style.fontSize = '14px';
  menu.style.minWidth = '210px';
  menu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Avoid loading the same script multiple times
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  function runCommentScript(x, y) {
    loadScript('appDependance/quickMenus/comment.js')
      .then(() => {
        if (typeof window.spawnCommentInput === 'function') {
          window.spawnCommentInput(x, y);
        } else {
          console.error('spawnCommentInput function not found.');
        }
      })
      .catch(console.error);
  }

  function addMenuItem(text, symbol, onClick) {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '10px 12px';
    item.style.cursor = 'pointer';
    item.style.userSelect = 'none';

    const label = document.createElement('span');
    label.textContent = text;

    const sym = document.createElement('span');
    sym.textContent = symbol;
    sym.style.opacity = '0.6';
    sym.style.fontSize = '16px';
    sym.style.fontWeight = 'bold';
    sym.style.marginLeft = '8px';

    item.appendChild(label);
    item.appendChild(sym);

    item.addEventListener('mouseenter', () => { item.style.background = '#333'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'black'; });
    item.addEventListener('click', () => {
      onClick();
      hideMenu();
    });

    menu.appendChild(item);
  }

  // Menu items
  addMenuItem('Element', ';', () => console.log('Element clicked'));
  addMenuItem('Comment', ',', () => runCommentScript(lastRightClickX, lastRightClickY));
  addMenuItem('Container', '.', () => {
    loadScript('quickMenus/container.js')
      .then(() => {
        if (typeof window.spawnContainer === "function") {
          window.spawnContainer(lastRightClickX, lastRightClickY);
        }
      })
      .catch(console.error);
  });
  addMenuItem('Label', '/', () => console.log('Label clicked'));

  // Separator
  const separator = document.createElement('div');
  separator.style.width = '80%';
  separator.style.height = '1px';
  separator.style.background = '#555';
  separator.style.margin = '6px auto';
  menu.appendChild(separator);

  // Bottom button
  addMenuItem("Toggle comments", "#", () => {
    if (typeof window.toggleComments === 'function') {
      window.toggleComments();
    }
  });

  document.body.appendChild(menu);

  // Context menu logic
  let rightClickStartPos = null;
  let dragDistance = 0;
  let lastRightClickX = 0;
  let lastRightClickY = 0;

  function showMenu(x, y) {
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
  }

  function hideMenu() {
    menu.style.display = 'none';
  }

  document.body.addEventListener('mousedown', e => {
    if (e.button === 2) {
      rightClickStartPos = { x: e.clientX, y: e.clientY };
      lastRightClickX = e.clientX;
      lastRightClickY = e.clientY;
      dragDistance = 0;
    }
  });

  document.body.addEventListener('mousemove', e => {
    if (rightClickStartPos) {
      const dx = e.clientX - rightClickStartPos.x;
      const dy = e.clientY - rightClickStartPos.y;
      dragDistance = Math.sqrt(dx * dx + dy * dy);
    }
  });

  document.body.addEventListener('mouseup', e => {
    if (e.button === 2) {
      if (dragDistance < 5) {
        if (!e.target.closest('.centeredSquare, .your-other-ui-classes')) {
          e.preventDefault();
          showMenu(e.pageX, e.pageY);
        }
      }
      rightClickStartPos = null;
      dragDistance = 0;
    }
  });

  document.addEventListener('mousedown', e => {
    if (!menu.contains(e.target)) hideMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideMenu();
    if (e.key === ',' && e.ctrlKey) {
      e.preventDefault();
      hideMenu();
      runCommentScript(lastRightClickX, lastRightClickY);
    }
  });
});
