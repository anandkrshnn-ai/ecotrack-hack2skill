# EcoTrack • Carbon Footprint Awareness Platform

**Built for Hack2skill Main Challenge 3 — June 2026**

A fast, smart, privacy-first web application that helps people understand and reduce their daily carbon footprint with personalized, actionable insights.

## Chosen Vertical
**Sustainability & Environmental Awareness.** 
This project focuses on providing individuals with a smart, dynamic assistant to track their daily carbon footprint, analyze their mobility, energy, and food habits, and receive personalized recommendations to lower their environmental impact.

## Approach and Logic
The logic follows a straightforward but powerful client-side calculation model:
- **Input Collection:** Users input their daily activities across Transport, Energy, Food, and General Consumption.
- **Dynamic Calculation:** The application multiplies inputs by specific emission factors (e.g., 0.16 kg/km for a petrol car, 0.78 kg/kWh for Tamil Nadu grid electricity).
- **Personalized Insights:** Based on the breakdown (e.g., if transport > 38% of total footprint), the system generates dynamic recommendations (like switching to Chennai Metro) to reduce the score.
- **Gamification & Trends:** The platform maintains a sovereign local history (in `localStorage`), showing streak days, a 7-day average, and a trend line chart to encourage consistent tracking.

## How the Solution Works
1. **Smart Presets:** Users can load presets like "Typical Chennai Weekday" or "Low Impact Day" to quickly populate realistic data.
2. **Instant Feedback:** As users adjust sliders or values, the UI updates instantly. Hitting "Calculate" reveals a detailed breakdown and pie chart.
3. **What-If Simulator:** Users can test hypothetical scenarios (e.g., "What if I switch to a plant-based diet?") to see immediate footprint reductions.
4. **Privacy-First Storage:** All data, including the 45-day rolling history, is stored entirely in the browser's `localStorage`. No data is sent to external servers.

## Any Assumptions Made
- **Emission Factors:** We assume a standard Indian/Tamil Nadu context for emission factors (e.g., 0.78 kgCO₂e/kWh for electricity).
- **Food Data:** Diet emissions are generalized based on lifecycle studies (e.g., Mixed diet ≈ 3.9 kg/day).
- **Baseline:** The Indian average daily footprint is assumed to be ~5.2 kg/day for comparison purposes.
- **Client Capabilities:** We assume the user is using a modern web browser that supports ES6 Javascript, Canvas (for Chart.js), and `localStorage`.

## Evaluation Criteria Addressed
- **Code Quality:** Modular JavaScript structure within the main HTML, cleanly separated CSS (Tailwind), and proper semantic HTML tags.
- **Security:** 100% client-side execution. Uses `textContent` instead of `innerHTML` for dynamic user inputs to prevent XSS. No external API keys exposed.
- **Efficiency:** Uses minified production Tailwind CSS (20KB), optimized DOM updates, and `requestAnimationFrame` for smooth counting animations.
- **Testing:** Implemented core logic validation suite. Use `npm test` to run the automated tests verifying calculation factors and algorithms.
- **Accessibility:** Uses semantic tags, descriptive `aria-label` attributes on buttons, and proper contrast ratios. Keyboard navigable.

## Live Application
https://anandkrshnn-ai.github.io/ecotrack-hack2skill/

## How to Test Locally
1. Clone the repository.
2. Open `index.html` in your browser.
3. Run `npm install` and `npm test` to execute the core logic test suite.

Built by Anandakrishnan Damodaran for the challenge.