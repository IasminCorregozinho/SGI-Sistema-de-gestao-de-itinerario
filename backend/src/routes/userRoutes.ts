import { Router } from "express";
import { register, login, createProfile, removeProfile, listProfiles } from "../controllers/userController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Rotas de Perfil
// RF002: Permitir que usuários com "Perfil 2: Coordenação de Administração de TI" realizem a inclusão e exclusão de perfis
const COORDINATION_PROFILE_ID = 2;

router.post("/perfis", createProfile);
router.delete("/perfis/:id", removeProfile);
router.get("/perfis", listProfiles);

export default router;