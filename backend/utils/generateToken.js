// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  // Firmamos el token guardando el ID y el ROL del usuario dentro del payload
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // El token será válido durante 30 días
  });
};

export default generateToken;