import * as db from '../utils/database.js';
export async function listPilots(req, res) {
    try {
        const pilots = await db.getAllPilots();
        res.json(pilots);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch pilots' });
    }
}
export async function getPilot(req, res) {
    try {
        const pilot = await db.getPilotById(req.params.id);
        res.json(pilot);
    }
    catch (error) {
        res.status(404).json({ error: 'Pilot not found' });
    }
}
export async function createPilot(req, res) {
    try {
        const { name, licenseType, licenseNumber, licenseDue, phoneNumber, email } = req.body;
        if (!name || !licenseType || !licenseNumber || !licenseDue) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const pilot = {
            name,
            licenseType,
            licenseNumber,
            licenseDue,
            licenseStatus: new Date(licenseDue) > new Date() ? 'valid' : 'expired',
            status: 'active',
            phoneNumber,
            email
        };
        const newPilot = await db.createPilot(pilot);
        res.status(201).json(newPilot);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create pilot' });
    }
}
export async function updatePilot(req, res) {
    try {
        const updatedPilot = await db.updatePilot(req.params.id, req.body);
        res.json(updatedPilot);
    }
    catch (error) {
        res.status(404).json({ error: 'Pilot not found' });
    }
}
export async function assignTruckToPilot(req, res) {
    try {
        const { truckId } = req.body;
        if (!truckId) {
            res.status(400).json({ error: 'truckId is required' });
            return;
        }
        const updatedPilot = await db.updatePilot(req.params.id, { assignedTruckId: truckId });
        res.json(updatedPilot);
    }
    catch (error) {
        res.status(404).json({ error: 'Pilot not found' });
    }
}
//# sourceMappingURL=pilots.js.map