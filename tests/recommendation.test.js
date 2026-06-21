const { generateRecommendations } = require('../js/calculator.js');

describe('Recommendation Engine Logic', () => {
    it('should return high impact mobility recommendation if transport > 38%', () => {
        const breakdown = { transport: 4, energy: 2, food: 2, other: 1 }; // Total 9, Transport is 44%
        const total = 9;
        const recs = generateRecommendations(breakdown, total);
        
        const transportRec = recs.find(r => r.icon === 'fa-car-side');
        expect(transportRec).toBeDefined();
        expect(transportRec.impact).toBe('High');
        expect(transportRec.title).toBe('Mobility is your top lever');
    });

    it('should return plant-forward recommendation if food > 42% or > 4.2kg', () => {
        const breakdown = { transport: 2, energy: 2, food: 4.5, other: 1 }; 
        const total = 9.5;
        const recs = generateRecommendations(breakdown, total);
        
        const foodRec = recs.find(r => r.icon === 'fa-utensils');
        expect(foodRec).toBeDefined();
        expect(foodRec.impact).toBe('High');
    });

    it('should return positive inspiration if total < 4.2kg', () => {
        const breakdown = { transport: 1, energy: 1, food: 1, other: 1 };
        const total = 4.0;
        const recs = generateRecommendations(breakdown, total);
        
        const inspireRec = recs.find(r => r.impact === 'Inspire');
        expect(inspireRec).toBeDefined();
        expect(inspireRec.title).toBe("You're already doing great!");
    });

    it('should return high impact day action if total > 8kg', () => {
        const breakdown = { transport: 5, energy: 2, food: 2, other: 1 };
        const total = 10.0;
        const recs = generateRecommendations(breakdown, total);
        
        const actionRec = recs.find(r => r.impact === 'Action');
        expect(actionRec).toBeDefined();
        expect(actionRec.title).toBe('High impact day — focus on 1 change');
    });

    it('should return a default waste recommendation if no other triggers hit', () => {
        const breakdown = { transport: 1, energy: 1, food: 1, other: 1 }; // Even split, low total
        const total = 4.0;
        const recs = generateRecommendations(breakdown, total);
        
        const defaultRec = recs.find(r => r.icon === 'fa-recycle');
        expect(defaultRec).toBeDefined();
        expect(defaultRec.title).toBe('Segregate & reduce waste');
    });
});
