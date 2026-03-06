import { Router } from 'express';
import { createPool, getPools } from '../controllers/pools.controller.js';

const router = Router();

router.post('/', createPool);
router.get('/', getPools);

export default router;
