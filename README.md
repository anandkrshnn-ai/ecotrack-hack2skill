# EcoTrack • Carbon Footprint Awareness Platform

**Built for Hack2skill Main Challenge 3 — June 2026**

[![Tests](https://github.com/anandkrshnn-ai/ecotrack-hack2skill/actions/workflows/test.yml/badge.svg)](https://github.com/anandkrshnn-ai/ecotrack-hack2skill/actions/workflows/test.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-10b981)](https://anandkrshnn-ai.github.io/ecotrack-hack2skill/)

A fast, smart, privacy-first web application that helps people understand and reduce their daily carbon footprint with personalised, actionable insights. 100% client-side — no accounts, no servers, no data leaves your browser.

---

## Chosen Vertical

**Sustainability & Environmental Awareness.**
This project focuses on providing individuals with a smart, dynamic assistant to track their daily carbon footprint, analyse their mobility, energy, and food habits, and receive personalised recommendations to lower their environmental impact.

---

## Approach and Logic

The logic follows a client-side calculation model built around verified Indian emission factors:

- **Input Collection:** Users input daily activities across Transport, Energy, Food, and General Consumption.
- **Dynamic Calculation:** Inputs are multiplied by emission factors (e.g., 0.16 kg/km for a petrol car, 0.78 kg/kWh for Tamil Nadu grid electricity).
- **Personalised Insights:** Based on the breakdown (e.g., if transport > 38% of total footprint), the system generates dynamic recommendations (like switching to Chennai Metro) to reduce the score.
- **Gamification & Trends:** The platform maintains a sovereign local history (`localStorage`), showing streak days, a 7-day average, and a trend line chart to encourage consistent tracking.

---

## How the Solution Works

1. **Smart Presets:** Users load presets like "Typical Chennai Weekday" or "Low Impact Day" to quickly populate realistic data.
2. **Instant Feedback:** As users adjust sliders, the UI updates instantly. Hitting "Calculate" reveals a detailed breakdown and pie chart.
3. **What-If Simulator:** Users test hypothetical scenarios (e.g., "What if I switch to a plant-based diet?") to see immediate footprint reductions.
4. **Privacy-First Storage:** All data, including the 45-day rolling history, is stored entirely in the browser's `localStorage`. No data is sent to external servers.
5. **History & Export:** Users can track their 45-day trend, view streaks, and export history to CSV.

---

## Project Structure

```
ecotrack-hack2skill/
├── index.html              # Main application (HTML + embedded JS)
├── styles.css              # Compiled Tailwind CSS (production build)
├── input.css               # Tailwind source
├── tailwind.config.js      # Tailwind configuration
├── tests/
│   └── calculator.test.js  # Jest unit tests — 14 test cases
├── .github/
│   └── workflows/
│       └── test.yml        # CI: auto-runs tests + uploads coverage on push
├── CONTRIBUTING.md         # How to contribute
├── SECURITY.md             # Security design and XSS/CSP details
└── README.md
```

---

## Running Locally

```bash
git clone https://github.com/anandkrshnn-ai/ecotrack-hack2skill.git
cd ecotrack-hack2skill
open index.html              # Open in any modern browser
```

### Running Tests

```bash
npm install
npm test                     # Runs Jest with coverage
```

The test suite covers:
- ✅ Low-impact EV + vegan scenario
- ✅ High-impact petrol + meat scenario
- ✅ Short and medium flight emission additions
- ✅ Unknown vehicle type fallback
- ✅ Zero input edge case
- ✅ Negative input validation (throws `Error`)
- ✅ All 5 eco-score band boundaries
- ✅ Exact boundary value at 3.0 kg

---

## Assumptions Made

- **Emission Factors:** Standard Indian/Tamil Nadu context (e.g., 0.78 kgCO₂e/kWh for electricity).
- **Food Data:** Diet emissions are generalised from lifecycle studies (Mixed diet ≈ 3.9 kg/day).
- **Baseline:** Indian average daily footprint assumed ~5.2 kg/day for comparison.
- **Client Capabilities:** Modern browser with ES6, Canvas API, and `localStorage` support.
- **Daily granularity:** The tool models one day at a time; weekly/monthly patterns emerge through consistent logging.

---

## Evaluation Criteria Addressed

| Criterion | Implementation |
|---|---|
| **Code Quality** | Modular functions, clear naming, CONTRIBUTING.md, semantic HTML, documented constants |
| **Security** | CSP meta tag, SRI hashes on CDN resources, `textContent` for dynamic content, SECURITY.md |
| **Efficiency** | 100% client-side, no network calls, `requestAnimationFrame` animations, minified Tailwind |
| **Testing** | 14 Jest tests, edge cases + boundary values, CI pipeline with coverage upload |
| **Accessibility** | Semantic tags, `aria-label` on all buttons, keyboard navigation (`/` to jump to calculator), proper contrast |
| **Problem Alignment** | Smart assistant, personalised recommendations, local context (Chennai/Tamil Nadu), real-world usability |

---

## Data Sources & Methodology

| Category | Factor | Source |
|---|---|---|
| Petrol car | 0.16 kgCO₂e/km | India GHG Programme |
| Two-wheeler | 0.09 kgCO₂e/km | Our World in Data |
| EV/Hybrid | 0.06 kgCO₂e/km | CEA grid mix adjusted |
| Public transport | 0.05 kgCO₂e/km | MTC/CMRL estimates |
| Electricity | 0.78 kgCO₂e/kWh | CEA 2024–25 |
| Vegan diet | 1.8 kg/day | Poore & Nemecek, 2018 |
| Mixed diet | 3.9 kg/day | FAO + Indian diet studies |

---

## Live Application

🌐 **[https://anandkrshnn-ai.github.io/ecotrack-hack2skill/](https://anandkrshnn-ai.github.io/ecotrack-hack2skill/)**

---

Built by **Anandakrishnan Damodaran** for Hack2skill Main Challenge 3 — June 2026.
