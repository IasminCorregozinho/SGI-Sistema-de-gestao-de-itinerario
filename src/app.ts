import express from 'express';
import ativoRoutes from './routes/ativoRoutes';
import path from 'path'; 

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/ativos', ativoRoutes);

export default app;