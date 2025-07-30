# Territory Wars - CSS Style Guide

This document provides an overview of the `style.css` file for the Territory Wars game. This file is built as a flexible and reusable design system using modern CSS features. It includes a comprehensive set of CSS variables for theming, base styles for common HTML elements, a collection of UI components, and specific styles for the game's interface.

## Features

- **CSS Custom Properties**: A robust set of variables (`:root`) for colors, typography, spacing, and more, making customization and theme maintenance straightforward.
- **Light & Dark Mode**: Supports both system-level `prefers-color-scheme` and manual toggling via a `data-color-scheme` attribute.
- **Responsive Design**: Styles are fully responsive, adapting to various screen sizes from mobile to desktop using media queries.
- **Component-Based**: Includes pre-styled, reusable components like Buttons, Cards, Forms, and Status Indicators.
- **Utility Classes**: Provides a set of utility classes for quick styling of layout, spacing, and display properties (e.g., `.flex`, `.gap-16`, `.py-8`).
- **Accessibility**: Incorporates accessibility best practices, including `:focus-visible` states, high-contrast support, and screen-reader-only classes.

## File Structure

The `style.css` file is organized logically:

1.  **`:root` Variables**:
    -   **Primitive Tokens**: Base values for colors, fonts, spacing, etc.
    -   **Semantic Tokens**: Contextual variables (e.g., `--color-background`, `--color-primary`) that map to primitive tokens. This is where you'd make most theme changes.
    -   **Light & Dark Mode Definitions**: Overrides for semantic tokens within a `@media (prefers-color-scheme: dark)` block and `[data-color-scheme]` attribute selectors.
2.  **Base Styles**: Global styles and resets for `html`, `body`, typography (`h1`-`h6`, `p`, `a`), and other core elements.
3.  **Component Styles**: CSS for reusable UI components like `.btn`, `.card`, `.form-control`, and `.status`.
4.  **Layout & Utilities**: The `.container` class and various utility classes for flexbox, spacing, etc.
5.  **Game-Specific Styles**: Styles unique to the Territory Wars UI, such as the game board, player indicators, and modals.

## How to Use

### Linking the Stylesheet

Include the stylesheet in the `<head>` of your HTML document.

```html
<link rel="stylesheet" href="style.css">
```

### Using Components

Components are used by adding their respective classes to your HTML elements.

**Buttons:**

```html
<!-- Primary Button -->
<button class="btn btn--primary">Click Me</button>

<!-- Secondary Button -->
<button class="btn btn--secondary">More Info</button>

<!-- Outline Button -->
<button class="btn btn--outline">Cancel</button>

<!-- Small, Full-Width Button -->
<button class="btn btn--primary btn--sm btn--full-width">Submit</button>
```

**Cards:**

```html
<div class="card">
  <div class="card__header">
    <h5>Card Title</h5>
  </div>
  <div class="card__body">
    <p>This is the content of the card. It uses semantic color tokens for its background and border.</p>
  </div>
</div>
```

### Dark Mode

Dark mode is enabled automatically based on the user's system preference. To manually control the theme (e.g., for a user-facing theme switcher), add a `data-color-scheme` attribute to your `<html>` or `<body>` tag.

```html
<!-- Force Dark Mode -->
<html data-color-scheme="dark">

<!-- Force Light Mode -->
<html data-color-scheme="light">
</html>
```

### Customization

The easiest way to customize the look and feel of the application is by modifying the **semantic color tokens** in the `:root` block of `style.css`.

For example, to change the primary color for the light theme, you would only need to change this one line:

```css
/* in :root */
--color-primary: var(--color-orange-500); /* Was --color-teal-500 */
```

All components that use `--color-primary` (like primary buttons) will automatically update.

### Game-Specific Styles

The section starting with `/* Game-specific styles for Territory Wars */` contains all styles related to the game itself.

- **`.game-board`**: The main grid for the game.
- **`.game-cell`**: Individual cells, with states like `.player1`, `.player2`, and `.winning-cell`.
- **`.game-status`**: The top bar showing the current player and turn.
- **`.score-section`**: The area displaying player scores.
- **`.modal`**: The popup that appears at the end of the game.

These classes are designed to be manipulated by JavaScript to reflect the current state of the game.
