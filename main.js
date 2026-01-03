/**
 * @file Main JavaScript file for the Weather Widget landing page.
 * @description Handles section reveal animations, iframe preview loading, and weather overlay effects.
 */

'use strict';

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

        // Discover and map all available weather effect elements
        this.overlay.querySelectorAll('[data-weather]').forEach(elem => {
            this.weatherEffects.set(elem.dataset.weather, elem);
        });

        this.init();
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