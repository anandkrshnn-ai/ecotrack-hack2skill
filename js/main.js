// Tailwind script
        function initTailwind() {
            document.documentElement.style.setProperty('--accent', '#10b981');
            
            if (typeof tailwind !== 'undefined') {
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
                            }
                        }
                    }
                };
            }
        }
        
        // Emission Factors (kgCO2e)
        const FACTORS = {
            transport: {
                two_wheeler: 0.09,
                car_petrol: 0.16,
                car_diesel: 0.14,
                car_ev: 0.06
            },
            public_transport: 0.05,
            electricity: 0.78,        // India approx
            food: {
                vegan: 1.8,
                vegetarian: 2.6,
                mixed: 3.9,
                high_meat: 5.8
            },
            consumption: {
                low: 0.6,
                medium: 1.3,
                high: 2.4
            },
            flight_short: 2.8,
            flight_medium: 6.5
        };
        
        let pieChartInstance = null;
        let trendChartInstance = null;
        let currentResults = null;
        
        // Easing number ticker
        function animateNumberValue(id, start, end, duration) {
            const obj = document.getElementById(id);
            if (!obj) return;
            const range = end - start;
            let startTime = null;
            
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeProgress = progress * (2 - progress); // outQuad
                const val = start + (range * easeProgress);
                obj.textContent = val.toFixed(id === 'total-value' ? 2 : 1);
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.textContent = end.toFixed(id === 'total-value' ? 2 : 1);
                }
            }
            window.requestAnimationFrame(step);
        }
        
        function updateSliderValue(id) {
            const slider = document.getElementById(id);
            const numInput = document.getElementById(id + '-num');
            const valueEl = document.getElementById(id + '-value');
            
            if (numInput) numInput.value = slider.value;
            if (valueEl) valueEl.textContent = parseFloat(slider.value).toFixed(id === 'electricity' ? 1 : 0);
        }
        
        function syncSlider(id) {
            const numInput = document.getElementById(id + '-num');
            const slider = document.getElementById(id);
            const valueEl = document.getElementById(id + '-value');
            
            if (!numInput || !slider) return;
            
            let val = parseFloat(numInput.value);
            if (isNaN(val)) val = 0;
            
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            val = Math.max(min, Math.min(max, val));
            
            slider.value = val;
            numInput.value = val;
            if (valueEl) valueEl.textContent = val.toFixed(id === 'electricity' ? 1 : 0);
        }
        
        function applyPreset(type) {
            // Deselect all preset buttons visually
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active', 'border-emerald-600'));
            
            const carKm = document.getElementById('car-km');
            const carKmNum = document.getElementById('car-km-num');
            const publicKm = document.getElementById('public-km');
            const publicKmNum = document.getElementById('public-km-num');
            const carType = document.getElementById('car-type');
            const electricity = document.getElementById('electricity');
            const electricityNum = document.getElementById('electricity-num');
            const diet = document.getElementById('diet-type');
            const consumption = document.getElementById('consumption');
            
            if (type === 'reset') {
                carKm.value = 0; carKmNum.value = 0;
                publicKm.value = 0; publicKmNum.value = 0;
                electricity.value = 6; electricityNum.value = 6;
                diet.value = 'mixed';
                consumption.value = 'medium';
                document.getElementById('flight').value = '0';
                document.getElementById('notes').value = '';
                updateAllSliders();
                return;
            }
            
            if (type === 'chennai-weekday') {
                carKm.value = 22; carKmNum.value = 22;
                publicKm.value = 14; publicKmNum.value = 14;
                carType.value = 'two_wheeler';
                electricity.value = 10.5; electricityNum.value = 10.5;
                diet.value = 'mixed';
                consumption.value = 'medium';
                document.getElementById('flight').value = '0';
            } 
            else if (type === 'low-impact') {
                carKm.value = 4; carKmNum.value = 4;
                publicKm.value = 18; publicKmNum.value = 18;
                carType.value = 'car_ev';
                electricity.value = 5.5; electricityNum.value = 5.5;
                diet.value = 'vegan';
                consumption.value = 'low';
                document.getElementById('flight').value = '0';
            } 
            else if (type === 'high-impact') {
                carKm.value = 45; carKmNum.value = 45;
                publicKm.value = 5; publicKmNum.value = 5;
                carType.value = 'car_petrol';
                electricity.value = 16; electricityNum.value = 16;
                diet.value = 'high_meat';
                consumption.value = 'high';
                document.getElementById('flight').value = '0';
            }
            
            updateAllSliders();
            
            // Highlight active preset
            const activeBtn = Array.from(document.querySelectorAll('.preset-btn')).find(b => b.textContent.toLowerCase().includes(type.split('-')[0]));
            if (activeBtn) activeBtn.classList.add('active', 'border-emerald-600');
        }
        
        function updateAllSliders() {
            ['car-km', 'public-km', 'electricity'].forEach(id => {
                const slider = document.getElementById(id);
                const num = document.getElementById(id + '-num');
                const valEl = document.getElementById(id + '-value');
                if (slider && num) {
                    num.value = slider.value;
                    if (valEl) valEl.textContent = parseFloat(slider.value).toFixed(id === 'electricity' ? 1 : 0);
                }
            });
        }
        
        function calculateFootprint() {
            const carKm = parseFloat(document.getElementById('car-km').value) || 0;
            const publicKm = parseFloat(document.getElementById('public-km').value) || 0;
            const carType = document.getElementById('car-type').value;
            const electricityKwh = parseFloat(document.getElementById('electricity').value) || 0;
            const dietType = document.getElementById('diet-type').value;
            const consumptionLevel = document.getElementById('consumption').value;
            const flight = document.getElementById('flight').value;
            
            let transport = 0;
            
            // Car / Two-wheeler
            const carFactor = FACTORS.transport[carType] || 0.15;
            transport += carKm * carFactor;
            
            // Public
            transport += publicKm * FACTORS.public_transport;
            
            // Flight
            if (flight === 'short') transport += FACTORS.flight_short;
            if (flight === 'medium') transport += FACTORS.flight_medium;
            
            const energy = electricityKwh * FACTORS.electricity;
            const food = FACTORS.food[dietType] || 3.5;
            const other = FACTORS.consumption[consumptionLevel] || 1.3;
            
            const total = transport + energy + food + other;
            
            return {
                total: parseFloat(total.toFixed(2)),
                breakdown: {
                    transport: parseFloat(transport.toFixed(2)),
                    energy: parseFloat(energy.toFixed(2)),
                    food: parseFloat(food.toFixed(2)),
                    other: parseFloat(other.toFixed(2))
                },
                inputs: {
                    carKm, publicKm, carType, electricityKwh, dietType, consumptionLevel, flight
                }
            };
        }
        
        function getEcoScore(total) {
            // Simple scoring: lower is better. Max score 95 for very low footprint
            if (total <= 3.0) return { score: 92, label: "Excellent", color: "emerald" };
            if (total <= 4.5) return { score: 78, label: "Very Good", color: "emerald" };
            if (total <= 6.5) return { score: 62, label: "Good", color: "teal" };
            if (total <= 9.0) return { score: 45, label: "Average", color: "amber" };
            return { score: 28, label: "High Impact", color: "rose" };
        }
        
        function generateRecommendations(breakdown, total) {
            const recs = [];
            const transportPct = (breakdown.transport / total) * 100;
            const foodPct = (breakdown.food / total) * 100;
            const energyPct = (breakdown.energy / total) * 100;
            
            if (transportPct > 38) {
                recs.push({
                    icon: "fa-car-side",
                    title: "Mobility is your top lever",
                    text: "Try replacing 40% of two-wheeler/car trips with Chennai Metro or MTC. Potential daily saving: " + (breakdown.transport * 0.38).toFixed(1) + " kg",
                    impact: "High"
                });
            }
            
            if (foodPct > 42 || breakdown.food > 4.2) {
                recs.push({
                    icon: "fa-utensils",
                    title: "Shift 2–3 meals to plant-forward",
                    text: "Reducing red meat and increasing lentils/millets can cut food emissions by 30–45%. Easy win in Indian diets.",
                    impact: "High"
                });
            }
            
            if (energyPct > 28 && breakdown.energy > 3) {
                recs.push({
                    icon: "fa-bolt-lightning",
                    title: "Optimize cooling & appliances",
                    text: "Run AC 1–2 hrs less or at 26–27°C. Shift heavy loads to daytime solar hours. Saves ~1.2–2 kg on typical days.",
                    impact: "Medium"
                });
            }
            
            if (total < 4.2) {
                recs.push({
                    icon: "fa-tachometer-alt",
                    title: "You're already doing great!",
                    text: "Your footprint is well below the Indian average. Share your habits — inspire friends and family.",
                    impact: "Inspire"
                });
            } else if (total > 8) {
                recs.push({
                    icon: "fa-exclamation-triangle",
                    title: "High impact day — focus on 1 change",
                    text: "Pick the single biggest category above and improve it consistently for 7 days. Small wins build momentum.",
                    impact: "Action"
                });
            }
            
            // Always add one general
            if (recs.length < 3) {
                recs.push({
                    icon: "fa-recycle",
                    title: "Segregate & reduce waste",
                    text: "Composting kitchen waste and avoiding single-use plastics reduces methane and embodied emissions significantly over time.",
                    impact: "Medium"
                });
            }
            
            return recs.slice(0, 4);
        }
        
        function renderBreakdown(breakdown, total) {
            const container = document.getElementById('breakdown-list');
            container.innerHTML = '';
            
            const categories = [
                { key: 'transport', label: 'Transport', color: 'emerald', icon: 'fa-car-side' },
                { key: 'energy', label: 'Home Energy', color: 'amber', icon: 'fa-bolt-lightning' },
                { key: 'food', label: 'Food & Diet', color: 'orange', icon: 'fa-utensils' },
                { key: 'other', label: 'Consumption & Waste', color: 'sky', icon: 'fa-shopping-bag' }
            ];
            
            categories.forEach(cat => {
                const val = breakdown[cat.key];
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between text-sm';
                div.innerHTML = `
                     <div class="flex items-center gap-x-2.5 w-2/5">
                        <i class="fa-solid ${cat.icon} text-${cat.color}-400 w-4"></i>
                        <span class="font-medium">${cat.label}</span>
                    </div>
                    <div class="flex-1 mx-3">
                        <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div class="h-1.5 bg-${cat.color}-400 rounded-full transition-all" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="font-mono w-16 text-right tabular-nums">
                        <span class="font-semibold">${val}</span>
                        <span class="text-xs text-zinc-500">kg</span>
                    </div>
                `;
                container.appendChild(div);
                
                // Trigger transition delay
                setTimeout(() => {
                    const bar = div.querySelector(`.bg-${cat.color}-400`);
                    if (bar) bar.style.width = `${pct}%`;
                }, 80);
            });
            
            // Update bar visuals in results header area
            const barTransport = document.getElementById('bar-transport');
            const barEnergy = document.getElementById('bar-energy');
            if (barTransport) barTransport.style.width = total > 0 ? ((breakdown.transport / total) * 100) + '%' : '0%';
            if (barEnergy) barEnergy.style.width = total > 0 ? ((breakdown.energy / total) * 100) + '%' : '0%';
            
            document.getElementById('val-transport').textContent = breakdown.transport;
            document.getElementById('val-energy').textContent = breakdown.energy;
        }
        
        function renderPieChart(breakdown) {
            const ctx = document.getElementById('pie-chart');
            if (!ctx) return;
            
            if (pieChartInstance) {
                pieChartInstance.destroy();
            }
            
            const data = {
                labels: ['Transport', 'Energy', 'Food', 'Other'],
                datasets: [{
                    data: [breakdown.transport, breakdown.energy, breakdown.food, breakdown.other],
                    backgroundColor: ['#10b981', '#fbbf24', '#fb923c', '#38bdf8'],
                    borderColor: '#18181b',
                    borderWidth: 3,
                    hoverOffset: 18
                }]
            };
            
            pieChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    plugins: {
                        legend: {
                            position: 'right',
                            align: 'center',
                            labels: {
                                boxWidth: 11,
                                padding: 14,
                                font: { size: 11, weight: 500 },
                                color: '#71717a'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ctx.raw + ' kg (' + Math.round(ctx.raw / (breakdown.transport + breakdown.energy + breakdown.food + breakdown.other) * 100) + '%)'
                            }
                        }
                    }
                }
            });
        }
        
        function showResults(results) {
            currentResults = results;
            
            const section = document.getElementById('results-section');
            section.classList.remove('hidden');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Big number (Animated count-up)
            animateNumberValue('total-value', 0.0, results.total, 950);
            
            // Comparison
            const indianAvg = 5.2;
            const pctOfAvg = Math.round((results.total / indianAvg) * 100);
            let compHTML = '';
            
            if (results.total < 3.8) {
                compHTML = `<span class="inline-flex items-center px-3 py-0.5 rounded-full text-xs bg-emerald-900 text-emerald-300">Well below Indian average (${pctOfAvg}%)</span>`;
            } else if (results.total < 5.5) {
                compHTML = `<span class="inline-flex items-center px-3 py-0.5 rounded-full text-xs bg-teal-900 text-teal-300">Around Indian average (${pctOfAvg}%)</span>`;
            } else {
                compHTML = `<span class="inline-flex items-center px-3 py-0.5 rounded-full text-xs bg-amber-900 text-amber-300">Above average (${pctOfAvg}% of Indian daily)</span>`;
            }
            document.getElementById('comparison-text').innerHTML = compHTML;
            
            // Eco score
            const eco = getEcoScore(results.total);
            const badge = document.getElementById('eco-score-badge');
            badge.innerHTML = `<span class="font-bold">${eco.score}</span> <span class="font-normal text-xs">/ 100 • ${eco.label}</span>`;
            badge.className = `inline-flex items-center px-4 h-8 rounded-2xl text-sm font-bold bg-${eco.color}-900 text-${eco.color}-300`;
            
            // Breakdown list + bars
            renderBreakdown(results.breakdown, results.total);
            
            // Pie
            renderPieChart(results.breakdown);
            
            // Recommendations
            renderInsights(results.breakdown, results.total);
            
            // Hide whatif result if open
            document.getElementById('whatif-result').classList.add('hidden');
        }
        
        function hideResults() {
            document.getElementById('results-section').classList.add('hidden');
        }
        
        function calculateAndShowResults() {
            const results = calculateFootprint();
            showResults(results);
        }
        
        function applyWhatIf(type) {
            if (!currentResults) {
                alert("Please calculate your footprint first.");
                return;
            }
            
            let newTotal = currentResults.total;
            let message = '';
            
            if (type === 'metro') {
                // Assume 50% of car/two-wheeler distance moved to public
                const transportSaved = currentResults.breakdown.transport * 0.42;
                newTotal = parseFloat((currentResults.total - transportSaved).toFixed(2));
                message = `Switched significant car/two-wheeler km to metro/bus`;
            } 
            else if (type === 'diet') {
                const foodSaved = Math.max(0, currentResults.breakdown.food - 2.4);
                newTotal = parseFloat((currentResults.total - foodSaved * 0.55).toFixed(2));
                message = `Reduced red meat frequency`;
            } 
            else if (type === 'energy') {
                const energySaved = currentResults.breakdown.energy * 0.22;
                newTotal = parseFloat((currentResults.total - energySaved).toFixed(2));
                message = `Reduced AC / heavy appliance use`;
            }
            
            // Show result
            const whatifBox = document.getElementById('whatif-result');
            document.getElementById('whatif-total').innerHTML = newTotal + ` <span class="text-xs text-zinc-400">(${message})</span>`;
            whatifBox.classList.remove('hidden');
            
            // Temporarily update main number
            const orig = document.getElementById('total-value').textContent;
            document.getElementById('total-value').innerHTML = newTotal + `<span class="text-xs align-super ml-1 text-emerald-400">(-${(currentResults.total - newTotal).toFixed(1)})</span>`;
            
            setTimeout(() => {
                if (!whatifBox.classList.contains('hidden')) {
                    document.getElementById('total-value').textContent = orig;
                }
            }, 4200);
        }
        
        function resetWhatIf() {
            document.getElementById('whatif-result').classList.add('hidden');
            if (currentResults) {
                document.getElementById('total-value').textContent = currentResults.total;
            }
        }
        
        function renderInsights(breakdown, total) {
            const container = document.getElementById('insights-list');
            container.innerHTML = '';
            
            const recs = generateRecommendations(breakdown, total);
            
            recs.forEach(rec => {
                const card = document.createElement('div');
                card.className = `tip-card border border-zinc-700 bg-zinc-900 p-5 rounded-3xl flex gap-4`;
                card.innerHTML = `
                    <div class="mt-0.5">
                        <i class="fa-solid ${rec.icon} text-xl text-emerald-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-semibold">${rec.title}</div>
                        <div class="text-xs text-zinc-300 mt-1 leading-snug">${rec.text}</div>
                        <div class="mt-2">
                            <span class="inline-block text-[10px] px-2.5 py-px rounded bg-zinc-800 text-emerald-400">${rec.impact} impact</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            
            // If no dynamic, show some defaults
            if (recs.length === 0) {
                container.innerHTML = `
                    <div class="tip-card border border-zinc-700 bg-zinc-900 p-5 rounded-3xl">
                        <div class="font-semibold">Track consistently for 7 days</div>
                        <div class="text-xs mt-1 text-zinc-300">Seeing your own trend is the fastest way to build better habits.</div>
                    </div>
                `;
            }
        }
        
        // HISTORY MANAGEMENT
        function getHistory() {
            try {
                const data = localStorage.getItem('ecotrack_history');
                return data ? JSON.parse(data) : [];
            } catch(e) { return []; }
        }
        
        function saveHistory(history) {
            localStorage.setItem('ecotrack_history', JSON.stringify(history));
        }
        
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
        
        function deleteHistoryEntry(indexInSorted, date) {
            if (!confirm('Delete this entry?')) return;
            
            let history = getHistory();
            history = history.filter(h => h.date !== date);
            saveHistory(history);
            renderHistory();
        }
        
        function clearHistory() {
            if (!confirm('Clear ALL history? This cannot be undone.')) return;
            localStorage.removeItem('ecotrack_history');
            renderHistory();
        }
        
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
document.addEventListener('DOMContentLoaded', () => {
    const el_auto_bind_1 = document.getElementById('auto-bind-1');
    if(el_auto_bind_1) el_auto_bind_1.addEventListener('click', (event) => {
        showProfileModal();
    });
    const el_auto_bind_2 = document.getElementById('auto-bind-2');
    if(el_auto_bind_2) el_auto_bind_2.addEventListener('click', (event) => {
        document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    });
    const el_auto_bind_3 = document.getElementById('auto-bind-3');
    if(el_auto_bind_3) el_auto_bind_3.addEventListener('click', (event) => {
        loadDemoData();
    });
    const el_auto_bind_4 = document.getElementById('auto-bind-4');
    if(el_auto_bind_4) el_auto_bind_4.addEventListener('click', (event) => {
        applyPreset('chennai-weekday');
    });
    const el_auto_bind_5 = document.getElementById('auto-bind-5');
    if(el_auto_bind_5) el_auto_bind_5.addEventListener('click', (event) => {
        applyPreset('low-impact');
    });
    const el_auto_bind_6 = document.getElementById('auto-bind-6');
    if(el_auto_bind_6) el_auto_bind_6.addEventListener('click', (event) => {
        applyPreset('high-impact');
    });
    const el_auto_bind_7 = document.getElementById('auto-bind-7');
    if(el_auto_bind_7) el_auto_bind_7.addEventListener('click', (event) => {
        applyPreset('reset');
    });
    const el_car_km = document.getElementById('car-km');
    if(el_car_km) el_car_km.addEventListener('input', (event) => {
        updateSliderValue('car-km');
    });
    const el_car_km_num = document.getElementById('car-km-num');
    if(el_car_km_num) el_car_km_num.addEventListener('change', (event) => {
        syncSlider('car-km');
    });
    const el_public_km = document.getElementById('public-km');
    if(el_public_km) el_public_km.addEventListener('input', (event) => {
        updateSliderValue('public-km');
    });
    const el_public_km_num = document.getElementById('public-km-num');
    if(el_public_km_num) el_public_km_num.addEventListener('change', (event) => {
        syncSlider('public-km');
    });
    const el_electricity = document.getElementById('electricity');
    if(el_electricity) el_electricity.addEventListener('input', (event) => {
        updateSliderValue('electricity');
    });
    const el_electricity_num = document.getElementById('electricity-num');
    if(el_electricity_num) el_electricity_num.addEventListener('change', (event) => {
        syncSlider('electricity');
    });
    const el_auto_bind_8 = document.getElementById('auto-bind-8');
    if(el_auto_bind_8) el_auto_bind_8.addEventListener('click', (event) => {
        calculateAndShowResults();
    });
    const el_auto_bind_9 = document.getElementById('auto-bind-9');
    if(el_auto_bind_9) el_auto_bind_9.addEventListener('click', (event) => {
        hideResults();
    });
    const el_auto_bind_10 = document.getElementById('auto-bind-10');
    if(el_auto_bind_10) el_auto_bind_10.addEventListener('click', (event) => {
        logCurrentToHistory();
    });
    const el_auto_bind_11 = document.getElementById('auto-bind-11');
    if(el_auto_bind_11) el_auto_bind_11.addEventListener('click', (event) => {
        applyWhatIf('metro');
    });
    const el_auto_bind_12 = document.getElementById('auto-bind-12');
    if(el_auto_bind_12) el_auto_bind_12.addEventListener('click', (event) => {
        applyWhatIf('diet');
    });
    const el_auto_bind_13 = document.getElementById('auto-bind-13');
    if(el_auto_bind_13) el_auto_bind_13.addEventListener('click', (event) => {
        applyWhatIf('energy');
    });
    const el_auto_bind_14 = document.getElementById('auto-bind-14');
    if(el_auto_bind_14) el_auto_bind_14.addEventListener('click', (event) => {
        resetWhatIf();
    });
    const el_auto_bind_15 = document.getElementById('auto-bind-15');
    if(el_auto_bind_15) el_auto_bind_15.addEventListener('click', (event) => {
        exportHistory();
    });
    const el_auto_bind_16 = document.getElementById('auto-bind-16');
    if(el_auto_bind_16) el_auto_bind_16.addEventListener('click', (event) => {
        clearHistory();
    });
    const el_auto_bind_17 = document.getElementById('auto-bind-17');
    if(el_auto_bind_17) el_auto_bind_17.addEventListener('click', (event) => {
        showSourcesModal();
    });
    const el_profile_modal = document.getElementById('profile-modal');
    if(el_profile_modal) el_profile_modal.addEventListener('click', (event) => {
        if (event.target.id === 'profile-modal') hideProfileModal();
    });
    const el_auto_bind_18 = document.getElementById('auto-bind-18');
    if(el_auto_bind_18) el_auto_bind_18.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
    });
    const el_auto_bind_19 = document.getElementById('auto-bind-19');
    if(el_auto_bind_19) el_auto_bind_19.addEventListener('click', (event) => {
        hideProfileModal();
    });
    const el_auto_bind_20 = document.getElementById('auto-bind-20');
    if(el_auto_bind_20) el_auto_bind_20.addEventListener('click', (event) => {
        saveProfile();
    });
    const el_auto_bind_21 = document.getElementById('auto-bind-21');
    if(el_auto_bind_21) el_auto_bind_21.addEventListener('click', (event) => {
        hideProfileModal();
    });
    const el_sources_modal = document.getElementById('sources-modal');
    if(el_sources_modal) el_sources_modal.addEventListener('click', (event) => {
        if (event.target.id === 'sources-modal') hideSourcesModal();
    });
    const el_auto_bind_22 = document.getElementById('auto-bind-22');
    if(el_auto_bind_22) el_auto_bind_22.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
    });
    const el_auto_bind_23 = document.getElementById('auto-bind-23');
    if(el_auto_bind_23) el_auto_bind_23.addEventListener('click', (event) => {
        hideSourcesModal();
    });
});

// Event delegation for dynamically rendered items
document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-action="delete"]');
    if (deleteBtn) {
        const idx = parseInt(deleteBtn.getAttribute('data-idx'));
        const date = deleteBtn.getAttribute('data-date');
        deleteHistoryEntry(idx, date);
    }
});
