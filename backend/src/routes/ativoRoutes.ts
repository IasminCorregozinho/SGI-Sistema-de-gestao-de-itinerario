import { Router } from 'express';
import * as ativoController from '../controllers/ativoController';

const router = Router();

// RF001: Permitir que usuários com perfil autorizado (Suporte e Coordenação) realizem a inclusão, edição e consulta de ativos de TI.
// Assumindo Perfil 1 = Suporte, 2 = Coordenação
const ALLOWED_PROFILES = [1, 2];

router.post('/', ativoController.criar);
router.put('/:id', ativoController.editar);
// Adicionando rota GET para "consulta"
router.get('/', ativoController.listar);

export default router;