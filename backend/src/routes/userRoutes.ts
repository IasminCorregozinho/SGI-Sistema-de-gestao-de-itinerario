import { Router } from "express";
import { cadastrar, autenticar, criarPerfil, removerPerfil, listarPerfis, atualizarPerfil } from "../controllers/userController";

const router = Router();

router.post("/register", cadastrar);
router.post("/login", autenticar);

// Rotas de Perfil
// RF002: Permitir que usuários com "Perfil 2: Coordenação de Administração de TI" realizem a inclusão e exclusão de perfis
const COORDINATION_PROFILE_ID = 2;

router.post("/perfis", criarPerfil);
router.patch("/perfis/:id", atualizarPerfil);
router.delete("/perfis/:id", removerPerfil);
router.get("/perfis", listarPerfis);

export default router;