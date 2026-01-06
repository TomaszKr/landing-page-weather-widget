# Guidelines for AI Agents

This document provides essential guidelines for AI agents (like GitHub Copilot, Claude, etc.) working on this repository. Adhering to these rules is crucial to maintaining the project's integrity and core principles.

## 1. Core Principle: Zero Dependencies

**This is the most important rule.** This project is built with **100% vanilla HTML, CSS, and modern JavaScript (ES2020+)**.

- **DO NOT** add any external frameworks (React, Vue, Angular, Svelte, etc.).
- **DO NOT** add any external libraries or utilities (jQuery, Lodash, GSAP, etc.).
- **DO NOT** introduce any build tools, bundlers, or transpilers (Webpack, Vite, Babel, etc.).
- **DO NOT** use package managers (`npm`, `yarn`, `pnpm`). There is no `package.json` file, and there should not be one.

The code must run directly in a modern browser by opening the `index.html` file.

## 2. File Structure is Static

The project uses a flat and minimal file structure:
- `/index.html`
- `/styles.css`
- `/main.js`

**DO NOT** create new directories or files unless explicitly instructed to do so. All logic and styling should be contained within the existing files.

## 3. CSS is the Primary Tool for Visual Effects

All weather effects and animations are, and should be, implemented using **pure CSS**.

- Utilize CSS features like pseudo-elements (`::before`, `::after`), animations (`@keyframes`), transforms, and filters (`backdrop-filter`).
- The JavaScript `WeatherController` class works by toggling CSS classes. Your role is to define the visual behavior of these classes in `styles.css`.
- While a canvas-based rain effect exists in `main.js` (`RainEffect` class), the preferred implementation for weather effects is CSS-first. Do not expand the canvas implementation unless specifically asked.

## 4. JavaScript is Modular and Class-Based

The logic in `main.js` is organized into distinct classes, each with a single responsibility:

- `WeatherController`: A state machine for managing weather effects.
- `IframePreviewController`: Manages the `iframe` loading.
- `SectionObserver`: Handles scroll-based animations.

When adding new functionality, adhere to this class-based, modular pattern. Maintain a clear separation of concerns.

## 5. Performance and Accessibility are Mandatory

- **Performance:** Animations must be performant. Prioritize animating the `transform` and `opacity` properties. Avoid animations that trigger layout shifts or expensive paints.
- **Accessibility:** All animations and transitions **must** respect the `@media (prefers-reduced-motion: reduce)` media query. Inside this query, disable or significantly reduce motion. Ensure content remains readable and accessible regardless of the active weather effect.
- **Semantics:** Use semantic HTML tags appropriately.

## 6. Design Philosophy: Subtle Perceptual Layers

The weather effects are not meant to be flashy "filters". They should be subtle, atmospheric layers that simulate looking through a pane of glass affected by the weather.

- Effects should be low-contrast and low-alpha.
- The underlying website content in the `iframe` must **always** be 100% readable and usable.
- The effect should enhance the experience, not dominate it.
