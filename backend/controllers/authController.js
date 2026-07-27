// controllers/authController.js
import User from '../models/User.js'; // Importamos el modelo de Usuario
import generateToken from '../utils/generateToken.js'; // Importamos la función del Token

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Comprobar si el usuario o email ya existen
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario o el email ya están registrados' });
    }

    // 2. Crear el nuevo usuario (el cifrado de clave se hace solo en User.js)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Plantilla Mañana', // Si no manda rol, se asigna 'Plantilla Mañana' por defecto
    });

    // 3. Responder con los datos públicos del usuario + su Token JWT
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Autenticar usuario y obtener token (Login)
// @route   POST /api/auth/login
// @access  Público
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar el usuario por su email
    const user = await User.findOne({ email });

    // 2. Verificar que el usuario existe Y que la contraseña coincide
    // (usamos el método matchPassword que creamos en el modelo User.js)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas (email o contraseña incorrectos)' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};