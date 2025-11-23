# AI Coding Agent Instructions for airbnb-clone

## Project Overview
- This is a React SPA bootstrapped with Vite, using React Router for navigation and Bootstrap for UI styling.
- Main entry: `src/main.jsx` renders `App.jsx`.
- Routing and page structure are managed in `App.jsx`.
- Pages: `src/pages/Login.jsx`, `src/pages/Signup.jsx` (modal-based), with a shared `Navbar` in `src/components/Navbar.jsx`.

## Architecture & Patterns
- **Routing:** All navigation is handled via React Router (`BrowserRouter`, `Routes`, `Route`).
- **UI:** Bootstrap is imported globally; use Bootstrap classes for layout and components.
- **Modals:** Signup uses a modal (`react-bootstrap`), not a separate route.
- **State:** Local state via React hooks (`useState`, `useNavigate`). No global state management.
- **Forms:** Use controlled components for form inputs. Password validation is enforced in Signup.
- **Component Structure:**
  - `Navbar` contains search, user type dropdown, and login/signup links (dropdown menu).
  - Pages are simple forms or static content.

## Developer Workflows
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview build:** `npm run preview`
- **Lint:** `npm run lint` (uses ESLint with custom config in `eslint.config.js`)
- **No test scripts or test files present.**

## Conventions & Custom Rules
- **ESLint:**
  - Unused variables starting with uppercase or `_` are ignored (`varsIgnorePattern: '^[A-Z_]'`).
  - Only JS/JSX files are linted.
- **File Structure:**
  - Components: `src/components/`
  - Pages: `src/pages/`
  - Assets: `src/assets/`
- **No backend/API integration yet.**
- **No TypeScript, but type-aware linting is recommended for future expansion.**

## Integration Points
- **External dependencies:**
  - `react`, `react-dom`, `react-router-dom`, `bootstrap`, `react-bootstrap` (modal)
- **Vite config:** See `vite.config.js` for plugin setup.
- **ESLint config:** See `eslint.config.js` for custom rules and plugin usage.

## Examples
- To add a new page, create a component in `src/pages/` and add a `<Route>` in `App.jsx`.
- To add a new navbar item, update `Navbar.jsx`.
- To change global styles, edit `src/App.css` or `src/index.css`.

---

For questions or unclear conventions, check `README.md`, `eslint.config.js`, or ask for clarification.
