import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

dotenv.config(); // Carga las variables de entorno del archivo .env
connectDB(); // Conecta a la base de datos en MongoDB Atlas
const app = express(); // Inicializa la aplicación de Express

// Middlewares globales
app.use(cors()); // Permite la comunicación con el frontend
app.use(express.json()); // Permite recibir datos en formato JSON
app.use('/api/auth', authRoutes); // Agregamos la ruta
app.use('/api/employees', employeeRoutes); // Agregamos la ruta

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando correctamente en la CLI Backend.");
});

// Arranca el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});