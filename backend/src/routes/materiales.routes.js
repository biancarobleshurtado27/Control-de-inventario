import { exigirJson } from '../middlewares/exigirJson.js';
import { validarMaterial } from '../middlewares/validarMaterial.js';
import { Router } from 'express';
import { crearMaterial } from '../controllers/materiales.controller.js';

export const materialesRouter = Router();
materialesRouter.post('/', exigirJson, validarMaterial, crearMaterial);
