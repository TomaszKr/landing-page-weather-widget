# Weather Widget Landing Page

This project is a high-performance, dependency-free landing page and a functional prototype of a "Weather Widget". It showcases how websites can dynamically change their appearance based on real-world weather conditions. The entire project is built using only vanilla HTML, CSS, and JavaScript, with a strong focus on performance, accessibility, and clean code.

## Tech Stack

- **HTML5**: Semantic HTML for structure.
- **CSS**: Modern CSS for styling, layout, and animations. Uses CSS variables, `clamp()` for fluid typography, and respects `prefers-reduced-motion`.
- **JavaScript (ES2020+)**: Vanilla JavaScript for all interactive logic. No frameworks or external libraries are used.

## Project Structure

The project maintains a flat and minimal file structure:

- `index.html`: The main HTML file containing the structure of the landing page, including the live preview section.
- `styles.css`: Contains all styles for the page and the weather effects. The effects are implemented purely in CSS using animations, pseudo-elements, and filters.
- `main.js`: The core JavaScript file that handles all the application logic.

## Key Architectural Concepts

- **Section Observer**: The landing page uses the `IntersectionObserver` API (`SectionObserver` class) to gracefully animate sections into view as the user scrolls.
- **Iframe Preview Controller**: Manages the live preview functionality. It takes a user-provided URL, loads it into a sandboxed `iframe` for security, and then reveals the weather controls.
- **Weather Controller**: This acts as a state machine for the visual weather effects. It manages which weather overlay is active and ensures smooth transitions between states. The state is controlled by adding/removing CSS classes on the overlay elements.
- **Rain Effect (Canvas)**: A canvas-based rain effect is included in the JavaScript (`RainEffect` class) to create a more realistic "rain on a window" effect, but it is currently not the active implementation for the 'rainy' state, which uses a CSS-based effect.

## How to Run

There are no build steps or dependencies. To run the project, simply open the `index.html` file in a modern web browser.
