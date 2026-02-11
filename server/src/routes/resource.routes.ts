import express from 'express';
import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    trackResourceUsage
} from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getResources);
router.post('/', createResource);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);
router.post('/:id/track', trackResourceUsage);

export default router;
