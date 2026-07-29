// controllers/authController.js
import User from '../models/User.js'; // Importamos el modelo de Usuario
import generateToken from '../utils/generateToken.js'; // Importamos la función del Token

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Comprobar si el usuario o email ya existen
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario o el email ya están registrados' });
    }

    // Crear el nuevo usuario (el cifrado de clave se hace solo en User.js)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Plantilla Mañana', // Si no manda rol, se asigna 'Plantilla Mañana' por defecto
    });

    //  Responder con los datos públicos del usuario + su Token JWT
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

    // Buscar el usuario por email O por username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    // Verificar que el usuario existe Y que la contraseña coincide
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

// @desc    Verificar si existe un nombre de usuario en el sistema CLI
// @route   POST /api/auth/verify-user
// @access  Público
export const verifyUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: `El operador '${username}' no está registrado en el sistema` });
    }

    res.json({
      exists: true,
      username: user.username,
      role: user.role,
      message: `Operador identificado. Introduzca clave de acceso para ${user.role}.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al verificar usuario', error: error.message });
  }
};