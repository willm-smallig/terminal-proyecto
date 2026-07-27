// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Importamos User para verificar la identidad

// 1. Proteger rutas: Comprueba que el usuario está logueado y trae un JWT válido
export const protect = async (req, res, next) => {
  let token;

  // Los tokens profesionales se envían en la cabecera 'Authorization' como 'Bearer <TOKEN>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraemos el token quitando la palabra 'Bearer '
      token = req.headers.authorization.split(' ')[1];

      // Decodificamos el token usando nuestra clave secreta del .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscamos al usuario en la BD por el ID del token y lo adjuntamos a la petición (req.user)
      // Usamos .select('-password') para EXCLUIR la contraseña por seguridad
      req.user = await User.findById(decoded.id).select('-password');

      // next() le dice a Express: "Todo ok, pasa al siguiente paso/controlador"
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token fallido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó ningún token' });
  }
};

// 2. Control de Roles: Verifica si el rol del usuario está entre los permitidos
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user fue inyectado previamente por el middleware protect
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado: El rol '${req.user?.role}' no tiene permisos para esta acción`,
      });
    }
    next();
  };
};