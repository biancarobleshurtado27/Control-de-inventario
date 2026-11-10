import { exigirJson } from '../middlewares/exigirJson.js';
import { validarMovimiento } from '../middlewares/validarMovimiento.js';
import { Router } from 'express';
import { registrarMovimiento, listarMovimientos } from '../controllers/movimientos.controller.js';

export const movimientosRouter = Router();
movimientosRouter.post('/', exigirJson, validarMovimiento, registrarMovimiento);
movimientosRouter.get('/', listarMovimientos);
