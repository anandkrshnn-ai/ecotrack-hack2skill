"use strict";

/**
 * @fileoverview Core calculation logic for carbon footprint.
 * Contains emission factors, footprint calculation, scoring, and recommendations.
 * @module calculator
 */

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
        
        
/**
 * Calculates the total carbon footprint and breakdown based on DOM inputs.
 * 
 * @returns {Object} Result object containing total, breakdown, and original inputs
 */
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
        
        
/**
 * Determines an eco-score, label, and UI color based on total footprint.
 * 
 * @param {number} total - The total carbon footprint in kgCO2e
 * @returns {Object} Score object with score, label, and color properties
 */
function getEcoScore(total) {
            // Simple scoring: lower is better. Max score 95 for very low footprint
            if (total <= 3.0) return { score: 92, label: "Excellent", color: "emerald" };
            if (total <= 4.5) return { score: 78, label: "Very Good", color: "emerald" };
            if (total <= 6.5) return { score: 62, label: "Good", color: "teal" };
            if (total <= 9.0) return { score: 45, label: "Average", color: "amber" };
            return { score: 28, label: "High Impact", color: "rose" };
        }
        
        
/**
 * Generates actionable recommendations based on the footprint breakdown.
 * 
 * @param {Object} breakdown - Breakdown of emissions by category
 * @param {number} total - The total carbon footprint
 * @returns {Array} List of recommendation objects
 */
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
        
        
// CommonJS exports for Jest testing
if (typeof module !== "undefined" && module.exports) {
    module.exports = { FACTORS, calculateFootprint, getEcoScore, generateRecommendations };
}
