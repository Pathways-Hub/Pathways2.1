// === Emoji icon list ===
const emojiIcons = [
  'fa-face-smile',
  'fa-face-laugh',
  'fa-face-grin-stars',
  'fa-face-grin-beam',
  'fa-face-kiss-wink-heart',
  'fa-face-surprise'
];

let currentIndex = 0;
let panelOpen = false;

// === Inject animations into the page ===
const rockingStyle = document.createElement('style');
rockingStyle.textContent = `

@keyframes riseAndRockLeft {
  0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  20%  { transform: translateY(-40px) rotate(-20deg) scale(1.1); }
  40%  { transform: translateY(-80px) rotate(20deg)  scale(1.2); }
  60%  { transform: translateY(-120px) rotate(-20deg) scale(1.3); }
  80%  { transform: translateY(-160px) rotate(20deg) scale(1.4); }
  100% { transform: translateY(-200px) rotate(0deg)  scale(1.5); opacity: 0; }
}

@keyframes riseAndRockRight {
  0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  20%  { transform: translateY(-40px) rotate(20deg) scale(1.1); }
  40%  { transform: translateY(-80px) rotate(-20deg) scale(1.2); }
  60%  { transform: translateY(-120px) rotate(20deg) scale(1.3); }
  80%  { transform: translateY(-160px) rotate(-20deg) scale(1.4); }
  100% { transform: translateY(-200px) rotate(0deg) scale(1.5); opacity: 0; }
}
`;
document.head.appendChild(rockingStyle);

// === Create emoji circle ===
const emojiCircle = document.createElement('div');
emojiCircle.id = 'emoji-circle';
document.body.appendChild(emojiCircle);

// === Create icon ===
const icon = document.createElement('i');
icon.className = `fa-solid ${emojiIcons[currentIndex]}`;
emojiCircle.appendChild(icon);

// === Create expanding panel (behind the circle) ===
const panel = document.createElement('div');
panel.id = 'emoji-panel';
document.body.appendChild(panel);

// === Create 4 colored emoji spans ===
const coloredEmojis = ['👍', '😂', '😍', '😮'];
coloredEmojis.forEach(e => {
  const span = document.createElement('span');
  span.textContent = e;
  Object.assign(span.style, {
    fontSize: '24px',
    margin: '0 10px',
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  });
  panel.appendChild(span);

  span.addEventListener('mouseenter', () => {
    span.style.transform = 'scale(1.3)';
  });
  span.addEventListener('mouseleave', () => {
    span.style.transform = 'scale(1)';
  });

  // Click handler: spawn rising + rocking emojis
  span.addEventListener('click', () => {
    spawnRisingEmojis(e, 20);
  });
});

// === Style: Emoji Circle ===
Object.assign(emojiCircle.style, {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '60px',
  height: '60px',
  backgroundColor: '#fff',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  zIndex: '1001',
  cursor: 'pointer'
});

// === Style: Icon ===
Object.assign(icon.style, {
  color: '#666',
  fontSize: '28px',
  transition: 'opacity 0.3s ease'
});

// === Style: Panel behind circle ===
Object.assign(panel.style, {
  position: 'fixed',
  bottom: '30px',
  right: '100px',
  width: '0px',
  height: '40px',
  backgroundColor: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'width 0.3s ease, padding 0.3s ease',
  padding: '0px',
  overflow: 'hidden',
  zIndex: '1000'
});

// === Functions to open/close panel ===
function openPanel() {
  if (panelOpen) return;
  panelOpen = true;
  panel.style.width = '180px';
  panel.style.padding = '0 10px';

  icon.style.opacity = '0';
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % emojiIcons.length;
    icon.className = `fa-solid ${emojiIcons[currentIndex]}`;
    icon.style.opacity = '1';
  }, 200);
}

function closePanel() {
  if (!panelOpen) return;
  panelOpen = false;
  panel.style.width = '0px';
  panel.style.padding = '0px';
}

// === Hover Behavior on circle and panel ===
emojiCircle.addEventListener('mouseenter', openPanel);
emojiCircle.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!panel.matches(':hover') && !emojiCircle.matches(':hover')) {
      closePanel();
    }
  }, 100);
});

panel.addEventListener('mouseenter', openPanel);
panel.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!panel.matches(':hover') && !emojiCircle.matches(':hover')) {
      closePanel();
    }
  }, 100);
});

// === Spawn rising emojis with alternating rocking direction ===
function spawnRisingEmojis(emojiChar, count) {
  for (let i = 0; i < count; i++) {
    const e = document.createElement('div');
    e.textContent = emojiChar;
    const startX = Math.random() * window.innerWidth;
    const delay = Math.random() * 600;

    const alternate = Math.random() < 0.5 ? 'riseAndRockLeft' : 'riseAndRockRight';

    Object.assign(e.style, {
      position: 'fixed',
      bottom: '-30px',
      left: `${startX}px`,
      fontSize: '24px',
      pointerEvents: 'none',
      opacity: '1',
      userSelect: 'none',
      zIndex: '2000',
      animation: `${alternate} 2s linear forwards`,
      animationDelay: `${delay}ms`
    });

    document.body.appendChild(e);

    setTimeout(() => {
      e.remove();
    }, 2600 + delay);
  }
}
