import * as db from '../utils/database.js';
export async function listCostRecords(req, res) {
    try {
        const records = await db.getAllCostRecords();
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cost records' });
    }
}
export async function getCostsByCategory(req, res) {
    try {
        const records = await db.getAllCostRecords();
        const byCategoryByMonth = {};
        records.forEach((record) => {
            const date = new Date(record.recordedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!byCategoryByMonth[record.category]) {
                byCategoryByMonth[record.category] = {};
            }
            if (!byCategoryByMonth[record.category][monthKey]) {
                byCategoryByMonth[record.category][monthKey] = 0;
            }
            byCategoryByMonth[record.category][monthKey] += record.amountGtq;
        });
        res.json(byCategoryByMonth);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cost summary' });
    }
}
export async function recordCost(req, res) {
    try {
        const { category, description, amountGtq, relatedTruckId, relatedPilotId, notes } = req.body;
        if (!category || !description || !amountGtq) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const record = {
            category,
            description,
            amountGtq,
            relatedTruckId,
            relatedPilotId,
            recordedAt: new Date().toISOString(),
            notes
        };
        const newRecord = await db.createCostRecord(record);
        res.status(201).json(newRecord);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to record cost' });
    }
}
//# sourceMappingURL=costs.js.map