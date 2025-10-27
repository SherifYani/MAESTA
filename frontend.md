## Table of Contents

1.  [General Principles](#1-general-principles)
2.  [Technology Stack](#2-technology-stack)
3.  [Version Control (Git)](#3-version-control-git)
4.  [Code Formatting & Linting](#4-code-formatting--linting)
5.  [Commenting Standards](#5-commenting-standards)
    *   [File Header Comments](#51-file-header-comments)
    *   [Function & Component Comments](#52-function--component-comments)
    *   [Inline Comments](#53-inline-comments)
6.  [HTML Standards](#6-html-standards)
7.  [CSS Standards](#7-css-standards)
8.  [JavaScript Standards](#8-javascript-standards)
9. [React Standards](#9-react-standards)

---

## 1. General Principles

-   **Clarity Over Brevity**: Write code that is self-explanatory and easy for others to understand.
-   **Consistency is Key**: A uniform codebase is easier to read, understand, and maintain.
-   **Don't Repeat Yourself (DRY)**: Abstract and reuse common logic and UI elements.
-   **Keep it Simple**: Avoid unnecessary complexity. Simple solutions are easier to debug and maintain.

## 2. Technology Stack

-   **Language**: HTML5, CSS3, JavaScript (ES6+)
-   **Framework**: React
-   **Styling**: CSS Modules or Styled-Components (to be decided)
-   **State Management**: React Context API, Redux (for complex global state)
-   **Package Manager**: npm or yarn

## 3. Version Control (Git)

-   **Branching**: All new work must be done on a feature branch (e.g., `feat/user-login`, `fix/header-bug`).
-   **Commits**: Write clear, descriptive commit messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
    -   Example: `feat: add user profile page`
    -   Example: `fix: correct validation error on signup form`
-   **Pull Requests (PRs)**: All code must be reviewed via a Pull Request before being merged into the `main` branch. A PR must be approved by at least one other team member.

## 4. Code Formatting & Linting

We use automated tools to enforce a consistent code style.
-   **ESLint**: For identifying and reporting on patterns in JavaScript.
-   **Prettier**: An opinionated code formatter that enforces a consistent style.

**Rule**: Configure your editor to **format on save** to automatically apply Prettier's rules. All code must be free of linting errors before creating a Pull Request.

## 5. Commenting Standards

Clear comments are crucial for understanding the codebase.

### 5.1. File Header Comments

**Rule**: Every `.js`, `.jsx`, and `.css` file must begin with a header block explaining its purpose and history.

**JS/React Example (`.jsx`):**
```javascript
/**
 * @file UserProfile.jsx
 * @description This component displays a user's profile information.
 * @author [Creator's Name]
 * @date [Creation Date]
 *
 * @last-modified-by [Modifier's Name]
 * @last-modified-date [Modification Date]
 */
```

**CSS Example (`.css`):**
```css
/**
 * @file UserProfile.css
 * @description Contains all styles for the UserProfile component.
 */
```

### 5.2. Function & Component Comments

**Rule**: Use JSDoc-style comments before every function and React component to explain its purpose, parameters, and return values.

**Function Example:**
```javascript
/**
 * Calculates the total price of items in the cart.
 * @param {Array<Object>} items - The array of items.
 * @returns {number} The calculated total price.
 */
const calculateTotal = (items) => { /* ... */ };
```

**React Component Example:**
```javascript
/**
 * A reusable button component.
 * @param {Object} props - The component props.
 * @param {string} props.text - The text to display on the button.
 * @param {function} props.onClick - The function to execute on click.
 * @returns {JSX.Element} The rendered button.
 */
const Button = ({ text, onClick }) => { /* ... */ };
```

### 5.3. Inline Comments

**Rule**: Use inline comments (`//`) to clarify complex or non-obvious logic. Comment on the *why*, not the *what*.

-   **Good**: `// Debounce API call to prevent firing on every keystroke.`
-   **Bad**: `// Increment the counter.`

## 6. HTML Standards

-   **Doctype**: Always use `<!DOCTYPE html>`.
-   **Semantic HTML**: Use tags like `<header>`, `<main>`, `<nav>`, etc., to structure content meaningfully.
-   **Accessibility**: Always include the `alt` attribute for `<img>` tags. Use ARIA attributes where necessary.
-   **Formatting**: Use lowercase for tags and attributes. Indent with two spaces.

## 7. CSS Standards

-   **Naming Convention**: Use the **BEM (Block, Element, Modifier)** methodology for class names to avoid style conflicts.
    -   Example: `.card__title--highlighted`
-   **Organization**: Keep CSS in separate files (e.g., `Button.css` for `Button.jsx`).
-   **No `!important`**: Avoid using `!important` unless absolutely necessary.
-   **Units**: Use `rem` for font sizes and `px` for borders. Use flexible units (`%`, `vh`, `vw`) for layouts.

## 8. JavaScript Standards

-   **Variables**: Use `const` by default. Use `let` only for variables that need to be reassigned. Avoid `var`.
-   **Strict Mode**: Use `"use strict";` at the top of files.
-   **Naming**: Use **camelCase** for variables and functions (`myVariable`).
-   **Functions**: Prefer arrow functions for their concise syntax. Keep functions small and focused on a single task.
-   **Modules**: Use ES6 modules (`import`/`export`) for all files.

## 9. React Standards

-   **Components**:
    -   Use **functional components** with Hooks.
    -   Name component files and the components themselves with **PascalCase** (e.g., `UserProfile.jsx`).
    -   Keep components small and focused on a single responsibility.
-   **Props**:
    -   Use destructuring to access props.
    -   Use `PropTypes` or TypeScript to validate prop types.
-   **State**:
    -   Use the `useState` hook for local component state.
    -   Lift state up to the nearest common ancestor when multiple components need it.
-   **Keys**: Always provide a unique and stable `key` when rendering lists. Avoid using the array index as a key.
-   **Styling**: Do not use inline styles. Use CSS Modules or a CSS-in-JS library.