import { Router } from 'express';
import { detectarDuplicados, consultarTrazabilidad, listarUsuarios, listarOrdenes } from '../controllers/consultas.controller.js';

export const consultasRouter = Router();
consultasRouter.get('/ordenes/posibles-duplicados', detectarDuplicados);
consultasRouter.get('/materiales/:id/trazabilidad', consultarTrazabilidad);
consultasRouter.get('/usuarios', listarUsuarios);
consultasRouter.get('/ordenes', listarOrdenes);
