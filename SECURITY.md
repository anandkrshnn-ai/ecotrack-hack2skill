# Security Policy

## Security Design Principles

EcoTrack is designed with a **privacy-first, client-side-only** architecture:

1. **No server communication** — all calculations run entirely in the user's browser
2. **No external data transmission** — user input never leaves the device
3. **No authentication or credentials** — no accounts, no passwords, no tokens
4. **localStorage only** — history is stored in browser-local storage; no cookies, no tracking

## XSS Prevention

- Dynamic content rendered from user input uses `textContent` instead of `innerHTML`
- The `notes` textarea value is never injected into the DOM as HTML
- All recommendation text is hardcoded strings, not user-derived

## Content Security Policy

A `Content-Security-Policy` meta tag is set in `index.html` to restrict resource loading:
- Scripts allowed only from `cdn.jsdelivr.net` (Chart.js) and self
- Styles allowed from `cdnjs.cloudflare.com` (Font Awesome), `fonts.googleapis.com`, and self
- No `eval()`, no inline event handlers beyond the app bootstrap

## Subresource Integrity

CDN-loaded resources include `integrity` and `crossorigin` attributes to prevent supply-chain attacks.

## Input Validation

- Numeric inputs are clamped to `[min, max]` range via `syncSlider()`
- `parseFloat(...) || 0` guards against NaN propagation
- Negative values throw in the test suite and are rejected by slider min constraints

## Reporting a Vulnerability

If you discover a security issue, please open a GitHub Issue with the label `security`.
Given the client-side-only nature of this app, the attack surface is minimal.
