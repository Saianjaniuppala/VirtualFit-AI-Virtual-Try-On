import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import stylist from './routes/stylist.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/stylist', stylist);
app.listen(process.env.PORT || 5000, () => console.log('VirtualFit API up'));
