document.addEventListener('DOMContentLoaded', () => {
    const musicButton = document.getElementById('musicButton');
    const deleteButton = document.getElementById('binButton');
    let currentlySelected = null;

    const STORAGE_KEY = 'customAudioContainers';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    function loadSavedAudios() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;
        const audios = JSON.parse(savedData);
        audios.forEach(data => {
            createAudioElement(data.src, data.left, data.top, data.id, data.name);
        });
    }

    function saveAudios() {
        const containers = document.querySelectorAll('.audio-container');
        const audiosData = [];
        containers.forEach(c => {
            audiosData.push({
                id: c.id,
                src: c.querySelector('audio').src,
                left: c.style.left,
                top: c.style.top,
                name: c.getAttribute('data-name') || 'Unknown'
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(audiosData));
    }

    function createAudioElement(src, left = '50px', top = '50px', id = null, name = 'Unknown') {
        const audioContainer = document.createElement('div');
        audioContainer.classList.add('audio-container');
        audioContainer.style.position = 'absolute';
        audioContainer.style.left = left;
        audioContainer.style.top = top;
        audioContainer.style.border = '2px solid transparent';
        audioContainer.style.padding = '5px';
        audioContainer.style.cursor = 'move';
        audioContainer.style.display = 'flex';
        audioContainer.style.alignItems = 'center';
        audioContainer.style.gap = '8px';
        audioContainer.style.background = 'transparent';  // removed grey background
        audioContainer.style.borderRadius = '5px';
        audioContainer.id = id || 'audio-' + Date.now();
        audioContainer.setAttribute('data-name', name);

        // Audio element (hidden)
        const audio = document.createElement('audio');
        audio.src = src;
        audio.preload = 'metadata';

        // Play/Pause button container (fixed width to avoid shifting)
        const playPauseContainer = document.createElement('div');
        playPauseContainer.style.width = '18px';
        playPauseContainer.style.display = 'flex';
        playPauseContainer.style.justifyContent = 'center';
        playPauseContainer.style.alignItems = 'center';

        // Play/Pause button
        const playPauseBtn = document.createElement('i');
        playPauseBtn.className = 'fa-solid fa-play';
        playPauseBtn.style.cursor = 'pointer';
        playPauseBtn.style.fontSize = '18px';
        playPauseBtn.style.color = 'black';
        playPauseBtn.title = 'Play/Pause';

        playPauseContainer.appendChild(playPauseBtn);

        // Duration text
        const durationText = document.createElement('span');
        durationText.style.fontSize = '12px';
        durationText.style.minWidth = '40px';
        durationText.style.color = 'black';
        durationText.innerText = '--:--';

        // Current time text (format 00:00/00:00)
        const currentTimeText = document.createElement('span');
        currentTimeText.style.fontSize = '12px';
        currentTimeText.style.minWidth = '70px';
        currentTimeText.style.color = 'black';
        currentTimeText.innerText = '00:00/00:00';

        // Canvas for visualizer + dot
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 40;
        canvas.style.display = 'block';
        canvas.style.cursor = 'pointer';

        audioContainer.appendChild(playPauseContainer);
        audioContainer.appendChild(canvas);
        audioContainer.appendChild(durationText);
        audioContainer.appendChild(currentTimeText);
        audioContainer.appendChild(audio);
        document.body.appendChild(audioContainer);

        const ctx = canvas.getContext('2d');
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audio.addEventListener('loadedmetadata', () => {
            durationText.innerText = formatTime(audio.duration);
            currentTimeText.innerText = formatTime(0) + '/' + formatTime(audio.duration);
            renderFrame();
        });

        audio.addEventListener('timeupdate', () => {
            currentTimeText.innerText = formatTime(audio.currentTime) + '/' + formatTime(audio.duration);
        });

        function formatTime(sec) {
            if (isNaN(sec)) return '--:--';
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        playPauseBtn.addEventListener('click', () => {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (audio.paused) {
                audio.play();
                playPauseBtn.className = 'fa-solid fa-pause';
                draw();
            } else {
                audio.pause();
                playPauseBtn.className = 'fa-solid fa-play';
                renderFrame();
            }
        });

        // Clear canvas helper
        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Draw static line and progress dot (no animation loop)
        function renderFrame() {
            clearCanvas();
            // draw 1px center line
            ctx.fillStyle = 'black';
            ctx.fillRect(0, canvas.height / 2 - 0.5, canvas.width, 1);

            // draw progress dot
            const centerY = canvas.height / 2;
            const progress = audio.duration ? (audio.currentTime / audio.duration) : 0;
            const dotX = progress * canvas.width;

            ctx.beginPath();
            ctx.arc(dotX, centerY, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
        }

        // Animated visualizer + dot when playing
        function draw() {
            if (audio.paused) {
                renderFrame();
                return;
            }

            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            clearCanvas();

            const centerY = canvas.height / 2;
            const centerX = canvas.width / 2;
            const barWidth = 4;
            const spacing = 2;
            const totalBars = Math.floor(bufferLength / 2);
            const maxBarHeight = 18;

            // center line behind bars
            ctx.fillStyle = 'black';
            ctx.fillRect(0, centerY - 0.5, canvas.width, 1);

            for (let i = 0; i < totalBars; i++) {
                const value = dataArray[i] / 255;
                let height = value * maxBarHeight;
                if (height < 1) height = 1;

                const xR = centerX + i * (barWidth + spacing);
                const xL = centerX - (i + 1) * (barWidth + spacing);

                drawRoundedBar(xR, centerY, barWidth, height);
                drawRoundedBar(xL, centerY, barWidth, height);
            }

            // draw progress dot on top
            const progress = audio.duration ? (audio.currentTime / audio.duration) : 0;
            const dotX = progress * canvas.width;
            ctx.beginPath();
            ctx.arc(dotX, centerY, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
        }

        function drawRoundedBar(x, centerY, width, height) {
            const radius = width / 2;
            ctx.fillStyle = 'black';

            // top bump
            ctx.beginPath();
            ctx.moveTo(x, centerY - height);
            ctx.arcTo(x + radius, centerY - height, x + radius, centerY, radius);
            ctx.arcTo(x + radius, centerY, x, centerY, radius);
            ctx.closePath();
            ctx.fill();

            // bottom bump
            ctx.beginPath();
            ctx.moveTo(x, centerY + height);
            ctx.arcTo(x + radius, centerY + height, x + radius, centerY, radius);
            ctx.arcTo(x + radius, centerY, x, centerY, radius);
            ctx.closePath();
            ctx.fill();
        }

        // Seek logic: click or drag on canvas moves playback time
        function seekAudio(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.min(Math.max(x / canvas.width, 0), 1);
            audio.currentTime = percent * audio.duration;
            renderFrame();
        }

        let isDraggingDot = false;

        canvas.addEventListener('mousedown', (e) => {
            isDraggingDot = true;
            seekAudio(e);
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingDot) {
                isDraggingDot = false;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDraggingDot) return;
            seekAudio(e);
        });

        clearCanvas();
        renderFrame();

        // Dragging the entire container logic
        let offsetX, offsetY, isDragging = false;

        audioContainer.addEventListener('mousedown', (e) => {
            // Ignore dragging if clicked on canvas (for dot seeking) or play button
            if (e.target === canvas || e.target === playPauseBtn) return;

            isDragging = true;
            offsetX = e.clientX - parseFloat(audioContainer.style.left);
            offsetY = e.clientY - parseFloat(audioContainer.style.top);
            audioContainer.style.zIndex = 1000;

            selectAudio(audioContainer);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            audioContainer.style.left = (e.clientX - offsetX) + 'px';
            audioContainer.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                audioContainer.style.zIndex = '';
                saveAudios();
            }
        });

        function selectAudio(container) {
            if (currentlySelected && currentlySelected !== container) {
                currentlySelected.classList.remove('selected-audio');
                currentlySelected.style.border = '2px solid transparent';
            }
            currentlySelected = container;
            currentlySelected.classList.add('selected-audio');
            currentlySelected.style.border = '2px solid red';
        }

        audioContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            selectAudio(audioContainer);
        });

        audio.addEventListener('ended', () => {
            playPauseBtn.className = 'fa-solid fa-play';
            renderFrame();
        });

        saveAudios();
    }

    musicButton.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const fileURL = URL.createObjectURL(file);
        createAudioElement(fileURL, '50px', '50px', null, file.name);
    });

    deleteButton.addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.remove();
            currentlySelected = null;
            saveAudios();
        }
    });

    // Deselect audio on background click
    document.addEventListener('click', () => {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected-audio');
            currentlySelected.style.border = '2px solid transparent';
            currentlySelected = null;
        }
    });

    // Load saved audio elements on page load
    loadSavedAudios();
});
