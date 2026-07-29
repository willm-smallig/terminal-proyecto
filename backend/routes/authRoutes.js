// routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { verifyUsername } from '../controllers/authController.js';

const router = express.Router();

// Enlazar las URLs con las funciones del controlador
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-user', verifyUsername);
export default router;