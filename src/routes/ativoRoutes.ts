import { Router } from 'express';
import * as ativoController from '../controllers/ativoController';

const router = Router();

router.post('/', ativoController.criar);
router.put('/:id', ativoController.editar);

export default router;