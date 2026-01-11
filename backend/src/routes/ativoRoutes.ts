import { Router } from "express";
import * as ativoController from "../controllers/ativoController";

const router = Router();

// RF001: Permitir que usuários com perfil autorizado (Suporte e Coordenação) realizem a inclusão, edição e consulta de ativos de TI.
// Perfil 1 = Suporte, 2 = Coordenação
const ALLOWED_PROFILES = [1, 2];

router.post("/", ativoController.criar);
router.patch("/:id", ativoController.editar);
router.get("/", ativoController.listar);
router.get("/dashboard-kpis", ativoController.obterDadosDashboard);
router.get("/movimentacoes-recentes", ativoController.obterMovimentacoes);
router.post("/tipos", ativoController.criarTipo);
router.get("/status", ativoController.listarStatus);
router.get("/tipos", ativoController.listarTiposAtivo);
router.post("/localizacoes", ativoController.criarLocalizacao);
router.get("/localizacoes", ativoController.listarLocalizacoes);
router.get("/:id/historico", ativoController.listarHistorico);

export default router;
