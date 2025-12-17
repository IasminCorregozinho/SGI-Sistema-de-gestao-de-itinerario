import express from 'express';
import ativoRoutes from './routes/ativoRoutes';
import path from 'path'; 
import userRoutes from './routes/userRoutes';
import cors from 'cors';


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/ativos', ativoRoutes);
app.use('/users', userRoutes);

export default app;
    