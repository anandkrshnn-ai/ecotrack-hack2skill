# Contributing to EcoTrack

Thank you for your interest in contributing to EcoTrack — a privacy-first carbon footprint awareness platform built for Hack2skill Main Challenge 3.

## Project Structure

```
ecotrack-hack2skill/
├── index.html              # Application shell — HTML structure only, no inline JS
├── js/
│   └── main.js             # All application logic (modular, addEventListener-based)
├── styles.css              # Compiled Tailwind CSS (production build)
├── input.css               # Tailwind source input
├── tailwind.config.js      # Tailwind configuration
├── tests/
│   └── calculator.test.js  # Jest unit tests — 35 test cases across 7 describe blocks
├── .github/
│   └── workflows/
│       └── test.yml        # CI: runs tests + validates structure on every push
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## Architecture

EcoTrack follows a strict **separation of concerns**:

- **`index.html`** — Pure semantic HTML structure. Zero inline `onclick`, `oninput`, or `onchange` handlers. All interactivity is bound via `addEventListener` in `js/main.js`.
- **`js/main.js`** — All business logic: emission calculations, chart rendering, history management, UI bindings, presets, what-if simulator, CSV export, modals.
- **`styles.css`** — Pre-compiled Tailwind CSS. No runtime CDN Tailwind.
- **`tests/calculator.test.js`** — Isolated Jest tests for all core logic functions.

## Core Logic (`js/main.js`)

Key functions:
- `calculateFootprint()` — reads form, returns `{ total, breakdown, inputs }`
- `getEcoScore(total)` — maps kgCO₂e to `{ score, label, color }`
- `generateRecommendations(breakdown, total)` — produces personalised tips
- `FACTORS` constant — all emission factors (transport, food, energy, consumption)
- `renderBreakdown()`, `renderPieChart()`, `renderTrendChart()` — all visualisation
- `logCurrentToHistory()`, `exportHistory()`, `clearHistory()` — localStorage management

## Running Tests

```bash
npm install
npm test          # runs Jest with coverage
npm run test:ci   # CI mode (no watch, force-exit)
npm run test:watch  # interactive watch mode
```

## Development Guidelines

1. **Keep it client-side** — no server, no external API calls, no user data leaving the browser
2. **No inline handlers** — all events must use `addEventListener` in `js/main.js`
3. **Emission factors** — cite sources when changing values (see Data Sources modal)
4. **Accessibility** — all interactive elements need `aria-label` attributes
5. **Security** — use `textContent` not `innerHTML` for any user-controlled content
6. **Testing** — add a Jest test for any new calculation or validation logic

## Code Style

- Plain ES6 JavaScript (no build step for JS)
- Tailwind CSS utility classes; custom overrides in `<style>` block of `index.html`
- Functions in camelCase, constants in UPPER_SNAKE_CASE
- JSDoc on all exported/public functions

## Submitting Changes

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make changes, ensure `npm test` passes
4. Push and open a Pull Request with a clear description

## Emission Factor Sources

| Category | Factor | Source |
|---|---|---|
| India grid electricity | ~0.78 kgCO₂e/kWh | CEA 2024–25 |
| Petrol car | 0.16 kgCO₂e/km | India GHG Programme |
| Two-wheeler | 0.09 kgCO₂e/km | Our World in Data |
| EV/Hybrid | 0.06 kgCO₂e/km | CEA grid mix adjusted |
| Vegan diet | 1.8 kg/day | Poore & Nemecek, Science 2018 |
| Mixed diet | 3.9 kg/day | FAO + Indian diet studies |
| Short domestic flight | 2.8 kg | ICAO methodology |
