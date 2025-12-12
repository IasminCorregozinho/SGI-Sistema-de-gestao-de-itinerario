import app from './app';
console.log('Iniciando servidor...');
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor SGI rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
