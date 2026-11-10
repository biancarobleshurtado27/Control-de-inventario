import { Router } from 'express';
import { comprobarSalud, listarMateriales, listarUbicaciones, consultarStock, listarAlertas } from '../controllers/sistema.controller.js';
export const sistemaRouter = Router();
sistemaRouter.get('/salud', comprobarSalud);
sistemaRouter.get('/materiales', listarMateriales);
sistemaRouter.get('/ubicaciones', listarUbicaciones);
sistemaRouter.get('/stock', consultarStock);
sistemaRouter.get('/alertas/reorden', listarAlertas);
