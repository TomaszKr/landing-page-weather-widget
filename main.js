'use strict';

/**
 * @class WeatherController
 * @description Manages the state and application of weather effects on the preview iframe.
 */
class WeatherController {
    constructor(overlayElement, controlsElement) {
        if (!overlayElement || !controlsElement) {
            throw new Error('WeatherController requires valid overlay and controls elements.');
        }
        this.overlay = overlayElement;
        this.controls = controlsElement;
        this.currentWeather = 'clear';
        this.init();
    }

    init() {
        this.controls.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-weather]');
            if (button) {
                const weather = button.dataset.weather;
                this.setWeather(weather);
            }
        });
    }

    setWeather(weather) {
        if (this.currentWeather === weather) {
            // If the same weather button is clicked again, clear the effect.
            if (weather !== 'clear') {
                this.setWeather('clear');
            }
            return;
        }

        // Remove the previous weather class from the overlay
        if (this.currentWeather !== 'clear') {
            this.overlay.classList.remove(`weather-overlay--${this.currentWeather}`);
        }

        // Add the new weather class to the overlay
        if (weather !== 'clear') {
            this.overlay.classList.add(`weather-overlay--${weather}`);
        }

        this.currentWeather = weather;
        this.updateActiveButton();
        console.log(`Weather state changed to: ${this.currentWeather}`);
    }

    updateActiveButton() {
        this.controls.querySelectorAll('button[data-weather]').forEach(button => {
            if (button.dataset.weather === this.currentWeather) {
                button.classList.add('active-weather');
            } else {
                button.classList.remove('active-weather');
            }
        });
    }

    showControls() {
        this.controls.classList.remove('hidden');
    }
}


/**
 * @class IframePreviewController
 * @description Manages the loading and display of a user-provided URL in a sandboxed iframe.
 */
class IframePreviewController {
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

    init() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            const url = this.input.value;
            this.loadUrl(url);
        });
    }

    loadUrl(urlString) {
        if (!urlString) {
            console.error('No URL provided.');
            return;
        }

        try {
            const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
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
 * @class SectionObserver
 * @description Manages the reveal-on-scroll animation for sections using IntersectionObserver.
 */
class SectionObserver {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        if (this.elements.length === 0) return;

        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        });

        this.init();
    }

    init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.revealAll();
            return;
        }
        this.elements.forEach(el => this.observer.observe(el));
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }

    revealAll() {
        this.elements.forEach(el => el.classList.add('visible'));
    }
}

/**
 * Main application entry point.
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