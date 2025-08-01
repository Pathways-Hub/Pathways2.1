window.onload = function () {
    // === Create the main container ===
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loadingContainer';
    Object.assign(loadingContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999'
    });

    // === Style for fading edges ===
    const style = document.createElement('style');
    style.textContent = `
        #sliderFrame::before, #sliderFrame::after {
            content: "";
            position: absolute;
            top: 0;
            width: 120px;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        }
        #sliderFrame::before {
            left: 0;
            background: linear-gradient(to right, white 0%, rgba(255,255,255,0) 100%);
        }
        #sliderFrame::after {
            right: 0;
            background: linear-gradient(to left, white 0%, rgba(255,255,255,0) 100%);
        }
    `;
    document.head.appendChild(style);

    // === Slider frame (viewport) ===
    const sliderFrame = document.createElement('div');
    sliderFrame.id = 'sliderFrame';
    Object.assign(sliderFrame.style, {
        width: '220px',
        overflow: 'hidden',
        position: 'relative'
    });

    // === Inner slider (moving element) ===
    const slider = document.createElement('div');
    slider.id = 'slider';
    Object.assign(slider.style, {
        display: 'flex',
        flexDirection: 'row',
        gap: '30px',
        transform: 'translateX(0)'
    });

    // === Image paths ===
    const imagePaths = [
        'website/images/pwu1.png',
        'website/images/pwu2.png',
        'website/images/pwu3.png',
        'website/images/pwu4.png'
    ];
    const totalImages = imagePaths.length;
    const imageWidth = 220;
    const imageGap = 30;

    // Duplicate images for seamless loop
    const fullImageSet = [...imagePaths, ...imagePaths];
    fullImageSet.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        Object.assign(img.style, {
            width: `${imageWidth}px`,
            height: 'auto',
            flexShrink: '0'
        });
        slider.appendChild(img);
    });

    sliderFrame.appendChild(slider);
    loadingContainer.appendChild(sliderFrame);
    document.body.appendChild(loadingContainer);

    // === Sliding logic with exact 1s per image ===
    let index = 0;

    function slideToNext() {
        // Start transition
        slider.style.transition = 'transform 0.5s ease-in-out';
        const offset = (index + 1) * (imageWidth + imageGap);
        slider.style.transform = `translateX(-${offset}px)`;

        // After sliding, pause for 1s before moving again
        setTimeout(() => {
            index++;

            // Reset after full loop
            if (index >= totalImages) {
                slider.style.transition = 'none';
                slider.style.transform = 'translateX(0)';
                index = 0;

                // Give browser time to reset before restarting
                setTimeout(slideToNext, 1000);
            } else {
                setTimeout(slideToNext, 1000); // Next pause before next slide
            }
        }, 500); // Wait for slide to finish
    }

    // Start after 1 second initial delay (so first image also shows for 1s)
    setTimeout(() => {
        slideToNext();
    }, 1000);

    // === Hide loader after random duration
    const duration = Math.random() * (10000 - 2000) + 2000;
    setTimeout(() => {
        loadingContainer.style.display = 'none';
    }, duration);
};
