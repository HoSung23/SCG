import * as db from '../utils/database.js';
export async function listTrips(req, res) {
    try {
        const trips = await db.getAllTrips();
        res.json(trips);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
}
export async function getTrip(req, res) {
    try {
        const trip = await db.getTripById(req.params.id);
        res.json(trip);
    }
    catch (error) {
        res.status(404).json({ error: 'Trip not found' });
    }
}
export async function createTrip(req, res) {
    try {
        const { truckId, pilotId, origin, destination, distanceKm, estimatedTimeHours, notes } = req.body;
        if (!truckId || !pilotId || !origin || !destination || !distanceKm) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const trip = {
            truckId,
            pilotId,
            origin,
            destination,
            distanceKm,
            estimatedTimeHours: estimatedTimeHours || 4,
            status: 'programado',
            notes
        };
        const newTrip = await db.createTrip(trip);
        res.status(201).json(newTrip);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create trip' });
    }
}
export async function updateTripStatus(req, res) {
    try {
        const { status } = req.body;
        if (!status) {
            res.status(400).json({ error: 'status is required' });
            return;
        }
        const updates = { status };
        if (status === 'en-ruta') {
            updates.startedAt = new Date().toISOString();
        }
        else if (status === 'completado') {
            updates.completedAt = new Date().toISOString();
        }
        const updatedTrip = await db.updateTrip(req.params.id, updates);
        res.json(updatedTrip);
    }
    catch (error) {
        res.status(404).json({ error: 'Trip not found' });
    }
}
//# sourceMappingURL=trips.js.map