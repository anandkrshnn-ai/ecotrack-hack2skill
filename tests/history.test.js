const { getHistory, saveHistory, clearHistory, deleteHistoryEntry } = require('../js/history.js');

describe('History Management (localStorage)', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        global.confirm = () => true;
        global.trendChartInstance = null;
        global.Chart = class { destroy() {} };
        document.body.innerHTML = `
            <table><tbody id="history-table-body"></tbody></table>
            <span id="total-entries"></span>
            <span id="streak-value"></span>
            <span id="avg-7day"></span>
            <canvas id="trend-chart"></canvas>
        `;
    });

    it('should return an empty array if history is empty or invalid', () => {
        expect(getHistory()).toEqual([]);
        localStorage.setItem('ecotrack_history', 'invalid-json');
        expect(getHistory()).toEqual([]);
    });

    it('should save and retrieve history correctly', () => {
        const mockHistory = [
            { date: '2026-06-20', total: 5.5, breakdown: { transport: 2, energy: 2, food: 1, other: 0.5 } }
        ];
        saveHistory(mockHistory);
        const retrieved = getHistory();
        expect(retrieved).toHaveLength(1);
        expect(retrieved[0].total).toBe(5.5);
    });

    it('should clear all history', () => {
        saveHistory([{ date: '2026-06-20', total: 5.5 }]);
        clearHistory();
        expect(getHistory()).toEqual([]);
    });

    it('should delete a specific history entry by date', () => {
        
        saveHistory([
            { date: '2026-06-20', total: 5.5, breakdown: { transport: 1, energy: 1, food: 1, other: 1 } },
            { date: '2026-06-21', total: 4.0, breakdown: { transport: 1, energy: 1, food: 1, other: 1 } }
        ]);
        
        deleteHistoryEntry(0, '2026-06-20');
        const updated = getHistory();
        
        expect(updated).toHaveLength(1);
        expect(updated[0].date).toBe('2026-06-21');
    });
});
