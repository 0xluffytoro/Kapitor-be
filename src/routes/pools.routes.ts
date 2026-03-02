import { Router } from 'express';
import { createPool } from '../controllers/pools.controller.js';

const router = Router();
router.post('/', createPool);

export default router;
