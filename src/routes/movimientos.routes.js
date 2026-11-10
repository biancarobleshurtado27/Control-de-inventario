import { Router } from 'express';
import { registrarMovimiento, listarMovimientos } from '../controllers/movimientos.controller.js';

export const movimientosRouter = Router();
movimientosRouter.post('/', registrarMovimiento);
movimientosRouter.get('/', listarMovimientos);
