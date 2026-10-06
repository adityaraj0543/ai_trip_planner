import { Router } from 'express';
import { createTrip, deleteTrip, getTrip, listTrips, updateTrip } from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/', listTrips);
router.post('/', createTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
