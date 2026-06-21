"use strict";

/**
 * @fileoverview Manages local storage history, charting, and data exports.
 * @module history
 */

// HISTORY MANAGEMENT
/**
 * Retrieves the history data from localStorage.
 * @returns {Array} Array of history entry objects
 */
function getHistory() {
    try {
        const data = localStorage.getItem('ecotrack_history');
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
}

        /**
         * Saves the history array to localStorage.
         * @param {Array} history - The array to save
         */
        
        /**
         * Logs the currently displayed results to local storage history.
         * Handles duplicate entries for the same day and maintains a 45-day limit.
         */
        function logCurrentToHistory() {
            if (!currentResults) return;
            
            const history = getHistory();
            const today = new Date().toISOString().split('T')[0];
            
            // Prevent duplicate for same day (update if exists)
            const existingIndex = history.findIndex(h => h.date === today);
            
            const entry = {
                date: today,
                total: currentResults.total,
                breakdown: currentResults.breakdown,
                timestamp: Date.now()
            };
            
            if (existingIndex >= 0) {
                history[existingIndex] = entry;
            } else {
                history.push(entry);
            }
            
            // Keep last 45 days
            history.sort((a, b) => b.date.localeCompare(a.date));
            if (history.length > 45) history.length = 45;
            
            saveHistory(history);
            
            // Visual feedback
            const btns = document.querySelectorAll('#results-section button');
            const origText = event.currentTarget ? event.currentTarget.innerHTML : '';
            
            // Show success toast-ish
            const toast = document.createElement('div');
            toast.className = `fixed bottom-5 right-5 bg-emerald-600 text-white text-xs px-5 py-3 rounded-2xl flex items-center gap-x-2 shadow-xl z-[200] toast-animate`;
            toast.innerHTML = `<i class="fa-solid fa-check"></i> <span>Logged to your history!</span>`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.transition = 'all 0.3s';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 200);
            }, 1600);
            
            // Refresh trends
            renderHistory();
        }
        
        /**
         * Renders the history table in the DOM based on local storage data.
         */
        function renderHistory() {
            const history = getHistory();
            const tbody = document.getElementById('history-table-body');
            tbody.innerHTML = '';
            
            if (history.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-8 text-center text-xs text-zinc-400">No entries yet. Log your first calculation above.</td></tr>`;
                updateHistoryStats([]);
                return;
            }
            
            // Sort newest first
            const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
            
            sorted.slice(0, 12).forEach((entry, idx) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-zinc-900/70';
                
                const dateObj = new Date(entry.date);
                const dateStr = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                
                tr.innerHTML = `
                    <td class="px-5 py-3 font-medium text-xs">${dateStr}</td>
                    <td class="px-5 py-3 text-right font-mono font-semibold">${entry.total}</td>
                    <td class="px-4 py-3 text-right font-mono text-xs hidden md:table-cell">${entry.breakdown.transport}</td>
                    <td class="px-4 py-3 text-right font-mono text-xs hidden md:table-cell">${entry.breakdown.energy}</td>
                    <td class="px-4 py-3 text-right font-mono text-xs hidden md:table-cell">${entry.breakdown.food}</td>
                    <td class="px-4 py-3 text-right font-mono text-xs hidden md:table-cell">${entry.breakdown.other}</td>
                    <td class="px-2 py-3">
                        <button data-action="delete" data-idx="${idx}" data-date="${entry.date}" class="text-red-400/70 hover:text-red-400 p-1">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            updateHistoryStats(history);
            renderTrendChart(history);
        }
        
        /**
         * Updates streak and average statistics based on history data.
         * @param {Array} history - The history array
         */
        function updateHistoryStats(history) {
            const totalEl = document.getElementById('total-entries');
            const streakEl = document.getElementById('streak-value');
            const avgEl = document.getElementById('avg-7day');
            
            totalEl.textContent = history.length;
            
            if (history.length === 0) {
                streakEl.textContent = '—';
                avgEl.textContent = '—';
                return;
            }
            
            // Calculate streak
            const sortedDates = history.map(h => h.date).sort().reverse();
            let streak = 1;
            const today = new Date().toISOString().split('T')[0];
            
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const d1 = new Date(sortedDates[i]);
                const d2 = new Date(sortedDates[i + 1]);
                const diff = Math.floor((d1 - d2) / (1000 * 3600 * 24));
                
                if (diff === 1) {
                    streak++;
                } else {
                    break;
                }
            }
            
            // If today not logged, streak might be from yesterday
            if (!sortedDates.includes(today) && streak > 0) {
                // check if yesterday is there
            }
            
            streakEl.textContent = streak;
            
            // 7 day avg
            const last7 = history.slice(0, 7);
            const avg = last7.length > 0 ? (last7.reduce((sum, h) => sum + h.total, 0) / last7.length).toFixed(1) : '—';
            avgEl.textContent = avg;
        }
        
        /**
         * Renders the trend chart using Chart.js based on history.
         * @param {Array} history - The history array
         */
        function renderTrendChart(history) {
            const ctx = document.getElementById('trend-chart');
            if (!ctx) return;
            
            if (trendChartInstance) {
                trendChartInstance.destroy();
            }
            
            if (!history || history.length === 0) {
                // show placeholder text somehow
                return;
            }
            
            const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
            
            const labels = sorted.map(h => {
                const d = new Date(h.date);
                return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            });
            
            const data = sorted.map(h => h.total);
            
            trendChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily CO₂e (kg)',
                        data: data,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2.5,
                        tension: 0.35,
                        fill: true,
                        pointRadius: 2.5,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#10b981'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#27272a' },
                            ticks: { color: '#52525b', font: { size: 10 } }
                        },
                        x: {
                            grid: { color: '#27272a' },
                            ticks: { color: '#52525b', font: { size: 9 } }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    elements: {
                        line: { tension: 0.3 }
                    }
                }
            });
        }
        
        /**
         * Deletes a specific history entry.
         * @param {number} indexInSorted - Index of the entry in the sorted view (unused currently)
         * @param {string} date - The date string of the entry to delete
         */
        function deleteHistoryEntry(indexInSorted, date) {
            if (!confirm('Delete this entry?')) return;
            
            let history = getHistory();
            history = history.filter(h => h.date !== date);
            saveHistory(history);
            renderHistory();
        }
        
        /**
         * Clears all history entries after user confirmation.
         */
        function clearHistory() {
            if (!confirm('Clear ALL history? This cannot be undone.')) return;
            localStorage.removeItem('ecotrack_history');
            renderHistory();
        }
        
        /**
         * Exports the user's history as a downloadable CSV file.
         */
        function exportHistory() {
            const history = getHistory();
            if (!history || history.length === 0) {
                alert("No history to export yet.");
                return;
            }
            
            // Add BOM for Excel UTF-8 compatibility
            let csv = '\uFEFFDate,Total kgCO2e,Transport,Energy,Food,Other\n';
            
            history.forEach(h => {
                // Safe fallbacks for older/corrupted local storage entries
                const b = h.breakdown || {};
                csv += `${h.date || 'Unknown'},${h.total || 0},${b.transport || 0},${b.energy || 0},${b.food || 0},${b.other || 0}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.style.display = 'none';
            a.download = `ecotrack-history-${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup deferred to ensure download triggers properly
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 150);
        }
        
        function applyWhatIfFromHistory() {
            // placeholder if needed
        }
        
        // Profile
        function showProfileModal() {
            const modal = document.getElementById('profile-modal');
            const nameInput = document.getElementById('profile-name');
            
            const savedName = localStorage.getItem('ecotrack_name') || 'Anandakrishnan';
            nameInput.value = savedName;
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        
        function hideProfileModal() {
            const modal = document.getElementById('profile-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
        
        function saveProfile() {
            const name = document.getElementById('profile-name').value.trim() || 'User';
            localStorage.setItem('ecotrack_name', name);
            
            // update nav
            const navName = document.getElementById('nav-username');
            if (navName) navName.textContent = name.split(' ')[0];
            
            hideProfileModal();
        }
        
        function showSourcesModal() {
            const modal = document.getElementById('sources-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        
        function hideSourcesModal() {
            const modal = document.getElementById('sources-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
        
        function updateNavName() {
            const saved = localStorage.getItem('ecotrack_name') || 'Anandakrishnan';
            const el = document.getElementById('nav-username');
            if (el) el.textContent = saved.split(' ')[0];
        }
        
        function loadDemoData() {
            // Fill a nice demo and calculate
            const carKm = document.getElementById('car-km');
            const carKmNum = document.getElementById('car-km-num');
            const publicKm = document.getElementById('public-km');
            const publicKmNum = document.getElementById('public-km-num');
            const electricity = document.getElementById('electricity');
            const electricityNum = document.getElementById('electricity-num');
            
            carKm.value = 15;
            carKmNum.value = 15;
            publicKm.value = 22;
            publicKmNum.value = 22;
            document.getElementById('car-type').value = 'two_wheeler';
            electricity.value = 8.5;
            electricityNum.value = 8.5;
            document.getElementById('diet-type').value = 'vegetarian';
            document.getElementById('consumption').value = 'medium';
            document.getElementById('flight').value = '0';
            document.getElementById('notes').value = 'Demo data loaded — typical sustainable day in Chennai';
            
            updateAllSliders();
            
            // Auto calculate
            setTimeout(() => {
                calculateAndShowResults();
            }, 420);
        }
        
        function initializeSliders() {
            // Set initial values and listeners
            ['car-km', 'public-km', 'electricity'].forEach(id => {
                const slider = document.getElementById(id);
                const num = document.getElementById(id + '-num');
                
                if (slider) {
                    slider.addEventListener('input', () => updateSliderValue(id));
                    
                    // initial sync
                    if (num) num.value = slider.value;
                    const valEl = document.getElementById(id + '-value');
                    if (valEl) valEl.textContent = parseFloat(slider.value).toFixed(id === 'electricity' ? 1 : 0);
                }
                
                if (num) {
                    num.addEventListener('input', () => syncSlider(id));
                }
            });
            
            // Initial demo-ish values
            setTimeout(() => {
                const carSlider = document.getElementById('car-km');
                if (carSlider && parseFloat(carSlider.value) === 18) {
                    // already good defaults
                }
            }, 50);
        }
        
        function initializeEverything() {
            initTailwind();
            initializeSliders();
            updateNavName();
            
            // Load initial history
            renderHistory();
            
            // Keyboard support
            document.addEventListener('keydown', function(e) {
                if (e.key === '/' && document.activeElement.tagName === 'BODY') {
                    e.preventDefault();
                    document.getElementById('calculator').scrollIntoView({behavior:'smooth'});
                }
            });
            
            // Seed one demo entry if completely empty (first time user)
            const hist = getHistory();
            if (hist.length === 0) {
                // Optional: do nothing, or seed one example
                // For better first experience, perhaps seed a sample
                setTimeout(() => {
                    // Uncomment if you want a sample entry on first load
                    // const sample = { date: '2026-06-18', total: 4.8, breakdown: {transport:1.9, energy:1.4, food:1.3, other:0.2} };
                    // localStorage.setItem('ecotrack_history', JSON.stringify([sample]));
                    // renderHistory();
                }, 1200);
            }
            
            // Make sure sliders show values
            setTimeout(updateAllSliders, 80);
            
            // Easter egg / tip
            console.log('%c[EcoTrack] Built for Hack2skill Main Challenge 3. Data is sovereign — stays in browser. Good luck on the leaderboard!', 'color:#166534');
        }
        
        // Boot app
        window.onload = function() {
            initializeEverything();
        };
        
        // Expose a couple helpers for debugging / judges
        window.EcoTrack = {
            calculate: () => calculateFootprint(),
            getHistory: () => getHistory(),
            resetAll: () => { localStorage.clear(); location.reload(); }
        };

// --- EVENT BINDINGS (Refactored from inline) ---

// CommonJS exports for Jest testing
if (typeof module !== "undefined" && module.exports) {
    module.exports = { getHistory, saveHistory, logCurrentToHistory, deleteHistoryEntry, clearHistory, exportHistory };
}
