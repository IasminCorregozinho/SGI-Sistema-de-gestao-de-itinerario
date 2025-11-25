import express from 'express';
import ativoRoutes from './routes/ativoRoutes';

const app = express();

app.use(express.json());
app.use('/ativos', ativoRoutes);

export default app;