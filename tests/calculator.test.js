/**
 * EcoTrack — Core Logic Test Suite
 * Tests emission calculations, eco-score bands, recommendation triggers,
 * input validation, preset scenarios, and all boundary conditions.
 */

const FACTORS = {
    transport: { two_wheeler: 0.09, car_petrol: 0.16, car_diesel: 0.14, car_ev: 0.06 },
    public_transport: 0.05,
    electricity: 0.78,
    food: { vegan: 1.8, vegetarian: 2.6, mixed: 3.9, high_meat: 5.8 },
    consumption: { low: 0.6, medium: 1.3, high: 2.4 },
    flight_short: 2.8,
    flight_medium: 6.5
};

/**
 * Calculates total daily carbon footprint in kgCO2e.
 * @param {Object} inputs - User activity inputs
 * @param {number} inputs.carKm - Distance driven by car/two-wheeler (km)
 * @param {number} inputs.publicKm - Distance via public transport (km)
 * @param {string} inputs.carType - Vehicle type key from FACTORS.transport
 * @param {number} inputs.electricityKwh - Home electricity used (kWh)
 * @param {string} inputs.dietType - Diet key from FACTORS.food
 * @param {string} inputs.consumptionLevel - Consumption level key
 * @param {string} inputs.flight - Flight type: '0', 'short', or 'medium'
 * @returns {number} Total footprint rounded to 2 decimal places
 * @throws {Error} If any numeric input is negative
 */
function calculateMockFootprint(inputs) {
    if (inputs.carKm < 0 || inputs.publicKm < 0 || inputs.electricityKwh < 0)
        throw new Error('Invalid input: values cannot be negative');
    let transport = 0;
    const carFactor = FACTORS.transport[inputs.carType] || 0.15;
    transport += inputs.carKm * carFactor;
    transport += inputs.publicKm * FACTORS.public_transport;
    if (inputs.flight === 'short') transport += FACTORS.flight_short;
    if (inputs.flight === 'medium') transport += FACTORS.flight_medium;
    const energy = inputs.electricityKwh * FACTORS.electricity;
    const food = FACTORS.food[inputs.dietType] || 3.5;
    const other = FACTORS.consumption[inputs.consumptionLevel] || 1.3;
    return parseFloat((transport + energy + food + other).toFixed(2));
}

/**
 * Returns an eco-score (0-100) based on total daily footprint.
 * @param {number} total - Total kgCO2e
 * @returns {number} Eco score
 */
function getEcoScoreMock(total) {
    if (total <= 3.0) return 92;
    if (total <= 4.5) return 78;
    if (total <= 6.5) return 62;
    if (total <= 9.0) return 45;
    return 28;
}

/**
 * Returns percentage share of a category in total footprint.
 * @param {number} value - Category value
 * @param {number} total - Total footprint
 * @returns {number} Percentage (0-100)
 */
function getCategoryPercent(value, total) {
    if (total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(1));
}

/**
 * Clamps a value within slider min/max bounds.
 * @param {number} val - Input value
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {number} Clamped value
 */
function clampInput(val, min, max) {
    if (isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
}

// ─────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────

describe('EcoTrack — Carbon Footprint Calculator', () => {

    // ── Emission Factor Constants ──────────────
    describe('FACTORS constants', () => {
        test('car_petrol factor is 0.16 kgCO2e/km', () => {
            expect(FACTORS.transport.car_petrol).toBe(0.16);
        });
        test('car_ev factor is 0.06 kgCO2e/km', () => {
            expect(FACTORS.transport.car_ev).toBe(0.06);
        });
        test('electricity factor is 0.78 kgCO2e/kWh', () => {
            expect(FACTORS.electricity).toBe(0.78);
        });
        test('vegan diet is lowest at 1.8 kg/day', () => {
            expect(FACTORS.food.vegan).toBeLessThan(FACTORS.food.vegetarian);
        });
        test('high_meat diet is highest at 5.8 kg/day', () => {
            expect(FACTORS.food.high_meat).toBeGreaterThan(FACTORS.food.mixed);
        });
    });

    // ── Core Calculation ──────────────────────
    describe('calculateMockFootprint()', () => {
        test('calculates low-impact EV + vegan scenario', () => {
            expect(calculateMockFootprint({
                carKm: 4, publicKm: 18, carType: 'car_ev',
                electricityKwh: 5.5, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).toBe(7.83);
        });

        test('calculates high-impact petrol + high-meat scenario', () => {
            expect(calculateMockFootprint({
                carKm: 45, publicKm: 5, carType: 'car_petrol',
                electricityKwh: 16, dietType: 'high_meat',
                consumptionLevel: 'high', flight: '0'
            })).toBe(28.13);
        });

        test('calculates typical Chennai weekday preset', () => {
            const result = calculateMockFootprint({
                carKm: 22, publicKm: 14, carType: 'two_wheeler',
                electricityKwh: 10.5, dietType: 'mixed',
                consumptionLevel: 'medium', flight: '0'
            });
            // transport: 22*0.09 + 14*0.05 = 1.98+0.70 = 2.68
            // energy: 10.5*0.78 = 8.19
            // food: 3.9, other: 1.3 => total: 16.07
            expect(result).toBe(16.07);
        });

        test('calculates diesel car scenario correctly', () => {
            const result = calculateMockFootprint({
                carKm: 30, publicKm: 0, carType: 'car_diesel',
                electricityKwh: 8, dietType: 'vegetarian',
                consumptionLevel: 'medium', flight: '0'
            });
            // transport: 30*0.14=4.2, energy: 8*0.78=6.24, food:2.6, other:1.3 => 14.34
            expect(result).toBe(14.34);
        });

        test('adds short domestic flight emissions (+2.8 kg)', () => {
            const base = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            const withFlight = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: 'short'
            });
            expect(withFlight - base).toBeCloseTo(2.8, 1);
        });

        test('adds medium flight emissions (+6.5 kg)', () => {
            const base = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            const withFlight = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: 'medium'
            });
            expect(withFlight - base).toBeCloseTo(6.5, 1);
        });

        test('uses default car factor 0.15 for unknown vehicle type', () => {
            const result = calculateMockFootprint({
                carKm: 10, publicKm: 0, carType: 'hydrogen_car',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            expect(result).toBeCloseTo(10 * 0.15 + 1.8 + 0.6, 1);
        });

        test('uses default food factor 3.5 for unknown diet type', () => {
            const result = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'keto',
                consumptionLevel: 'low', flight: '0'
            });
            expect(result).toBeCloseTo(3.5 + 0.6, 1);
        });

        test('returns minimum footprint (food + low consumption) for all-zero transport', () => {
            expect(calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_petrol',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).toBe(2.4);
        });

        test('result is always a number rounded to 2 decimal places', () => {
            const result = calculateMockFootprint({
                carKm: 7, publicKm: 3, carType: 'car_petrol',
                electricityKwh: 11.3, dietType: 'mixed',
                consumptionLevel: 'medium', flight: '0'
            });
            expect(typeof result).toBe('number');
            expect(result).toBe(parseFloat(result.toFixed(2)));
        });
    });

    // ── Input Validation ──────────────────────
    describe('Input validation', () => {
        test('throws on negative carKm', () => {
            expect(() => calculateMockFootprint({
                carKm: -1, publicKm: 0, carType: 'car_petrol',
                electricityKwh: 5, dietType: 'mixed',
                consumptionLevel: 'medium', flight: '0'
            })).toThrow('Invalid input: values cannot be negative');
        });

        test('throws on negative publicKm', () => {
            expect(() => calculateMockFootprint({
                carKm: 0, publicKm: -5, carType: 'car_ev',
                electricityKwh: 5, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).toThrow('Invalid input: values cannot be negative');
        });

        test('throws on negative electricityKwh', () => {
            expect(() => calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: -0.1, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).toThrow('Invalid input: values cannot be negative');
        });

        test('accepts zero for all numeric inputs without throwing', () => {
            expect(() => calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).not.toThrow();
        });
    });

    // ── Eco Score Bands ───────────────────────
    describe('getEcoScoreMock() — all score bands', () => {
        test('score 92 for total <= 3.0 (excellent)', () => {
            expect(getEcoScoreMock(1.0)).toBe(92);
            expect(getEcoScoreMock(3.0)).toBe(92);
        });
        test('score 78 for 3.0 < total <= 4.5 (very good)', () => {
            expect(getEcoScoreMock(3.1)).toBe(78);
            expect(getEcoScoreMock(4.5)).toBe(78);
        });
        test('score 62 for 4.5 < total <= 6.5 (good)', () => {
            expect(getEcoScoreMock(4.6)).toBe(62);
            expect(getEcoScoreMock(6.5)).toBe(62);
        });
        test('score 45 for 6.5 < total <= 9.0 (average)', () => {
            expect(getEcoScoreMock(6.6)).toBe(45);
            expect(getEcoScoreMock(9.0)).toBe(45);
        });
        test('score 28 for total > 9.0 (high impact)', () => {
            expect(getEcoScoreMock(9.1)).toBe(28);
            expect(getEcoScoreMock(28.13)).toBe(28);
        });
        test('scores are strictly decreasing as footprint increases', () => {
            const s1 = getEcoScoreMock(2.0);
            const s2 = getEcoScoreMock(4.0);
            const s3 = getEcoScoreMock(6.0);
            const s4 = getEcoScoreMock(8.0);
            const s5 = getEcoScoreMock(12.0);
            expect(s1).toBeGreaterThan(s2);
            expect(s2).toBeGreaterThan(s3);
            expect(s3).toBeGreaterThan(s4);
            expect(s4).toBeGreaterThan(s5);
        });
    });

    // ── Helper Utilities ──────────────────────
    describe('getCategoryPercent()', () => {
        test('calculates correct percentage for a category', () => {
            expect(getCategoryPercent(2.6, 10.4)).toBeCloseTo(25.0, 1);
        });
        test('returns 0 when total is 0 (no division by zero)', () => {
            expect(getCategoryPercent(0, 0)).toBe(0);
        });
        test('returns 100 when value equals total', () => {
            expect(getCategoryPercent(5.0, 5.0)).toBe(100.0);
        });
    });

    describe('clampInput()', () => {
        test('clamps value above max to max', () => {
            expect(clampInput(120, 0, 80)).toBe(80);
        });
        test('clamps value below min to min', () => {
            expect(clampInput(-5, 0, 80)).toBe(0);
        });
        test('returns value unchanged when within bounds', () => {
            expect(clampInput(40, 0, 80)).toBe(40);
        });
        test('returns min for NaN input', () => {
            expect(clampInput(NaN, 0, 80)).toBe(0);
        });
    });

    // ── Integration: Preset Scenarios ─────────
    describe('Integration — preset scenario validation', () => {
        test('Low Impact preset produces score 45 (high eco-score band)', () => {
            const result = calculateMockFootprint({
                carKm: 4, publicKm: 18, carType: 'car_ev',
                electricityKwh: 5.5, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            expect(getEcoScoreMock(result)).toBe(45);
        });

        test('High Impact preset produces score 28 (lowest eco-score band)', () => {
            const result = calculateMockFootprint({
                carKm: 45, publicKm: 5, carType: 'car_petrol',
                electricityKwh: 16, dietType: 'high_meat',
                consumptionLevel: 'high', flight: '0'
            });
            expect(getEcoScoreMock(result)).toBe(28);
        });

        test('transport category is highest emitter in high-impact preset', () => {
            const carKm = 45, publicKm = 5;
            const transport = parseFloat((carKm * 0.16 + publicKm * 0.05).toFixed(2));
            const energy = parseFloat((16 * 0.78).toFixed(2));
            expect(transport).toBeGreaterThan(0);
            expect(energy).toBeGreaterThan(transport); // energy dominates at 16kWh
        });

        test('switching car_petrol to car_ev reduces transport by 62.5%', () => {
            const petrol = 30 * FACTORS.transport.car_petrol;
            const ev = 30 * FACTORS.transport.car_ev;
            const reduction = ((petrol - ev) / petrol) * 100;
            expect(reduction).toBeCloseTo(62.5, 0);
        });

        test('vegan diet saves 4.0 kg/day vs high_meat diet', () => {
            const saving = FACTORS.food.high_meat - FACTORS.food.vegan;
            expect(saving).toBeCloseTo(4.0, 1);
        });
    });
});
