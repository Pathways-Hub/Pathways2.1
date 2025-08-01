let pluginCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
  const starButton = document.getElementById('starButton');
  if (!starButton) {
    console.warn('#starButton not found');
    return;
  }

  // Load existing plugins
  loadPluginsFromStorage();

  starButton.addEventListener('click', () => {
    const starIcon = starButton.querySelector('i');
    const isStarring = starIcon.classList.contains('fa-regular');

    if (isStarring) {
      starIcon.classList.remove('fa-regular');
      starIcon.classList.add('fa-solid');
      starIcon.style.color = 'gold';

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.js';
      input.style.display = 'none';

      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          const code = e.target.result;
          const name = file.name;

          addPluginToSidebar({ name, code });
          savePluginToStorage({ name, code });
        };
        reader.readAsText(file);
      };

      document.body.appendChild(input);
      input.click();
    } else {
      starIcon.classList.remove('fa-solid');
      starIcon.classList.add('fa-regular');
      starIcon.style.color = '';
    }
  });
});

// 🧠 Utility: Prettify name
function prettifyFileName(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// 💾 Save to localStorage
function savePluginToStorage(plugin) {
  const plugins = JSON.parse(localStorage.getItem('plugins') || '[]');
  plugins.push(plugin);
  localStorage.setItem('plugins', JSON.stringify(plugins));
}

// 🧹 Remove from localStorage
function deletePluginFromStorage(name) {
  let plugins = JSON.parse(localStorage.getItem('plugins') || '[]');
  plugins = plugins.filter(p => p.name !== name);
  localStorage.setItem('plugins', JSON.stringify(plugins));
}

// 📦 Load all plugins
function loadPluginsFromStorage() {
  const plugins = JSON.parse(localStorage.getItem('plugins') || '[]');
  plugins.forEach(plugin => {
    addPluginToSidebar(plugin);
  });
}

// 🎯 Add plugin to UI
function addPluginToSidebar({ name, code }) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    alert("Sidebar element not found.");
    return;
  }

  if (pluginCounter === 0) {
    const hr = document.createElement('hr');
    hr.className = 'plugin-separator';
    hr.style.width = '60%';
    hr.style.margin = '10px 0';
    hr.style.border = '1px solid #ccc';
    sidebar.appendChild(hr);
  }

  const pluginButton = document.createElement('button');
  pluginButton.className = 'plugin-button icon-button';
  pluginButton.style.position = 'relative';

  const pluginImg = document.createElement('img');
  const iconUrlMatch = code.match(/https?:\/\/\S+\.(png|jpg|jpeg|gif)/i);
  pluginImg.src = iconUrlMatch ? iconUrlMatch[0] : 'images/na_plugin.png';
  pluginImg.alt = 'Plugin Icon';
  pluginImg.className = 'plugin-img';

  pluginButton.appendChild(pluginImg);
  sidebar.appendChild(pluginButton);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'plugin-tooltip';
  tooltip.textContent = prettifyFileName(name);
  Object.assign(tooltip.style, {
    position: 'fixed',
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    zIndex: '99999'
  });
  document.body.appendChild(tooltip);

  pluginButton.addEventListener('mouseenter', () => {
    const rect = pluginButton.getBoundingClientRect();
    tooltip.style.top = rect.top + rect.height / 2 + 'px';
    tooltip.style.left = rect.right + 12 + 'px';
    tooltip.style.transform = 'translateY(-60%)';
    tooltip.style.opacity = '1';
    tooltip.style.pointerEvents = 'auto';
    setTimeout(() => {
      tooltip.style.transform = 'translateY(-50%)';
    }, 10);
  });

  pluginButton.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.transform = 'translateY(-60%)';
  });

  // Load plugin code
  pluginButton.addEventListener('click', () => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = code;
    document.body.appendChild(script);
  });

  // Delete menu
  const deleteMenu = document.createElement('div');
  deleteMenu.textContent = 'Delete';
  Object.assign(deleteMenu.style, {
    position: 'fixed',
    background: 'black',
    color: 'white',
    padding: '6px 12px',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'none',
    zIndex: '100000',
    transition: 'background 0.2s ease'
  });

  deleteMenu.addEventListener('mouseenter', () => {
    deleteMenu.style.background = 'red';
  });
  deleteMenu.addEventListener('mouseleave', () => {
    deleteMenu.style.background = 'black';
  });
  deleteMenu.addEventListener('click', () => {
    pluginButton.remove();
    tooltip.remove();
    deleteMenu.style.display = 'none';
    deletePluginFromStorage(name);

    const remainingPlugins = sidebar.querySelectorAll('.plugin-button');
    if (remainingPlugins.length === 0) {
      const separator = sidebar.querySelector('.plugin-separator');
      if (separator) separator.remove();
      pluginCounter = 0;
    } else {
      pluginCounter--;
    }
  });

  document.body.appendChild(deleteMenu);

  pluginButton.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = pluginButton.getBoundingClientRect();
    deleteMenu.style.top = `${rect.top}px`;
    deleteMenu.style.left = `${rect.right + 10}px`;
    deleteMenu.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (e.target !== deleteMenu) {
      deleteMenu.style.display = 'none';
    }
  });

  pluginCounter++;
}
