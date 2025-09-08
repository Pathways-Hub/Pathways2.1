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
@keyframes riseStraight {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  70%  { transform: translateY(-140px) scale(1.4); opacity: 1; }
  100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
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

// === Image-based "emojis" ===
const emojiImages = [
  { src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Thumbs%20Up.png", alt: "Thumbs Up" },
  { src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Tears%20of%20Joy.png", alt: "Face with Tears of Joy" },
  { src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Red%20Heart.png", alt: "Red Heart" },
  { src: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hushed%20Face.png", alt: "Hushed Face" }
];

emojiImages.forEach(({ src, alt }) => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.width = 30;
  img.height = 30;
  Object.assign(img.style, {
    margin: '0 10px',
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  });
  panel.appendChild(img);

  img.addEventListener('mouseenter', () => {
    img.style.transform = 'scale(1.3)';
  });
  img.addEventListener('mouseleave', () => {
    img.style.transform = 'scale(1)';
  });

  img.addEventListener('click', () => {
    spawnRisingEmojis(src, alt, 20);
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

// === Style: Panel ===
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

// === Open/Close panel ===
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

// === Hover Behavior ===
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

// === Spawn rising images instead of text ===
function spawnRisingEmojis(src, alt, count) {
  for (let i = 0; i < count; i++) {
    const e = document.createElement('img');
    e.src = src;
    e.alt = alt;
    e.width = 50;
    e.height = 50;
    const startX = Math.random() * window.innerWidth;
    const delay = Math.random() * 600;

    Object.assign(e.style, {
      position: 'fixed',
      bottom: '-50px',
      left: `${startX}px`,
      pointerEvents: 'none',
      opacity: '1',
      userSelect: 'none',
      zIndex: '2000',
      animation: `riseStraight 2s linear forwards`,
      animationDelay: `${delay}ms`
    });

    document.body.appendChild(e);

    setTimeout(() => {
      e.remove();
    }, 2600 + delay);
  }
}
