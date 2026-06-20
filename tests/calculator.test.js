const FACTORS = {
    transport: { two_wheeler: 0.09, car_petrol: 0.16, car_diesel: 0.14, car_ev: 0.06 },
    public_transport: 0.05,
    electricity: 0.78,
    food: { vegan: 1.8, vegetarian: 2.6, mixed: 3.9, high_meat: 5.8 },
    consumption: { low: 0.6, medium: 1.3, high: 2.4 },
    flight_short: 2.8,
    flight_medium: 6.5
};

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

function getEcoScoreMock(total) {
    if (total <= 3.0) return 92;
    if (total <= 4.5) return 78;
    if (total <= 6.5) return 62;
    if (total <= 9.0) return 45;
    return 28;
}

describe('Carbon Footprint Calculator', () => {
    describe('calculateMockFootprint()', () => {
        test('calculates low-impact EV+vegan scenario correctly', () => {
            const result = calculateMockFootprint({
                carKm: 4, publicKm: 18, carType: 'car_ev',
                electricityKwh: 5.5, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            expect(result).toBe(7.83);
        });

        test('calculates high-impact petrol+meat scenario correctly', () => {
            const result = calculateMockFootprint({
                carKm: 45, publicKm: 5, carType: 'car_petrol',
                electricityKwh: 16, dietType: 'high_meat',
                consumptionLevel: 'high', flight: '0'
            });
            expect(result).toBe(28.13);
        });

        test('adds short flight emissions correctly', () => {
            const withFlight = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: 'short'
            });
            expect(withFlight).toBeCloseTo(1.8 + 0.6 + 2.8, 1);
        });

        test('adds medium flight emissions correctly', () => {
            const withFlight = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: 'medium'
            });
            expect(withFlight).toBeCloseTo(1.8 + 0.6 + 6.5, 1);
        });

        test('falls back to default car factor for unknown vehicle type', () => {
            const result = calculateMockFootprint({
                carKm: 10, publicKm: 0, carType: 'unknown_vehicle',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            expect(result).toBeCloseTo(10 * 0.15 + 1.8 + 0.6, 1);
        });

        test('returns minimum footprint for all-zero transport and energy inputs', () => {
            const result = calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_petrol',
                electricityKwh: 0, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            });
            expect(result).toBe(2.4);
        });

        test('throws error on negative carKm', () => {
            expect(() => calculateMockFootprint({
                carKm: -10, publicKm: 0, carType: 'car_petrol',
                electricityKwh: 5, dietType: 'mixed',
                consumptionLevel: 'medium', flight: '0'
            })).toThrow('Invalid input: values cannot be negative');
        });

        test('throws error on negative electricity input', () => {
            expect(() => calculateMockFootprint({
                carKm: 0, publicKm: 0, carType: 'car_ev',
                electricityKwh: -5, dietType: 'vegan',
                consumptionLevel: 'low', flight: '0'
            })).toThrow('Invalid input: values cannot be negative');
        });
    });

    describe('getEcoScoreMock()', () => {
        test('returns 92 for very low footprint (\u2264 3.0)', () => {
            expect(getEcoScoreMock(2.5)).toBe(92);
        });

        test('returns 78 for low footprint (\u2264 4.5)', () => {
            expect(getEcoScoreMock(4.0)).toBe(78);
        });

        test('returns 62 for moderate footprint (\u2264 6.5)', () => {
            expect(getEcoScoreMock(6.0)).toBe(62);
        });

        test('returns 45 for high footprint (\u2264 9.0)', () => {
            expect(getEcoScoreMock(7.83)).toBe(45);
        });

        test('returns 28 for very high footprint (> 9.0)', () => {
            expect(getEcoScoreMock(28.13)).toBe(28);
        });

        test('returns 92 at exact boundary value of 3.0', () => {
            expect(getEcoScoreMock(3.0)).toBe(92);
        });
    });
});
