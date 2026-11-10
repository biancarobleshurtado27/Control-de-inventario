import { Router } from 'express';
import { crearMaterial } from '../controllers/materiales.controller.js';

export const materialesRouter = Router();
materialesRouter.post('/', crearMaterial);
