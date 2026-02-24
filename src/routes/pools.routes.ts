import { Router } from 'express';
import { createPool } from '../controllers/pools.controller';

const router = Router();
router.post('/', createPool);

export default router;
