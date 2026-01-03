/**
 * @file Main JavaScript file for the Weather Widget landing page.
 * @description Handles section reveal animations, iframe preview loading, and weather overlay effects.
 */

'use strict';

/**
 * @class RainEffect
 * @description Manages a realistic, canvas-based rain-on-a-window-pane effect.
 */
class RainEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.animationFrameId = null;
        this.lastTime = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const {
            width,
            height
        } = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = width;
        this.canvas.height = height;
        this.drops = [];
        this.createDrops();
    }

    createDrops() {
        // Reduce drop count for a subtler effect
        const count = Math.floor(this.canvas.width / 10);
        for (let i = 0; i < count; i++) {
            this.drops.push(this.createDrop());
        }
    }

    createDrop(x, y) {
        const isNew = x === undefined;
        return {
            x: isNew ? Math.random() * this.canvas.width : x,
            y: isNew ? Math.random() * this.canvas.height : y,
            // Smaller radius for finer drops
            radius: Math.random() * 1.5 + 0.5,
            // Velocity
            vx: 0,
            vy: Math.random() * 2 + 1,
            // Acceleration based on "mass" (radius)
            accel: 0.05 + (Math.random() * 0.1),
            // Horizontal wobble
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.1 + Math.random() * 0.2,
            wobbleAmount: 0.5 + Math.random() * 0.5,
        };
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 16.67; // Normalize to 60fps
        this.lastTime = timestamp;

        // Fading background with a higher alpha to make streaks disappear faster
        this.ctx.fillStyle = 'rgba(240, 245, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];

            // Update velocity and position
            drop.vy += drop.accel * deltaTime;
            drop.wobble += drop.wobbleSpeed * deltaTime;
            drop.vx = Math.sin(drop.wobble) * drop.wobbleAmount;

            drop.x += drop.vx * deltaTime;
            drop.y += drop.vy * deltaTime;

            // Draw the drop "head" with lower opacity
            this.ctx.beginPath();
            this.ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(200, 210, 220, ${0.3 + (drop.radius / 5)})`;
            this.ctx.fill();

            // Reset drop if it's off-screen
            if (drop.y > this.canvas.height + drop.radius) {
                this.drops[i] = this.createDrop(Math.random() * this.canvas.width, -drop.radius);
            }
        }

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    start() {
        if (this.animationFrameId) return;
        this.canvas.classList.add('active');
        this.lastTime = 0;
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        if (!this.animationFrameId) return;
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.classList.remove('active');
    }
}

/**
 * Manages the state and application of weather effects on the preview iframe.
 * @class
 */
class WeatherController {
    /**
     * @param {HTMLElement} overlayElement - The container for the weather effect layers.
     * @param {HTMLElement} controlsElement - The container for the weather control buttons.
     */
    constructor(overlayElement, controlsElement) {
        if (!overlayElement || !controlsElement) {
            throw new Error('WeatherController requires valid overlay and controls elements.');
        }
        this.overlay = overlayElement;
        this.controls = controlsElement;
        this.currentWeather = 'clear';
        this.weatherEffects = new Map();
        this.rainEffect = null;


        // Discover and map all available weather effect elements
        this.overlay.querySelectorAll('[data-weather]').forEach(elem => {
            this.weatherEffects.set(elem.dataset.weather, elem);
        });

        this.init();

        // Initialize Rain Effect
        const rainCanvas = document.getElementById('rain-canvas');
        if (rainCanvas) {
            this.rainEffect = new RainEffect(rainCanvas);
        }
    }

    /**
     * Initializes event listeners for the weather controls.
     */
    init() {
        this.controls.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-weather]');
            if (button) {
                const weather = button.dataset.weather;
                this.setWeather(weather);
            }
        });
    }

    /**
     * Sets the active weather effect, ensuring smooth transitions.
     * @param {string} weather - The name of the weather effect to activate (e.g., 'rainy', 'clear').
     */
    setWeather(weather) {
        if (this.currentWeather === weather) return;

        // Deactivate the current effect
        const currentEffect = this.weatherEffects.get(this.currentWeather);
        if (currentEffect) {
            currentEffect.classList.remove('active');
        }

        // Activate the new effect
        const newEffect = this.weatherEffects.get(weather);
        if (newEffect) {
            newEffect.classList.add('active');
        }

        this.currentWeather = weather;
        console.log(`Weather state changed to: ${this.currentWeather}`);

        // Handle the 'clear' state separately
        if (weather === 'clear') {
            this.weatherEffects.forEach(effect => effect.classList.remove('active'));
            if (this.rainEffect) this.rainEffect.stop();
        } else if (weather === 'rainy') {
            if (this.rainEffect) this.rainEffect.start();
        } else {
            if (this.rainEffect) this.rainEffect.stop();
        }
    }

    /**
     * Shows the weather controls.
     */
    showControls() {
        this.controls.classList.remove('hidden');
    }
}

/**
 * Manages the loading and display of a user-provided URL in a sandboxed iframe.
 * @class
 */
class IframePreviewController {
    /**
     * @param {HTMLFormElement} form - The form element containing the URL input.
     * @param {HTMLIFrameElement} iframe - The iframe element for the preview.
     * @param {Function} onLoadCallback - A callback function to execute when the iframe loads.
     */
    constructor(form, iframe, onLoadCallback) {
        if (!form || !iframe) {
            throw new Error('IframePreviewController requires a valid form and iframe element.');
        }
        this.form = form;
        this.input = form.querySelector('input[type="url"]');
        this.iframe = iframe;
        this.onLoadCallback = onLoadCallback;

        this.init();
    }

    /**
     * Initializes the form submission event listener.
     */
    init() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            const url = this.input.value;
            this.loadUrl(url);
        });
    }

    /**
     * Loads a URL into the iframe.
     * @param {string} urlString - The URL to load.
     */
    loadUrl(urlString) {
        if (!urlString) {
            console.error('No URL provided.');
            return;
        }

        try {
            // Use a valid, but blank, URL for security if the input is invalid.
            // about:blank is a safe choice.
            const url = new URL(urlString);
            this.iframe.src = url.toString();
            this.iframe.onload = () => {
                console.log(`Iframe loaded: ${this.iframe.src}`);
                if (typeof this.onLoadCallback === 'function') {
                    this.onLoadCallback();
                }
            };
        } catch (error) {
            console.error('Invalid URL provided:', error);
            alert('Please enter a valid URL (e.g., https://example.com)');
            this.iframe.src = 'about:blank';
        }
    }
}

/**
 * Manages the reveal-on-scroll animation for sections using IntersectionObserver.
 * @class
 */
class SectionObserver {
    /**
     * @param {string} selector - The CSS selector for the elements to observe.
     */
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        if (this.elements.length === 0) return;

        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // 10% of the element is visible
        });

        this.init();
    }

    /**
     * Starts observing the elements.
     */
    init() {
        // Respects user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.revealAll();
            return;
        }

        this.elements.forEach(el => this.observer.observe(el));
    }

    /**
     * The callback function for the IntersectionObserver.
     * @param {IntersectionObserverEntry[]} entries - The entries reported by the observer.
     * @param {IntersectionObserver} observer - The observer instance.
     */
    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing the element once it's visible
                observer.unobserve(entry.target);
            }
        });
    }

    /**
     * Immediately reveals all observed elements, used for prefers-reduced-motion.
     */
    revealAll() {
        this.elements.forEach(el => el.classList.add('visible'));
    }
}


/**
 * Main application entry point.
 * Initializes all controllers when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        const weatherOverlay = document.getElementById('weather-overlay');
        const weatherControls = document.getElementById('weather-controls');
        const weatherController = new WeatherController(weatherOverlay, weatherControls);

        const urlForm = document.getElementById('url-form');
        const previewIframe = document.getElementById('preview-iframe');
        new IframePreviewController(urlForm, previewIframe, () => {
            weatherController.showControls();
        });

        new SectionObserver('section.hidden');

    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
});