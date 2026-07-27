// routes/employeeRoutes.js
import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// TODAS las rutas de empleados requieren estar autenticado (middleware protect)
router.use(protect);

// Ruta raíz: GET (Listar todos) / POST (Crear nuevo)
router
  .route('/')
  .get(getEmployees) // Accesible por cualquier empleado autenticado
  .post(authorizeRoles('Encargado Plantilla'), createEmployee); // Solo 'Encargado Plantilla'

// Ruta por ID: GET (Ver uno) / PUT (Editar) / DELETE (Eliminar)
router
  .route('/:id')
  .get(getEmployeeById) // Ver ficha individual de empleado
  .put(authorizeRoles('Encargado Plantilla', 'Manejador Horarios'), updateEmployee) // Edición con políticas
  .delete(authorizeRoles('Encargado Plantilla'), deleteEmployee); // Solo 'Encargado Plantilla'

export default router;