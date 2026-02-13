import { Router } from 'express';
import { getDetails } from '../controllers/user.controller';

const router = Router();

router.get('/details', getDetails);

export default router;
