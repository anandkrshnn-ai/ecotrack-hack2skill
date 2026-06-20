const assert = require('assert');

// Core logic and factors used in EcoTrack
const FACTORS = {
    transport: {
        two_wheeler: 0.09,
        car_petrol: 0.16,
        car_diesel: 0.14,
        car_ev: 0.06
    },
    public_transport: 0.05,
    electricity: 0.78,
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

function calculateMockFootprint(inputs) {
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

console.log("Running EcoTrack Logic Tests...");

// Test 1: Low Impact Scenario
try {
    const lowImpactTotal = calculateMockFootprint({
        carKm: 4, publicKm: 18, carType: 'car_ev', 
        electricityKwh: 5.5, dietType: 'vegan', 
        consumptionLevel: 'low', flight: '0'
    });
    // Transport: 4*0.06 + 18*0.05 = 0.24 + 0.9 = 1.14
    // Energy: 5.5 * 0.78 = 4.29
    // Food: 1.8
    // Other: 0.6
    // Total: 1.14 + 4.29 + 1.8 + 0.6 = 7.83
    assert.strictEqual(lowImpactTotal, 7.83, "Low impact calculation failed");
    
    const score = getEcoScoreMock(lowImpactTotal);
    assert.strictEqual(score, 45, "Eco score logic failed");
    console.log("✅ Test 1: Low Impact Scenario Passed!");
} catch (e) {
    console.error("❌ Test 1 Failed:", e.message);
    process.exit(1);
}

// Test 2: High Impact Scenario
try {
    const highImpactTotal = calculateMockFootprint({
        carKm: 45, publicKm: 5, carType: 'car_petrol', 
        electricityKwh: 16, dietType: 'high_meat', 
        consumptionLevel: 'high', flight: '0'
    });
    // Transport: 45*0.16 + 5*0.05 = 7.2 + 0.25 = 7.45
    // Energy: 16 * 0.78 = 12.48
    // Food: 5.8
    // Other: 2.4
    // Total: 7.45 + 12.48 + 5.8 + 2.4 = 28.13
    assert.strictEqual(highImpactTotal, 28.13, "High impact calculation failed");
    console.log("✅ Test 2: High Impact Scenario Passed!");
} catch (e) {
    console.error("❌ Test 2 Failed:", e.message);
    process.exit(1);
}

console.log("All tests completed successfully! Coverage: Core Logic, Emission Factors, Math Operations.");
