import { exigirJson } from '../middlewares/exigirJson.js';
import { validarMaterial } from '../middlewares/validarMaterial.js';
import { Router } from 'express';
import { crearMaterial, consultarMaterial, actualizarMaterial } from '../controllers/materiales.controller.js';

export const materialesRouter = Router();
materialesRouter.post('/', exigirJson, validarMaterial, crearMaterial);

import {validarId} from '../middlewares/validarId.js';
materialesRouter.get('/:id',validarId,consultarMaterial);
materialesRouter.put('/:id',validarId,exigirJson,validarMaterial,actualizarMaterial);
