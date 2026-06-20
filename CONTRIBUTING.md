# Contributing to EcoTrack

Thank you for your interest in contributing to EcoTrack — a privacy-first carbon footprint awareness platform.

## Project Structure

```
ecotrack-hack2skill/
├── index.html          # Main application (HTML + embedded JS logic)
├── styles.css          # Compiled Tailwind CSS (production)
├── input.css           # Tailwind source input
├── tailwind.config.js  # Tailwind configuration
├── tests/
│   └── calculator.test.js  # Jest unit tests for core emission logic
├── .github/
│   └── workflows/
│       └── test.yml    # CI: runs tests on every push
└── README.md
```

## Core Logic

All carbon calculation logic lives in `index.html` inside the `<script>` block:
- `calculateFootprint()` — main calculation using emission factors
- `getEcoScore(total)` — translates kg CO₂e into a 0–100 score
- `generateRecommendations(breakdown, total)` — produces personalised tips
- `FACTORS` constant — all emission factors (transport, food, energy, consumption)

## Running Tests

```bash
npm install
npm test
```

Tests are in `tests/calculator.test.js` and cover:
- Core emission calculations for all presets
- Edge cases: zero input, boundary scores, flight additions
- Input validation: negative value rejection
- Score boundary conditions

## Development Guidelines

1. **Keep it client-side** — no server, no external API calls, no user data leaving the browser
2. **Emission factors** — cite sources when changing values (see Data Sources modal in app)
3. **Accessibility** — all interactive elements must have `aria-label` attributes
4. **Security** — use `textContent` not `innerHTML` for user-controlled dynamic content
5. **Testing** — add a test case for any new calculation logic

## Code Style

- Plain ES6 JavaScript (no build step for JS)
- Tailwind CSS utility classes; custom overrides in `<style>` block
- Functions named in camelCase, constants in UPPER_SNAKE_CASE
- Keep functions focused and under ~30 lines where possible

## Submitting Changes

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make changes and ensure `npm test` passes
4. Push and open a Pull Request with a clear description

## Emission Factor Sources

- India grid electricity: ~0.78 kgCO₂e/kWh (CEA 2024–25)
- Transport factors: India GHG Programme + Our World in Data
- Food lifecycle: Poore & Nemecek (Science, 2018) + FAO
- Flights: ICAO Carbon Emissions Calculator methodology
