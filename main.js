document.addEventListener('DOMContentLoaded', () => {

    /**
     * 1. Intersection Observer for Section Reveals
     * Fades in sections as they scroll into view.
     */
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // triggers when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // observe only once
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });


    /**
     * 2. Live Preview Functionality
     * Handles loading a user-provided URL into the sandboxed iframe.
     */
    const urlInput = document.getElementById('urlInput');
    const loadPreviewBtn = document.getElementById('loadPreview');
    const previewFrame = document.getElementById('previewFrame');
    const weatherControls = document.getElementById('weather-controls');

    const loadUrlInPreview = () => {
        let url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }

        // Basic check to ensure a protocol is present.
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // To prevent CORS issues for many sites, we can use a proxy.
        // For this demo, we'll try a direct load, which works for sites with permissive policies.
        // A production version would need a more robust solution.
        console.log(`Attempting to load: ${url}`);
        previewFrame.src = url;
    };

    previewFrame.addEventListener('load', () => {
        console.log('Iframe loaded successfully.');
        weatherControls.classList.remove('hidden');
    });

    previewFrame.addEventListener('error', (e) => {
        console.error('Error loading URL in iframe.', e);
        alert('Could not load the specified URL. The site may have security policies (like X-Frame-Options) that prevent it from being embedded.');
    });

    loadPreviewBtn.addEventListener('click', loadUrlInPreview);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            loadUrlInPreview();
        }
    });


    /**
     * 3. Weather State Machine
     * Manages the active weather overlay.
     */
    const weatherOverlays = document.querySelectorAll('.weather-overlay');

    // State management for the current weather effect
    const weatherController = {
        currentWeather: 'none',

        setWeather(weather) {
            if (this.currentWeather === weather) return;

            // Deactivate all overlays
            weatherOverlays.forEach(overlay => overlay.classList.remove('active'));

            // Activate the selected overlay
            if (weather !== 'none') {
                const activeOverlay = document.querySelector(`.weather-overlay.${weather}`);
                if (activeOverlay) {
                    activeOverlay.classList.add('active');
                }
            }

            this.currentWeather = weather;
            console.log(`Weather changed to: ${weather}`);
        }
    };

    weatherControls.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const weatherType = e.target.dataset.weather;
            if (weatherType) {
                // Update button active states
                weatherControls.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active-weather');
                });
                e.target.classList.add('active-weather');

                weatherController.setWeather(weatherType);
            }
        }
    });

});
