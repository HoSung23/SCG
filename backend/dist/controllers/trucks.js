import * as db from '../utils/database.js';
export async function listTrucks(req, res) {
    try {
        const trucks = await db.getAllTrucks();
        res.json(trucks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trucks' });
    }
}
export async function getTruck(req, res) {
    try {
        const truck = await db.getTruckById(req.params.id);
        res.json(truck);
    }
    catch (error) {
        res.status(404).json({ error: 'Truck not found' });
    }
}
export async function createTruck(req, res) {
    try {
        const { plate, model, year, fuelKmPerGallon, ownershipType } = req.body;
        if (!plate || !model || !year || !fuelKmPerGallon) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const truck = {
            plate,
            model,
            year,
            fuelKmPerGallon,
            ownershipType: ownershipType || 'propia',
            status: 'active'
        };
        const newTruck = await db.createTruck(truck);
        res.status(201).json(newTruck);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create truck' });
    }
}
export async function updateTruck(req, res) {
    try {
        const updatedTruck = await db.updateTruck(req.params.id, req.body);
        res.json(updatedTruck);
    }
    catch (error) {
        res.status(404).json({ error: 'Truck not found' });
    }
}
export async function deleteTruck(req, res) {
    try {
        await db.updateTruck(req.params.id, { status: 'retired' });
        res.json({ message: 'Truck marked as retired' });
    }
    catch (error) {
        res.status(404).json({ error: 'Truck not found' });
    }
}
//# sourceMappingURL=trucks.js.map