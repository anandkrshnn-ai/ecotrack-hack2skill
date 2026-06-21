const fs = require('fs');
const code = fs.readFileSync('js/main.js', 'utf8');

function extract(startStr, endStr) {
    const s = code.indexOf(startStr);
    const e = code.indexOf(endStr, s);
    return code.substring(s, e);
}

const factors = extract('// Emission Factors (kgCO2e)', 'let pieChartInstance');
const calc = extract('function calculateFootprint()', 'function getEcoScore(total)');
const eco = extract('function getEcoScore(total)', 'function generateRecommendations(breakdown, total)');
const recs = extract('function generateRecommendations(breakdown, total)', 'function renderBreakdown(breakdown, total)');

const calculatorJS = factors + '\n' + calc + '\n' + eco + '\n' + recs + '\n' + 
'// CommonJS exports for Jest testing\nif (typeof module !== "undefined" && module.exports) {\n    module.exports = { FACTORS, calculateFootprint, getEcoScore, generateRecommendations };\n}\n';
fs.writeFileSync('js/calculator.js', calculatorJS);

const history = extract('// HISTORY MANAGEMENT', 'document.addEventListener(\'DOMContentLoaded\', () => {');
const historyJS = history + '\n' + 
'// CommonJS exports for Jest testing\nif (typeof module !== "undefined" && module.exports) {\n    module.exports = { getHistory, saveHistory, logCurrentToHistory, deleteHistoryEntry, clearHistory, exportHistory };\n}\n';
fs.writeFileSync('js/history.js', historyJS);

let uiPart = code.substring(0, code.indexOf('// HISTORY MANAGEMENT'));
uiPart = uiPart.replace(factors, '');
uiPart = uiPart.replace(calc, '');
uiPart = uiPart.replace(eco, '');
uiPart = uiPart.replace(recs, '');
fs.writeFileSync('js/ui.js', uiPart);

let appPart = code.substring(code.indexOf("document.addEventListener('DOMContentLoaded', () => {"));
appPart = appPart.split('// CommonJS exports')[0];
fs.writeFileSync('js/app.js', appPart);

console.log('Split successful');
