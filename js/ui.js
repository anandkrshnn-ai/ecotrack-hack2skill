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
        
        