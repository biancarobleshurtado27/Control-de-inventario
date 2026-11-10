import { validarId } from '../middlewares/validarId.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { validarOrden } from '../middlewares/validarOrden.js';
import { Router } from 'express';
import { listarProveedores, crearOrden, aprobarOrden } from '../controllers/ordenes.controller.js';
export const ordenesRouter = Router();
ordenesRouter.get('/proveedores', listarProveedores);
ordenesRouter.post('/ordenes', exigirJson, validarOrden, crearOrden);
ordenesRouter.post('/ordenes/:id/aprobar', validarId, aprobarOrden);
