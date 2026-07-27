import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config(); // Carga las variables de entorno del archivo .env
connectDB(); // Conecta a la base de datos en MongoDB Atlas
const app = express(); // Inicializa la aplicación de Express

// Middlewares globales
app.use(cors()); // Permite la comunicación con el frontend
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("API funcionando correctamente en la CLI Backend.");
});

// 6. Arranca el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});