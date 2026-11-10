import { Router } from 'express';
import { listarProveedores, crearOrden, aprobarOrden } from '../controllers/ordenes.controller.js';
export const ordenesRouter = Router();
ordenesRouter.get('/proveedores', listarProveedores);
ordenesRouter.post('/ordenes', crearOrden);
ordenesRouter.post('/ordenes/:id/aprobar', aprobarOrden);
