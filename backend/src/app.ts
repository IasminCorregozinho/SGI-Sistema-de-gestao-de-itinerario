// App Configuration
// * Configura a aplicação Express, middlewares e rotas principais.

import express from 'express';
import ativoRoutes from './routes/ativoRoutes';
import path from 'path';
import userRoutes from './routes/userRoutes';
import cors from 'cors';


const app = express();

// Configuração de Middlewares
// CORS, JSON Parser e Arquivos Estáticos
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Definição de Rotas
app.use('/ativos', ativoRoutes);
app.use('/users', userRoutes);

export default app;
