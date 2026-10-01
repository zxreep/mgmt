import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { bootstrap } from './utils/bootstrap.js';
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import dashboardRoutes from './routes/dashboard.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import settingRoutes from './routes/settings.js';
import { notFound,errorHandler } from './middleware/error.js';

if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<24) throw new Error('JWT_SECRET must be set and at least 24 characters');
await connectDB(); await bootstrap();
const app=express(), __dirname=path.dirname(fileURLToPath(import.meta.url));
app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:false})); app.use(express.json({limit:'1mb'})); app.use(cookieParser()); app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.use('/api/auth',authRoutes); app.use('/api/leads',leadRoutes); app.use('/api/dashboard',dashboardRoutes); app.use('/api/messages',messageRoutes); app.use('/api/admin',adminRoutes); app.use('/api/settings',settingRoutes);
if(process.env.NODE_ENV==='production'){
 const dist=path.resolve(__dirname,'../dist'); app.use(express.static(dist)); app.get(/^(?!\/api).*/,(_,res)=>res.sendFile(path.join(dist,'index.html')));
}
app.use(notFound);app.use(errorHandler);
const port=process.env.PORT||5000;app.listen(port,'0.0.0.0',()=>console.log(`SalesPulse listening on ${port}`));
