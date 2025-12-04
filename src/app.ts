import express from 'express';
import ativoRoutes from './routes/ativoRoutes';
import userRoutes from './routes/userRoutes';
const app = express();

app.use(express.json());
app.use('/ativos', ativoRoutes);
app.use('/users', userRoutes);

export default app;