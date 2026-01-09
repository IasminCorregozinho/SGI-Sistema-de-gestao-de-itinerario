import app from "./app";
import { pool } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
// Função de inicialização para usar async/await

async function iniciarServidor() {
  console.log("Tentando conectar ao banco de dados...");

  try {
    // Teste simples: pede a hora atual para o banco
    await pool.query("SELECT NOW()");
    console.log("[SUCESSO] Conexão com Banco de Dados.");

    // Só inicia o Express se o banco respondeu
    app.listen(PORT, () => {
      console.log(`Servidor SGI rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[ERRO] Não foi possível conectar ao banco de dados.");
    console.error("Detalhes do erro:", error);
    // Encerra o processo com erro para não ficar rodando instável
    process.exit(1);
  }
}

iniciarServidor();
